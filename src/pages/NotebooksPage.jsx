import React, { useState } from 'react'
import { Page, Navbar, NavRight, Block, Preloader, Fab, Icon } from 'framework7-react'
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
        width={32}
        height={32}
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
      <Navbar title="Lachiwana">
        <NavRight>
          <div
            className={styles.avatarWrapper}
            onClick={() => navigate('/settings')}
          >
            <UserAvatar />
          </div>
        </NavRight>
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
