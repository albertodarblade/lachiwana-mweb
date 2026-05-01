import React, { useState } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, Preloader, Actions, ActionsGroup, ActionsButton, f7,
  Button,
} from 'framework7-react'
import { useNotebook } from '../hooks/useNotebook'
import { useDeleteNotebook } from '../hooks/useDeleteNotebook'
import { getSession } from '../stores/authStore'
import DeleteConfirmDialog from '../components/notebooks/DeleteConfirmDialog'
import { navigate, navigateBack } from '../utils/f7navigate'

export default function NotebookDetailPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook, isLoading, isError } = useNotebook(id)
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

      <Block style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '12px',
        opacity: 0.5,
      }}>
        <i className="f7-icons" style={{ fontSize: '56px' }}>note_text</i>
        <p style={{ margin: 0, fontSize: '16px' }}>Notas vacías</p>
      </Block>

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
