import React, { useState, useRef, useEffect } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, Button, Actions, ActionsGroup, ActionsButton,
  Sheet, PageContent, f7,
} from 'framework7-react'
import { EllipsisVertical } from 'lucide-react'
import { useCreateNote } from '../hooks/useCreateNote'
import { useNotebook } from '../hooks/useNotebook'
import { useUpdateNote } from '../hooks/useUpdateNote'
import { useDeleteNote } from '../hooks/useDeleteNote'
import { getNote, uploadAttachment, deleteAttachment } from '../api/notes'
import { prepareFileForUpload } from '../utils/compressImage'
import NoteEditor from '../components/notes/NoteEditor'
import NoteEditorHeader from '../components/notes/NoteEditorHeader'
import SaveStatusIndicator from '../components/notes/SaveStatusIndicator'
import ThemedButton from '../components/notebooks/ThemedButton'
import { navigateBack } from '../utils/f7navigate'
import queryClient from '../queryClient'
import styles from './NoteEditorPage.module.css'

const DEBOUNCE_MS = 800
const COUNTDOWN_START = 5

export default function CreateNoteEditorPage({ f7route }) {
  const notebookId = f7route?.params?.notebookId

  const [noteId, setNoteId] = useState(null)
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [saveStatus, setSaveStatus] = useState('saved')
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)

  const contentRef = useRef('')
  const debounceRef = useRef(null)
  const noteIdRef = useRef(null)
  const isCreatingRef = useRef(false)
  const intervalRef = useRef(null)

  const { data: notebook } = useNotebook(notebookId)

  const { mutateAsync: createNote } = useCreateNote(notebookId)

  const updateMutation = useUpdateNote(notebookId, noteId)
  const updateMutateRef = useRef(null)
  updateMutateRef.current = updateMutation.mutate

  const deleteMutation = useDeleteNote(notebookId, noteId)
  const { isPending: isDeleting } = deleteMutation
  const deleteMutateRef = useRef(null)
  deleteMutateRef.current = deleteMutation.mutate

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
    setSaveStatus('editing')
    clearTimeout(debounceRef.current)

    if (!noteIdRef.current) {
      if (!markdown.trim()) return
      if (isCreatingRef.current) return
      isCreatingRef.current = true
      setSaveStatus('saving')
      createNote({ content: markdown, tags: selectedTagIds })
        .then((result) => {
          const id = result?.data?.id
          if (id) {
            noteIdRef.current = id
            setNoteId(id)
            const latest = contentRef.current
            if (latest !== markdown) {
              clearTimeout(debounceRef.current)
              debounceRef.current = setTimeout(() => {
                debounceRef.current = null
                setSaveStatus('saving')
                updateMutateRef.current?.(
                  { content: latest },
                  { onSuccess: () => setSaveStatus('saved'), onError: () => setSaveStatus('error') }
                )
              }, 0)
            } else {
              setSaveStatus('saved')
            }
          }
        })
        .catch(() => setSaveStatus('error'))
        .finally(() => { isCreatingRef.current = false })
      return
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      setSaveStatus('saving')
      updateMutateRef.current?.(
        { content: contentRef.current },
        { onSuccess: () => setSaveStatus('saved'), onError: () => setSaveStatus('error') }
      )
    }, DEBOUNCE_MS)
  }

  function handleTagsConfirm(newTagIds) {
    setSelectedTagIds(newTagIds)
    if (noteIdRef.current) {
      updateMutateRef.current?.({ tags: newTagIds })
    }
  }

  async function handleImageUpload(file) {
    if (!noteIdRef.current) {
      f7.toast.create({
        text: 'Escribe algo antes de insertar imágenes.',
        closeTimeout: 2500,
        position: 'top',
      }).open()
      throw new Error('Note not yet created')
    }
    const prepared = await prepareFileForUpload(file)
    const formData = new FormData()
    formData.append('file', prepared, file.name)
    const result = await uploadAttachment(notebookId, noteIdRef.current, formData)
    await queryClient.invalidateQueries({ queryKey: ['note', notebookId, noteIdRef.current] })
    return result?.data?.fileSrcId ?? ''
  }

  async function handleDeleteImage(fileSrcId) {
    const id = noteIdRef.current
    if (!id) return
    const fresh = await getNote(notebookId, id)
    const attachment = fresh?.data?.attachments?.find(a => a.fileSrcId === fileSrcId)
    if (!attachment) return
    await deleteAttachment(notebookId, id, attachment.id)
    await queryClient.invalidateQueries({ queryKey: ['note', notebookId, id] })
  }

  function flushAndCleanup() {
    if (!debounceRef.current) return
    clearTimeout(debounceRef.current)
    debounceRef.current = null
    const id = noteIdRef.current
    if (!id) return
    const content = contentRef.current
    if (!content.trim()) {
      deleteMutateRef.current?.()
    } else {
      updateMutateRef.current?.({ content: content })
    }
  }

  function handleDeleteConfirm() {
    deleteMutateRef.current?.(undefined, {
      onSuccess: () => {
        setDeleteOpen(false)
        navigateBack()
      },
    })
  }

  const confirmLabel = countdown > 0
    ? `Espera ${countdown}s`
    : isDeleting ? 'Eliminando...' : 'Eliminar'

  return (
    <Page pageContent={false} onPageBeforeOut={flushAndCleanup}>
      <Navbar>
        <NavLeft backLink="Atrás" />
        <NavTitle>
          <div className={styles.navTitleRow}>
            <span data-undoredo-slot />
            <SaveStatusIndicator status={saveStatus} />
          </div>
        </NavTitle>
        {noteId && (
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
        )}
      </Navbar>

      <div className="note-editor-layout">
        <NoteEditorHeader
          notebookId={notebookId}
          selectedTagIds={selectedTagIds}
          onTagsConfirm={handleTagsConfirm}
        />
        <NoteEditor
          initialContent=""
          onContentChange={handleContentChange}
          imageUploadHandler={handleImageUpload}
          onDeleteImage={handleDeleteImage}
          notebookColor={notebook?.color}
          saveStatus={saveStatus}
          autoFocus
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
            <h3 className={styles.deleteHeading}>Eliminar Nota</h3>
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
