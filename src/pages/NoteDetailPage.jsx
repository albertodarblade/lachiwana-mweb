import React, { useState, useEffect, useRef } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  List, ListInput, Block, Button, Actions, ActionsGroup, ActionsButton,
  Sheet, PageContent, Preloader,
} from 'framework7-react'
import { useNote } from '../hooks/useNote'
import { useUpdateNote } from '../hooks/useUpdateNote'
import { useDeleteNote } from '../hooks/useDeleteNote'
import AttachmentGallery from '../components/notes/AttachmentGallery'
import { navigate } from '../utils/f7navigate'

const DEBOUNCE_MS = 800
const COUNTDOWN_START = 5

export default function NoteDetailPage({ f7route }) {
  const notebookId = f7route?.params?.notebookId
  const noteId = f7route?.params?.noteId

  const { data: noteData, isLoading } = useNote(notebookId, noteId)
  const note = noteData?.data

  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)

  const debounceRef = useRef(null)
  const intervalRef = useRef(null)
  const initializedRef = useRef(false)

  const { mutate: updateTitle } = useUpdateNote(notebookId, noteId)
  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote(notebookId, noteId)

  // Initialise title from note data (includes initialData from list cache per FR-018)
  useEffect(() => {
    if (note?.title !== undefined && !initializedRef.current) {
      setTitle(note.title)
      initializedRef.current = true
    }
  }, [note?.title])

  // Countdown for delete dialog
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

  function handleTitleChange(e) {
    const value = e.target.value
    setTitle(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setIsSaving(true)
      updateTitle({ title: value }, {
        onSettled: () => setIsSaving(false),
      })
    }, DEBOUNCE_MS)
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
      <Page>
        <Navbar title="Nota" backLink="Atrás" />
        <Block style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
          <Preloader size={44} />
        </Block>
      </Page>
    )
  }

  const confirmLabel = countdown > 0
    ? `Espera ${countdown}s`
    : isDeleting ? 'Eliminando...' : 'Eliminar'

  return (
    <Page>
      <Navbar>
        <NavLeft backLink="Atrás" />
        <NavTitle>Nota</NavTitle>
        <NavRight>
          <Button onClick={() => setActionsOpen(true)} style={{ color: 'var(--f7-theme-color)', padding: '0 12px' }}>
            <i className="f7-icons">ellipsis_vertical</i>
          </Button>
        </NavRight>
      </Navbar>

      <List>
        <ListInput
          label="Título"
          type="text"
          value={title}
          onInput={handleTitleChange}
          placeholder="Título de la nota"
        />
      </List>

      {isSaving && (
        <Block style={{ paddingTop: 0, paddingBottom: 0 }}>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.5 }}>Guardando…</p>
        </Block>
      )}

      <AttachmentGallery
        notebookId={notebookId}
        noteId={noteId}
        attachments={note?.attachments ?? []}
      />

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
              ¿Eliminar <strong>«{note?.title ?? ''}»</strong>?
              Esta acción eliminará la nota y todos sus archivos.
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
