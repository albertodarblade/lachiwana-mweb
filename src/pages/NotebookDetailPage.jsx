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
import queryClient from '../queryClient'
import DeleteConfirmDialog from '../components/notebooks/DeleteConfirmDialog'
import NoteCard from '../components/notes/NoteCard'
import NoteEmptyState from '../components/notes/NoteEmptyState'
import { navigate, navigateBack } from '../utils/f7navigate'
import styles from './NotebookDetailPage.module.css'

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
        <Block className={styles.loadingBlock}>
          <Preloader size={44} />
        </Block>
      </Page>
    )
  }

  if (isError || !notebook) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" />
        <Block className={styles.errorBlock}>
          <p className={styles.notFoundText}>Cuaderno no encontrado.</p>
          <span
            className={styles.backLink}
            onClick={() => navigateBack()}
          >
            Volver al inicio
          </span>
        </Block>
      </Page>
    )
  }

  const navbarColor = notebook.color ?? 'var(--f7-theme-color)'

  function handlePageAfterIn() {
    if (queryClient.getQueryState(['notes', id])?.isInvalidated) {
      queryClient.refetchQueries({ queryKey: ['notes', id] })
    }
  }

  return (
    <Page onPageAfterIn={handlePageAfterIn}>
      <Navbar>
        <NavLeft backLink="Atrás" />
        <NavTitle>
          <div className={styles.navTitleInner}>
            <div
              className={styles.iconContainer}
              style={{ '--icon-color': navbarColor }}
            >
              <i className={['f7-icons', styles.navIcon].join(' ')}>
                {notebook.iconName ?? 'book'}
              </i>
            </div>
            <span className={styles.navTitleText}>{notebook.title}</span>
          </div>
        </NavTitle>
        <NavRight>
          <Button
            onClick={() => setActionsOpen(true)}
            className={styles.menuButton}
          >
            <i className="f7-icons">ellipsis_vertical</i>
          </Button>
        </NavRight>
      </Navbar>

      {/* Wrapper div isolates React's insertBefore from F7-teleported siblings (Fab, Actions). */}
      <div>
        {notesLoading && (
          <Block className={styles.notesLoadingBlock}>
            <Preloader size={44} />
          </Block>
        )}

        {!notesLoading && notesError && (
          <Block className={styles.notesErrorBlock}>
            <p className={styles.notesErrorText}>Error al cargar las notas.</p>
            <span
              className={styles.retryLink}
              onClick={() => window.location.reload()}
            >
              Reintentar
            </span>
          </Block>
        )}

        {!notesLoading && !notesError && notes.length === 0 && <NoteEmptyState />}

        {!notesLoading && !notesError && notes.length > 0 && (
          <div>
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} notebookId={id} />
            ))}
          </div>
        )}
      </div>

      <Fab
        position="right-bottom"
        text="Nueva Nota"
        onClick={() => navigate(`/notebooks/${id}/notes/create`)}
        style={{
          '--f7-fab-bg-color': navbarColor,
          '--f7-fab-pressed-bg-color': navbarColor,
          '--f7-fab-text-color': '#fff',
          '--f7-glass-shadow-fab': '0 2px 8px rgba(0,0,0,0.28)',
          '--f7-touch-ripple-color': 'rgba(255,255,255,0.25)',
        }}
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
