import React, { useState, useEffect, useRef } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, Button, Actions, ActionsGroup, ActionsButton,
  Sheet, PageContent, Preloader, f7,
} from 'framework7-react'
import { useNote } from '../hooks/useNote'
import { useNotebook } from '../hooks/useNotebook'
import { useUpdateNote } from '../hooks/useUpdateNote'
import { useDeleteNote } from '../hooks/useDeleteNote'
import { getNote, uploadAttachment, deleteAttachment } from '../api/notes'
import { prepareFileForUpload } from '../utils/compressImage'
import NoteEditor from '../components/notes/NoteEditor'
import NoteEditorHeader from '../components/notes/NoteEditorHeader'
import SaveStatusIndicator from '../components/notes/SaveStatusIndicator'
import { EllipsisVertical } from 'lucide-react'
import ThemedButton from '../components/notebooks/ThemedButton'
import { navigate } from '../utils/f7navigate'
import queryClient from '../queryClient'
import styles from './NoteEditorPage.module.css'

const DEBOUNCE_MS = 800
const COUNTDOWN_START = 5

export default function NoteEditorPage({ f7route }) {
  const notebookId = f7route?.params?.notebookId
  const noteId = f7route?.params?.noteId

  const { data: noteData, isLoading, isPending, isError, fetchStatus } = useNote(notebookId, noteId)
  const note = noteData?.data
  const { data: notebook } = useNotebook(notebookId)

  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [saveStatus, setSaveStatus] = useState('saved')
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)
  const [dismissNoteError, setDismissNoteError] = useState(false)

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

    // MDXEditor fires onChange on mount (Lexical batches the import asynchronously).
    // Only skip that fire if the content truly matches what's on the server —
    // if the user typed before the mount fire arrived, the content won't match
    // and we must NOT skip it.
    if (!editorMountedRef.current) {
      editorMountedRef.current = true
      if (markdown === (note?.content ?? '')) return
    }

    setSaveStatus('editing')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      setSaveStatus('saving')
      updateNote(
        { content: markdown },
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
    if (content) updateNote({ content: content })
  }

  function handleDeleteConfirm() {
    deleteNote(undefined, {
      onSuccess: () => {
        setDeleteOpen(false)
        navigate(`/notebooks/${notebookId}`)
      },
    })
  }

  if (isPending && fetchStatus === 'paused') {
    return (
      <Page pageContent={false}>
        <Navbar title="Nota" backLink="Atrás" />
        <div className={['note-editor-layout', styles.editorLayoutCentered].join(' ')}>
          <p>Sin conexión — no hay datos guardados.</p>
        </div>
      </Page>
    )
  }

  if (isLoading && !note) {
    return (
      <Page pageContent={false}>
        <Navbar title="Nota" backLink="Atrás" />
        <div className={['note-editor-layout', styles.editorLayoutCentered].join(' ')}>
          <Preloader size={44} />
        </div>
      </Page>
    )
  }

  if (isError && !note) {
    return (
      <Page pageContent={false}>
        <Navbar title="Nota" backLink="Atrás" />
        <div className={['note-editor-layout', styles.editorLayoutCentered].join(' ')}>
          <p>Error al cargar la nota.</p>
          <Button onClick={() => window.location.reload()} style={{ marginTop: 16 }}>Reintentar</Button>
        </div>
      </Page>
    )
  }

  const confirmLabel = countdown > 0
    ? `Espera ${countdown}s`
    : isDeleting ? 'Eliminando...' : 'Eliminar'

  return (
    <Page pageContent={false} onPageBeforeOut={flushPendingSave}>
      {isError && note && !dismissNoteError && (
        <div style={{ background: '#FEF3C7', borderBottom: '1px solid #F59E0B', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
          <span>Error al cargar. Mostrando datos guardados.</span>
          <span style={{ color: '#92400E', fontWeight: 600, cursor: 'pointer', marginLeft: 12 }} onClick={() => setDismissNoteError(true)}>×</span>
        </div>
      )}
      <Navbar>
        <NavLeft backLink="Atrás" />
        <NavTitle>
          <div className={styles.navTitleRow}>
            <span data-undoredo-slot />
            <SaveStatusIndicator status={saveStatus} />
          </div>
        </NavTitle>
        <NavRight>
          <ThemedButton
            variant="icon"
            color={notebook?.color}
            onClick={() => setActionsOpen(true)}
            data-testid="note-actions-open"
          >
            <EllipsisVertical size={20} />
          </ThemedButton>
        </NavRight>
      </Navbar>

      <div className="note-editor-layout">
        <NoteEditorHeader
          notebookId={notebookId}
          selectedTagIds={selectedTagIds}
          onTagsConfirm={handleTagsConfirm}
        />
        <NoteEditor
          key={noteId}
          initialContent={note?.content ?? ''}
          onContentChange={handleContentChange}
          imageUploadHandler={handleImageUpload}
          onDeleteImage={handleDeleteImage}
          notebookColor={notebook?.color}
          saveStatus={saveStatus}
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
        <PageContent className={styles.deletePageContent}>
          <Block className={styles.deleteBlock}>
            <h3 className={styles.deleteHeading}>
              Eliminar Nota
            </h3>
            <p className={styles.deleteBody}>
              ¿Eliminar esta nota? Esta acción eliminará la nota y todos sus archivos.
            </p>
          </Block>

          <Button
            large fill color="red"
            disabled={countdown > 0 || isDeleting}
            onClick={handleDeleteConfirm}
            className={styles.confirmButton}
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
