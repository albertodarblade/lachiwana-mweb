import React, { useState, useEffect, useRef } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, Button, Actions, ActionsGroup, ActionsButton,
  Sheet, PageContent, Preloader, f7,
} from 'framework7-react'
import { useNote } from '../hooks/useNote'
import { useUpdateNote } from '../hooks/useUpdateNote'
import { useDeleteNote } from '../hooks/useDeleteNote'
import { getNote, uploadAttachment, deleteAttachment } from '../api/notes'
import { prepareFileForUpload } from '../utils/compressImage'
import NoteEditor from '../components/notes/NoteEditor'
import NoteEditorHeader from '../components/notes/NoteEditorHeader'
import SaveStatusIndicator from '../components/notes/SaveStatusIndicator'
import { navigate } from '../utils/f7navigate'
import queryClient from '../queryClient'

const DEBOUNCE_MS = 800
const COUNTDOWN_START = 5

export default function NoteEditorPage({ f7route }) {
  const notebookId = f7route?.params?.notebookId
  const noteId = f7route?.params?.noteId

  const { data: noteData, isLoading } = useNote(notebookId, noteId)
  const note = noteData?.data

  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [saveStatus, setSaveStatus] = useState('saved')
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)

  const debounceRef = useRef(null)
  const contentRef = useRef('')
  const initializedRef = useRef(false)
  const editorMountedRef = useRef(false)
  const intervalRef = useRef(null)

  const { mutate: updateNote } = useUpdateNote(notebookId, noteId)
  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote(notebookId, noteId)

  useEffect(() => {
    if (note?.tags !== undefined && !initializedRef.current) {
      setSelectedTagIds(note.tags ?? [])
      initializedRef.current = true
    }
  }, [note?.tags])

  useEffect(() => {
    if (deleteOpen) {
      setCountdown(COUNTDOWN_START)
      intervalRef.current = setInterval(() => {
        setCountdown((n) => {
          if (n <= 1) { clearInterval(intervalRef.current); return 0 }
          return n - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      setCountdown(COUNTDOWN_START)
    }
    return () => clearInterval(intervalRef.current)
  }, [deleteOpen])

  function handleContentChange(markdown) {
    contentRef.current = markdown

    // MDXEditor fires onChange once on mount with the initial content — ignore it.
    if (!editorMountedRef.current) {
      editorMountedRef.current = true
      return
    }

    setSaveStatus('editing')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      setSaveStatus('saving')
      updateNote(
        { title: markdown },
        { onSuccess: () => setSaveStatus('saved'), onError: () => setSaveStatus('error') }
      )
    }, DEBOUNCE_MS)
  }

  function handleTagsConfirm(newTagIds) {
    setSelectedTagIds(newTagIds)
    updateNote({ tags: newTagIds })
  }

  async function handleImageUpload(file) {
    const prepared = await prepareFileForUpload(file)
    const formData = new FormData()
    formData.append('file', prepared, file.name)
    const result = await uploadAttachment(notebookId, noteId, formData)
    await queryClient.invalidateQueries({ queryKey: ['note', notebookId, noteId] })
    return result?.data?.fileSrcId ?? ''
  }

  async function handleDeleteImage(fileSrcId) {
    const fresh = await getNote(notebookId, noteId)
    const attachment = fresh?.data?.attachments?.find(a => a.fileSrcId === fileSrcId)
    if (!attachment) return
    await deleteAttachment(notebookId, noteId, attachment.id)
    await queryClient.invalidateQueries({ queryKey: ['note', notebookId, noteId] })
  }

  function flushPendingSave() {
    if (!debounceRef.current) return
    clearTimeout(debounceRef.current)
    debounceRef.current = null
    const content = contentRef.current
    if (content) updateNote({ title: content })
  }

  function handleDeleteConfirm() {
    deleteNote(undefined, {
      onSuccess: () => {
        setDeleteOpen(false)
        navigate(`/notebooks/${notebookId}`)
      },
    })
  }

  if (isLoading && !note) {
    return (
      <Page pageContent={false}>
        <Navbar title="Nota" backLink="Atrás" />
        <div className="note-editor-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Preloader size={44} />
        </div>
      </Page>
    )
  }

  const confirmLabel = countdown > 0
    ? `Espera ${countdown}s`
    : isDeleting ? 'Eliminando...' : 'Eliminar'

  return (
    <Page pageContent={false} onPageBeforeOut={flushPendingSave}>
      <Navbar>
        <NavLeft backLink="Atrás" />
        <NavTitle><SaveStatusIndicator status={saveStatus} /></NavTitle>
        <NavRight>
          <Button onClick={() => setActionsOpen(true)} style={{ color: 'var(--f7-theme-color)', padding: '0 12px' }}>
            <i className="f7-icons">ellipsis_vertical</i>
          </Button>
        </NavRight>
      </Navbar>

      <div className="note-editor-layout">
        <NoteEditorHeader
          notebookId={notebookId}
          selectedTagIds={selectedTagIds}
          onTagsConfirm={handleTagsConfirm}
          createdAt={note?.createdAt}
        />
        <NoteEditor
          key={noteId}
          initialContent={note?.title ?? ''}
          onContentChange={handleContentChange}
          imageUploadHandler={handleImageUpload}
          onDeleteImage={handleDeleteImage}
        />
      </div>

      <Actions opened={actionsOpen} onActionsClosed={() => setActionsOpen(false)}>
        <ActionsGroup>
          <ActionsButton
            color="red"
            onClick={() => { setActionsOpen(false); setDeleteOpen(true) }}
          >
            Eliminar nota
          </ActionsButton>
        </ActionsGroup>
        <ActionsGroup>
          <ActionsButton bold onClick={() => setActionsOpen(false)}>Cancelar</ActionsButton>
        </ActionsGroup>
      </Actions>

      <Sheet
        opened={deleteOpen}
        onSheetClosed={() => setDeleteOpen(false)}
        style={{ height: 'auto' }}
        swipeToClose={false}
        backdrop
      >
        <PageContent style={{ padding: '24px 16px 40px' }}>
          <Block style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>
              Eliminar Nota
            </h3>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '14px', lineHeight: 1.5 }}>
              ¿Eliminar esta nota? Esta acción eliminará la nota y todos sus archivos.
            </p>
          </Block>

          <Button
            large fill color="red"
            disabled={countdown > 0 || isDeleting}
            onClick={handleDeleteConfirm}
            style={{ marginBottom: '12px' }}
          >
            {confirmLabel}
          </Button>

          <Button large outline disabled={isDeleting} onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
        </PageContent>
      </Sheet>
    </Page>
  )
}
