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
import SmartNoteEditor from '../components/notes/SmartNoteEditor'
import NoteEditorHeader from '../components/notes/NoteEditorHeader'
import SaveStatusIndicator from '../components/notes/SaveStatusIndicator'
import { EllipsisVertical } from 'lucide-react'
import ThemedButton from '../components/notebooks/ThemedButton'
import { navigate } from '../utils/f7navigate'
import queryClient from '../queryClient'
import useWakeLock from '../hooks/useWakeLock'
import styles from './NoteEditorPage.module.css'

const DEBOUNCE_MS = 800
const COUNTDOWN_START = 5
const DEFAULT_SMART_TITLE = 'Sin título'

export default function NoteEditorPage({ f7route }) {
  const notebookId = f7route?.params?.notebookId
  const noteId = f7route?.params?.noteId

  const { data: noteData, isLoading, isPending, isError, fetchStatus } = useNote(notebookId, noteId)
  const note = noteData?.data
  const { data: notebook } = useNotebook(notebookId)

  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [saveStatus, setSaveStatus] = useState('saved')
  const [smartPreview, setSmartPreview] = useState(true)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)
  const [dismissNoteError, setDismissNoteError] = useState(false)

  const deletedRef = useRef(false)
  const pendingNavRef = useRef(false)
  const deleteOpenRef = useRef(false)
  deleteOpenRef.current = deleteOpen

  const debounceRef = useRef(null)
  const contentRef = useRef('')
  const titleRef = useRef('')
  const codeRef = useRef('')
  const dirtyRef = useRef({ content: false, sandboxCode: false })
  const smartInitRef = useRef(false)
  const initializedRef = useRef(false)
  const editorMountedRef = useRef(false)
  const intervalRef = useRef(null)

  const { mutate: updateNote } = useUpdateNote(notebookId, noteId)
  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote(notebookId, noteId)

  // Keep the phone screen on while the note is being viewed/edited.
  const { acquire: acquireWakeLock, release: releaseWakeLock } = useWakeLock()

  useEffect(() => {
    if (note?.tags !== undefined && !initializedRef.current) {
      setSelectedTagIds(note.tags ?? [])
      initializedRef.current = true
    }
  }, [note?.tags])

  // Seed the smart editor buffers once, from the first note data available
  // (list cache or fresh fetch) — later refetches must not clobber edits.
  useEffect(() => {
    if (note?.type !== 'smart' || smartInitRef.current) return
    smartInitRef.current = true
    titleRef.current = note.content ?? ''
    codeRef.current = note.sandboxCode ?? ''
  }, [note])

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

  // Once the delete is confirmed, drop the note query only when this page goes
  // away. Removing it earlier (e.g. in the mutation's onSuccess) makes useNote
  // re-render into its loading branch while the delete Sheet is still closing,
  // and Framework7 has the Sheet's DOM parked outside the page — React's
  // removeChild then throws and the ErrorBoundary takes over.
  useEffect(() => () => {
    if (!deletedRef.current) return
    queryClient.removeQueries({ queryKey: ['note', notebookId, noteId] })
  }, [])

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

  // ── Smart note flow ─────────────────────────────────────────────────────
  function flushSmart() {
    clearTimeout(debounceRef.current)
    debounceRef.current = null
    const payload = {}
    if (dirtyRef.current.content) {
      payload.content = titleRef.current.trim() || DEFAULT_SMART_TITLE
      dirtyRef.current.content = false
    }
    if (dirtyRef.current.sandboxCode) {
      payload.sandboxCode = codeRef.current
      dirtyRef.current.sandboxCode = false
    }
    if (!Object.keys(payload).length) return
    setSaveStatus('saving')
    updateNote(payload, {
      onSuccess: () => setSaveStatus('saved'),
      onError: () => setSaveStatus('error'),
    })
  }

  function scheduleSmartFlush() {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(flushSmart, DEBOUNCE_MS)
  }

  function handleSmartTitleChange(value) {
    titleRef.current = value
    dirtyRef.current.content = true
    setSaveStatus('editing')
    scheduleSmartFlush()
  }

  function handleSmartCodeChange(value) {
    codeRef.current = value
    dirtyRef.current.sandboxCode = true
    setSaveStatus('editing')
    scheduleSmartFlush()
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
    if (deletedRef.current) return
    if (note?.type === 'smart') {
      flushSmart()
      return
    }
    if (!debounceRef.current) return
    clearTimeout(debounceRef.current)
    debounceRef.current = null
    const content = contentRef.current
    if (content) updateNote({ content: content })
  }

  function handleDeleteConfirm() {
    deleteNote(undefined, {
      onSuccess: () => {
        deletedRef.current = true
        if (deleteOpenRef.current) {
          // Navigate only after the Sheet has fully closed. Framework7 returns
          // the Sheet's DOM node to the page when the close animation ends
          // (~300ms); navigating before that unmounts this page while the node
          // is still parked outside the React tree (removeChild crash + a
          // stranded invisible sheet element in the app root).
          pendingNavRef.current = true
          setDeleteOpen(false)
        } else {
          // Sheet was already closed (e.g. backdrop tap while deleting).
          navigate(`/notebooks/${notebookId}`)
        }
      },
    })
  }

  if (isPending && fetchStatus === 'paused') {
    return (
      <Page pageContent={false}>
        <Navbar title="Nota" backLink="Atrás" backLinkForce backLinkUrl={`/notebooks/${notebookId}/notes`} />
        <div className={['note-editor-layout', styles.editorLayoutCentered].join(' ')}>
          <p>Sin conexión — no hay datos guardados.</p>
        </div>
      </Page>
    )
  }

  if (isLoading && !note) {
    return (
      <Page pageContent={false}>
        <Navbar title="Nota" backLink="Atrás" backLinkForce backLinkUrl={`/notebooks/${notebookId}/notes`} />
        <div className={['note-editor-layout', styles.editorLayoutCentered].join(' ')}>
          <Preloader size={44} />
        </div>
      </Page>
    )
  }

  if (isError && !note) {
    return (
      <Page pageContent={false}>
        <Navbar title="Nota" backLink="Atrás" backLinkForce backLinkUrl={`/notebooks/${notebookId}/notes`} />
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
    <Page
      pageContent={false}
      onPageBeforeOut={() => { flushPendingSave(); releaseWakeLock() }}
      onPageAfterIn={acquireWakeLock}
    >
      {isError && note && !dismissNoteError && (
        <div style={{ background: '#FEF3C7', borderBottom: '1px solid #F59E0B', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
          <span>Error al cargar. Mostrando datos guardados.</span>
          <span style={{ color: '#92400E', fontWeight: 600, cursor: 'pointer', marginLeft: 12 }} onClick={() => setDismissNoteError(true)}>×</span>
        </div>
      )}
      <Navbar>
        <NavLeft backLink="Atrás" backLinkForce backLinkUrl={`/notebooks/${notebookId}/notes`} />
        <NavTitle>
          <div className={styles.navTitleRow}>
            <span data-undoredo-slot />
            {note?.type === 'smart' && smartPreview ? (
              <button
                type="button"
                className={styles.navEditBtn}
                style={notebook?.color ? { background: notebook.color } : undefined}
                onClick={() => setSmartPreview(false)}
                data-testid="smart-exit-preview"
              >
                Editar
              </button>
            ) : (
              <SaveStatusIndicator status={saveStatus} />
            )}
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
        {note?.type === 'smart' ? (
          <SmartNoteEditor
            key={noteId}
            initialTitle={note?.content ?? ''}
            initialCode={note?.sandboxCode ?? ''}
            onTitleChange={handleSmartTitleChange}
            onCodeChange={handleSmartCodeChange}
            previewOpen={smartPreview}
            onPreviewChange={setSmartPreview}
            notebookColor={notebook?.color}
          />
        ) : (
          <NoteEditor
            key={noteId}
            initialContent={note?.content ?? ''}
            onContentChange={handleContentChange}
            imageUploadHandler={handleImageUpload}
            onDeleteImage={handleDeleteImage}
            notebookColor={notebook?.color}
            saveStatus={saveStatus}
          />
        )}
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
        onSheetClosed={() => {
          setDeleteOpen(false)
          if (pendingNavRef.current) {
            pendingNavRef.current = false
            navigate(`/notebooks/${notebookId}`)
          }
        }}
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
