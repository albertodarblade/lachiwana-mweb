import React, { useState, useEffect } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, Preloader, Fab, Icon, Link, Badge,
} from 'framework7-react'
import { Book, SlidersHorizontal } from 'lucide-react'
import { LUCIDE_ICONS } from '../components/IconSelector/lucideIcons'
import { useNotebook } from '../hooks/useNotebook'
import { useNotes } from '../hooks/useNotes'
import queryClient from '../queryClient'
import NoteCard from '../components/notes/NoteCard'
import NoteEmptyState from '../components/notes/NoteEmptyState'
import NoteFilterPanel from '../components/notes/NoteFilterPanel'
import { navigate, navigateBack } from '../utils/f7navigate'
import styles from './NotebookDetailPage.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function NotebookDetailPage({ f7route }) {
  const id = f7route?.params?.id
  const routePath = f7route?.path ?? ''
  const { data: notebook, isLoading, isPending, isError, fetchStatus } = useNotebook(id)

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [filters, setFilters] = useState({ content: '', tagIds: new Set() })

  const activeFilterCount =
    (filters.content ? 1 : 0) +
    filters.tagIds.size

  const queryParams = {
    ...(filters.content ? { content: filters.content } : {}),
    ...(filters.tagIds.size ? { tags: [...filters.tagIds] } : {}),
  }

  const { data: notes = [], isPending: notesLoading, isError: notesError, fetchStatus: notesFetchStatus } = useNotes(id, queryParams)

  const notebookTags = notebook?.tags ?? []

  // Fallback redirect for direct /notebooks/:id access (bookmarks, external links).
  useEffect(() => {
    if (!notebook) return
    const onTypedRoute = routePath.endsWith('/notes') || routePath.endsWith('/transactions')
    if (onTypedRoute) return
    if (notebook.type === 'transactions') {
      navigate(`/notebooks/${id}/transactions`)
    } else {
      navigate(`/notebooks/${id}/notes`)
    }
  }, [notebook, id, routePath])

  if (isPending && fetchStatus === 'paused') {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
        <Block className={styles.loadingBlock}>
          <p>Sin conexión — no hay datos guardados.</p>
        </Block>
      </Page>
    )
  }

  if (isLoading) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
        <Block className={styles.loadingBlock}>
          <Preloader size={44} />
        </Block>
      </Page>
    )
  }

  if (isError || !notebook) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
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
    queryClient.invalidateQueries({ queryKey: ['notes', id] })
  }

  return (
    <Page onPageAfterIn={handlePageAfterIn}>
      <Navbar>
        <NavLeft backLink="Atrás" backLinkUrl="/" />
        <NavTitle>
          <div
            className={styles.navTitleInner}
            onClick={() => navigate(`/notebooks/${notebook.id}/edit`)}
            data-testid="notebook-detail-edit"
          >
            <div
              className={styles.iconContainer}
              style={{ '--icon-color': navbarColor }}
            >
              {(() => { const Icon = notebook.iconName ? (lucideMap[notebook.iconName] ?? Book) : Book; return <Icon size={20} className={styles.navIcon} /> })()}
            </div>
            <span className={styles.navTitleText}>{notebook.title}</span>
          </div>
        </NavTitle>
        <NavRight>
          <Link
            onClick={() => setIsFilterPanelOpen(true)}
            className={styles.filterBtn}
            data-testid="notes-filter-open"
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <Badge color="red" className={styles.filterBadge}>{activeFilterCount}</Badge>
            )}
          </Link>
        </NavRight>
      </Navbar>

      <div>
        {notesLoading && notesFetchStatus === 'paused' && (
          <Block className={styles.notesErrorBlock}>
            <p className={styles.notesErrorText}>Sin conexión — mostrando datos guardados.</p>
          </Block>
        )}

        {notesLoading && notesFetchStatus !== 'paused' && (
          <Block className={styles.notesLoadingBlock}>
            <Preloader size={44} />
          </Block>
        )}

        {!notesLoading && notesError && (
          <Block className={styles.notesErrorBlock}>
            <p className={styles.notesErrorText}>Error al cargar las notas.</p>
            <span className={styles.retryLink} onClick={() => window.location.reload()} data-testid="notes-retry">
              Reintentar
            </span>
          </Block>
        )}

        {!notesLoading && !notesError && notes.length === 0 && (
          activeFilterCount > 0
            ? (
              <Block className={styles.notesErrorBlock}>
                <p className={styles.notesErrorText}>Sin resultados para los filtros aplicados.</p>
              </Block>
            )
            : <NoteEmptyState />
        )}

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
        data-testid="note-create-fab"
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

      <NoteFilterPanel
        opened={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        tags={notebookTags}
      />
    </Page>
  )
}
