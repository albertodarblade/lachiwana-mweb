import React from 'react'
import {
  Page, Navbar, NavLeft, NavTitle,
  Block, Preloader, Fab, Icon,
} from 'framework7-react'
import { useNotebook } from '../hooks/useNotebook'
import { useNotes } from '../hooks/useNotes'
import queryClient from '../queryClient'
import NoteCard from '../components/notes/NoteCard'
import NoteEmptyState from '../components/notes/NoteEmptyState'
import { navigate, navigateBack } from '../utils/f7navigate'
import styles from './NotebookDetailPage.module.css'

export default function NotebookDetailPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook, isLoading, isError } = useNotebook(id)
  const { data: notesData, isPending: notesLoading, isError: notesError } = useNotes(id)
  const notes = notesData?.data ?? []

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
          <span className={styles.backLink} onClick={() => navigateBack()}>
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
          <div
            className={styles.navTitleInner}
            onClick={() => navigate(`/notebooks/${notebook.id}/edit`)}
          >
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
      </Navbar>

      <div>
        {notesLoading && (
          <Block className={styles.notesLoadingBlock}>
            <Preloader size={44} />
          </Block>
        )}

        {!notesLoading && notesError && (
          <Block className={styles.notesErrorBlock}>
            <p className={styles.notesErrorText}>Error al cargar las notas.</p>
            <span className={styles.retryLink} onClick={() => window.location.reload()}>
              Reintentar
            </span>
          </Block>
        )}

        {!notesLoading && !notesError && notes.length === 0 && <NoteEmptyState />}

        {!notesLoading && !notesError && notes.length > 0 && (
          <div className={styles.notesGrid}>
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
    </Page>
  )
}
