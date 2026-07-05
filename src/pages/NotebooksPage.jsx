import React, { useState } from 'react'
import { CircleUser } from 'lucide-react'
import { Page, Navbar, Block, Preloader, Fab, Icon } from 'framework7-react'
import { useNotebooks } from '../hooks/useNotebooks'
import { getSession } from '../stores/authStore'
import { usePinnedNotebooks } from '../hooks/usePinnedNotebooks'
import NotebookCard from '../components/notebooks/NotebookCard'
import NotebookEmptyState from '../components/notebooks/NotebookEmptyState'
import { navigate } from '../utils/f7navigate'
import styles from './NotebooksPage.module.css'

function UserAvatar() {
  const session = getSession()
  const picture = session?.user?.picture
  const [imgError, setImgError] = useState(false)

  if (picture && !imgError) {
    return (
      <img
        src={picture}
        alt="avatar"
        width={36}
        height={36}
        onError={() => setImgError(true)}
        className={styles.avatar}
      />
    )
  }
  return <CircleUser size={36} className={styles.avatarIcon} />
}

export default function NotebooksPage() {
  const { data, isLoading, isPending, isError, refetch, fetchStatus } = useNotebooks()
  const userId = getSession()?.user?.googleId ?? ''
  const { pins, pinNotebook, unpinNotebook, isPinned } = usePinnedNotebooks(userId)

  const [dismissError, setDismissError] = useState(false)
  const sortedNotebooks = [...(data?.data ?? [])].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  const pinnedMap = Object.fromEntries(pins.map(p => [p.notebookId, p.pinnedDate]))

  const pinnedNotebooks = sortedNotebooks
    .filter(n => pinnedMap[n.id])
    .sort((a, b) => new Date(pinnedMap[b.id]) - new Date(pinnedMap[a.id]))

  const unpinnedNotebooks = sortedNotebooks.filter(n => !pinnedMap[n.id])

  const hasPinned = pinnedNotebooks.length > 0

  function handlePinToggle(notebookId) {
    if (isPinned(notebookId)) {
      unpinNotebook(notebookId)
    } else {
      pinNotebook(notebookId)
    }
  }

  return (
    <Page>
      <Navbar innerClass={styles.navbarInner}>
        <div className={styles.brand}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2L25.26 8.5V21.5L14 28L2.74 21.5V8.5L14 2Z" stroke="#B45309" strokeWidth="2" fill="none"/>
            <path d="M14 8L19.66 11.25V17.75L14 21L8.34 17.75V11.25L14 8Z" stroke="#B45309" strokeWidth="2" fill="none"/>
          </svg>
          <span className={styles.brandName}>Lachiwana</span>
        </div>
        <div className={styles.avatarWrapper} onClick={() => navigate('/settings')} data-testid="navbar-avatar">
          <UserAvatar />
        </div>
      </Navbar>

      {isPending && fetchStatus === 'paused' && (
        <Block className={styles.loadingBlock}>
          <p>Sin conexión — no hay datos guardados.</p>
        </Block>
      )}

      {isLoading && (
        <Block className={styles.loadingBlock}>
          <Preloader size={44} />
        </Block>
      )}

      {isError && sortedNotebooks.length > 0 && !dismissError && (
        <Block className={styles.errorBlock}>
          <p>Error al cargar. Mostrando datos guardados.</p>
          <span
            className={styles.retryLink}
            onClick={() => setDismissError(true)}
          >
            Descartar
          </span>
        </Block>
      )}

      {isError && sortedNotebooks.length === 0 && (
        <Block className={styles.errorBlock}>
          <p>Error al cargar los cuadernos.</p>
          <span
            className={styles.retryLink}
            onClick={() => refetch()}
            data-testid="notebooks-retry"
          >
            Reintentar
          </span>
        </Block>
      )}

      {!isLoading && sortedNotebooks.length === 0 && !isError && <NotebookEmptyState />}

      {!isLoading && sortedNotebooks.length > 0 && (
        <div className={styles.listPadding}>
          {hasPinned && (
            <div className={styles.sectionLabel} data-testid="notebooks-section-pinned">
              Pinned
            </div>
          )}
          {pinnedNotebooks.map((notebook) => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              isPinned={true}
              onPinToggle={handlePinToggle}
            />
          ))}
          {hasPinned && (
            <div className={styles.sectionLabel} data-testid="notebooks-section-all">
              All
            </div>
          )}
          {unpinnedNotebooks.map((notebook) => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              isPinned={false}
              onPinToggle={handlePinToggle}
            />
          ))}
        </div>
      )}

      <Fab position="right-bottom" href="/notebooks/create" text="Crear Cuaderno" data-testid="notebook-create-fab">
        <Icon f7="plus" />
      </Fab>
    </Page>
  )
}
