import React, { useState } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, Preloader, List, Fab, Icon, Actions, ActionsGroup, ActionsButton, f7,
  Button,
} from 'framework7-react'
import { useNotebook } from '../hooks/useNotebook'
import { useDeleteNotebook } from '../hooks/useDeleteNotebook'
import { useNotes } from '../hooks/useNotes'
import { getSession } from '../stores/authStore'
import DeleteConfirmDialog from '../components/notebooks/DeleteConfirmDialog'
import NoteCard from '../components/notes/NoteCard'
import NoteEmptyState from '../components/notes/NoteEmptyState'
import { navigate, navigateBack } from '../utils/f7navigate'

export default function NotebookDetailPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook, isLoading, isError } = useNotebook(id)
  const { data: notesData, isPending: notesLoading, isError: notesError } = useNotes(id)
  const notes = notesData?.data ?? []
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteNotebook()

  const currentUserId = getSession()?.user?.googleId
  const isOwner = notebook?.owner === currentUserId

  function openEdit() {
    setActionsOpen(false)
    navigate(`/notebooks/${notebook.id}/edit`)
  }

  function openDelete() {
    setActionsOpen(false)
    setDeleteDialogOpen(true)
  }

  function handleDeleteConfirm() {
    deleteMutate(notebook.id, {
      onSuccess: () => {
        // Navigate via full page reload — avoids React/F7 DOM conflict from
        // F7 teleporting the Sheet element outside React's component tree.
        window.location.replace('/')
      },
      onError: (err) => {
        f7.toast.create({
          text: err?.message ?? 'Error al eliminar. Intenta de nuevo.',
          closeTimeout: 3000,
          position: 'top',
        }).open()
      },
    })
  }

  if (isLoading) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" />
        <Block style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
          <Preloader size={44} />
        </Block>
      </Page>
    )
  }

  if (isError || !notebook) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" />
        <Block style={{ textAlign: 'center', paddingTop: '60px' }}>
          <p style={{ opacity: 0.6 }}>Cuaderno no encontrado.</p>
          <span
            style={{ color: 'var(--f7-theme-color)', cursor: 'pointer' }}
            onClick={() => navigateBack()}
          >
            Volver al inicio
          </span>
        </Block>
      </Page>
    )
  }

  const navbarColor = notebook.color ?? 'var(--f7-theme-color)'

  return (
    <Page>
      <Navbar
        style={{
          '--f7-navbar-bg-color': navbarColor,
          '--f7-navbar-link-color': '#fff',
          '--f7-navbar-text-color': '#fff',
          '--f7-navbar-subtitle-text-color': '#fff',
        }}
      >
        <NavLeft backLink="Atrás" backLinkColor="white" />
        <NavTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="f7-icons" style={{ color: '#fff', fontSize: '20px' }}>
              {notebook.iconName ?? 'book'}
            </i>
            <span style={{ color: '#fff' }}>{notebook.title}</span>
          </div>
        </NavTitle>
        <NavRight>
          <Button
            onClick={() => setActionsOpen(true)}
            style={{ color: '#fff', padding: '0 12px', cursor: 'pointer' }}
          >
            <i className="f7-icons">ellipsis_vertical</i>
          </Button>
        </NavRight>
      </Navbar>

      {notesLoading && (
        <Block style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
          <Preloader size={44} />
        </Block>
      )}

      {!notesLoading && notesError && (
        <Block style={{ textAlign: 'center', paddingTop: '40px', opacity: 0.6 }}>
          <p style={{ margin: '0 0 12px' }}>Error al cargar las notas.</p>
          <span
            style={{ color: 'var(--f7-theme-color)', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            Reintentar
          </span>
        </Block>
      )}

      {!notesLoading && !notesError && notes.length === 0 && <NoteEmptyState />}

      {!notesLoading && !notesError && notes.length > 0 && (
        <List>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} notebookId={id} />
          ))}
        </List>
      )}

      <Fab
        position="right-bottom"
        text="Nueva Nota"
        onClick={() => navigate(`/notebooks/${id}/notes/create`)}
      >
        <Icon ios="f7:plus" md="material:add" />
      </Fab>

      <Actions opened={actionsOpen} onActionsClosed={() => setActionsOpen(false)}>
        <ActionsGroup>
          <ActionsButton onClick={openEdit}>Editar</ActionsButton>
          {isOwner && (
            <ActionsButton color="red" onClick={openDelete}>Eliminar</ActionsButton>
          )}
        </ActionsGroup>
        <ActionsGroup>
          <ActionsButton bold onClick={() => setActionsOpen(false)}>Cancelar</ActionsButton>
        </ActionsGroup>
      </Actions>

      <DeleteConfirmDialog
        notebook={notebook}
        opened={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Page>
  )
}
