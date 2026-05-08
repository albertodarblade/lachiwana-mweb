import React, { useState } from 'react'
import { Page, Navbar, Block, Preloader, Fab, Icon } from 'framework7-react'
import { useNotebooks } from '../hooks/useNotebooks'
import { getSession } from '../stores/authStore'
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
  return <i className={['f7-icons', styles.avatarIcon].join(' ')}>person_circle</i>
}

export default function NotebooksPage() {
  const { data, isLoading, isError, refetch } = useNotebooks()

  const notebooks = [...(data?.data ?? [])].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )

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
        <div className={styles.avatarWrapper} onClick={() => navigate('/settings')}>
          <UserAvatar />
        </div>
      </Navbar>

      {isLoading && (
        <Block className={styles.loadingBlock}>
          <Preloader size={44} />
        </Block>
      )}

      {isError && (
        <Block className={styles.errorBlock}>
          <p>Error al cargar los cuadernos.</p>
          <span
            className={styles.retryLink}
            onClick={() => refetch()}
          >
            Reintentar
          </span>
        </Block>
      )}

      {!isLoading && !isError && notebooks.length === 0 && <NotebookEmptyState />}

      {!isLoading && !isError && notebooks.length > 0 && (
        <div className={styles.listPadding}>
          {notebooks.map((notebook) => (
            <NotebookCard key={notebook.id} notebook={notebook} />
          ))}
        </div>
      )}

      <Fab position="right-bottom" href="/notebooks/create" text="Crear Cuaderno">
        <Icon f7="plus" />
      </Fab>
    </Page>
  )
}
