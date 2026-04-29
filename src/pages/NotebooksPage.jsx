import React from 'react'
import { Page, Navbar, NavRight, Block, Preloader, Fab, Icon } from 'framework7-react'
import { useNotebooks } from '../hooks/useNotebooks'
import { getSession } from '../stores/authStore'
import NotebookCard from '../components/notebooks/NotebookCard'
import NotebookEmptyState from '../components/notebooks/NotebookEmptyState'

function UserAvatar() {
  const session = getSession()
  const picture = session?.user?.picture
  if (picture) {
    return (
      <img
        src={picture}
        alt="avatar"
        width={32}
        height={32}
        style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    )
  }
  return <i className="f7-icons" style={{ fontSize: '32px' }}>person_circle</i>
}

export default function NotebooksPage({ f7router }) {
  const { data, isLoading, isError, refetch } = useNotebooks()

  const notebooks = [...(data?.data ?? [])].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  return (
    <Page>
      <Navbar title="Lachiwana">
        <NavRight>
          <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center' }}>
            <UserAvatar />
          </div>
        </NavRight>
      </Navbar>

      {isLoading && (
        <Block style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
          <Preloader size={44} />
        </Block>
      )}

      {isError && (
        <Block style={{ textAlign: 'center', color: 'var(--f7-color-red)' }}>
          <p>Error al cargar los cuadernos.</p>
          <span
            style={{ color: 'var(--f7-theme-color)', cursor: 'pointer' }}
            onClick={() => refetch()}
          >
            Reintentar
          </span>
        </Block>
      )}

      {!isLoading && !isError && notebooks.length === 0 && <NotebookEmptyState />}

      {!isLoading && !isError && notebooks.length > 0 && (
        <div style={{ paddingBottom: '80px' }}>
          {notebooks.map((notebook) => (
            <NotebookCard key={notebook.id} notebook={notebook} />
          ))}
        </div>
      )}

      <Fab position="right-bottom" text="Crear Cuaderno" onClick={() => f7router.navigate('/notebooks/create')}>
        <Icon f7="plus" />
      </Fab>
    </Page>
  )
}
