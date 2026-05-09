import React, { useState, useEffect } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  List, ListItem, ListInput, Block, BlockTitle, Button, Link, f7,
} from 'framework7-react'
import { useNotebook } from '../hooks/useNotebook'
import { useUpdateNotebook } from '../hooks/useUpdateNotebook'
import { useDeleteNotebook } from '../hooks/useDeleteNotebook'
import { useUsers } from '../hooks/useUsers'
import { getSession } from '../stores/authStore'
import IconSelector from '../components/notebooks/IconSelector'
import MemberPicker from '../components/notebooks/MemberPicker'
import TagsPopup from '../components/notebooks/TagsPopup'
import DeleteConfirmDialog from '../components/notebooks/DeleteConfirmDialog'
import TypeSelector from '../components/notebooks/TypeSelector'
import { navigate, navigateBack } from '../utils/f7navigate'
import styles from './EditNotebookPage.module.css'

const COLORS = [
  { label: 'Red', hex: '#FF3B30' },
  { label: 'Orange', hex: '#FF9500' },
  { label: 'Yellow', hex: '#FFCC00' },
  { label: 'Green', hex: '#16A34A' },
  { label: 'Teal', hex: '#5AC8FA' },
  { label: 'Blue', hex: '#007AFF' },
  { label: 'Purple', hex: '#AF52DE' },
  { label: 'Pink', hex: '#FF2D55' },
]

export default function EditNotebookPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook } = useNotebook(id)
  const { mutate, isPending } = useUpdateNotebook()
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteNotebook()
  const { data: usersData } = useUsers()
  const allUsers = usersData?.data ?? []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(null)
  const [iconName, setIconName] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [titleError, setTitleError] = useState(false)
  const [tagsPopupOpen, setTagsPopupOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [type, setType] = useState('notes')
  const [transactionsViewType, setTransactionsViewType] = useState('all')

  const currentUserId = getSession()?.user?.googleId
  const isOwner = notebook?.owner === currentUserId

  useEffect(() => {
    if (notebook) {
      setTitle(notebook.title ?? '')
      setDescription(notebook.description ?? '')
      setColor(notebook.color ?? null)
      setIconName(notebook.iconName ?? null)
      setSelectedIds(new Set(notebook.users ?? []))
      setType(notebook.type ?? 'notes')
      setTransactionsViewType(notebook.transactionsViewType ?? 'all')
    }
  }, [notebook])

  function handleSave() {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    setTitleError(false)
    mutate(
      {
        id: notebook.id,
        title: title.trim(),
        description: description.trim() || undefined,
        color: color ?? undefined,
        iconName: iconName ?? undefined,
        users: [...selectedIds],
        type,
        ...(type === 'transactions' && { transactionsViewType }),
      },
      {
        onSuccess: () => {
          const destination =
            type === 'transactions'
              ? `/notebooks/${notebook.id}/transactions`
              : `/notebooks/${notebook.id}/notes`
          navigate(destination)
        },
        onError: (err) => {
          f7.toast.create({
            text: err?.message ?? 'Error al guardar. Intenta de nuevo.',
            closeTimeout: 3000,
            position: 'top',
          }).open()
        },
      }
    )
  }

  function handleDeleteConfirm() {
    deleteMutate(notebook.id, {
      onSuccess: () => { window.location.replace('/') },
      onError: (err) => {
        f7.toast.create({
          text: err?.message ?? 'Error al eliminar. Intenta de nuevo.',
          closeTimeout: 3000,
          position: 'top',
        }).open()
      },
    })
  }

  return (
    <Page>
      <Navbar>
        <NavLeft>
          <Link onClick={() => navigateBack()} className={styles.navCloseLink}>
            <i className="f7-icons">xmark</i>
          </Link>
        </NavLeft>
        <NavTitle>Editar Cuaderno</NavTitle>
        <NavRight>
          <Link
            onClick={handleSave}
            disabled={isPending}
            className={styles.navSaveLink}
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </Link>
        </NavRight>
      </Navbar>

      <List>
        <ListInput
          label="Título"
          type="text"
          placeholder="Título del cuaderno"
          value={title}
          onInput={(e) => { setTitle(e.target.value); setTitleError(false) }}
          errorMessage="El título es obligatorio"
          errorMessageForce={titleError}
          clearButton
        />
        <ListInput
          label="Descripción"
          type="textarea"
          placeholder="Descripción (opcional)"
          value={description}
          onInput={(e) => setDescription(e.target.value)}
        />
      </List>

      <BlockTitle>Color</BlockTitle>
      <Block>
        <div className={styles.colorRow}>
          {COLORS.map((c) => (
            <div
              key={c.hex}
              onClick={() => setColor(color === c.hex ? null : c.hex)}
              className={styles.colorSwatch}
              style={{
                background: c.hex,
                border: color === c.hex ? '3px solid var(--f7-theme-color)' : '2px solid transparent',
              }}
            >
              {color === c.hex && (
                <i className={['f7-icons', styles.checkIcon].join(' ')}>checkmark</i>
              )}
            </div>
          ))}
        </div>
      </Block>

      <BlockTitle>Ícono</BlockTitle>
      <List>
        <li>
          <IconSelector value={iconName} onChange={setIconName} />
        </li>
      </List>

      <BlockTitle>Tipo</BlockTitle>
      <TypeSelector value={type} onChange={setType} />

      {type === 'transactions' && (
        <>
          <BlockTitle>Vista de transacciones</BlockTitle>
          <List>
            <ListItem
              radio
              radioIcon="end"
              name="transactions-view-type"
              value="all"
              title="Todas las entradas"
              checked={transactionsViewType === 'all'}
              onChange={() => setTransactionsViewType('all')}
            />
            <ListItem
              radio
              radioIcon="end"
              name="transactions-view-type"
              value="by-month"
              title="Por mes"
              checked={transactionsViewType === 'by-month'}
              onChange={() => setTransactionsViewType('by-month')}
            />
          </List>
        </>
      )}

      <BlockTitle>Miembros</BlockTitle>
      <List>
        <li>
          <MemberPicker
            allUsers={allUsers}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            excludeId={notebook?.owner}
          />
        </li>
      </List>

      <BlockTitle>Etiquetas</BlockTitle>
      <Block className={styles.tagsBlock}>
        <Button outline onClick={() => setTagsPopupOpen(true)}>
          <i className={['f7-icons', styles.tagIcon].join(' ')}>tag</i>
          Gestionar etiquetas
        </Button>
      </Block>

      {isOwner && (
        <>
          <BlockTitle>Acciones</BlockTitle>
          <Block className={styles.actionsBlock}>
            <Button large outline color="red" onClick={() => setDeleteDialogOpen(true)}>
              Eliminar cuaderno
            </Button>
          </Block>
        </>
      )}

      <TagsPopup
        mode="edit"
        notebookId={id}
        tags={notebook?.tags ?? []}
        onTagsChange={() => {}}
        opened={tagsPopupOpen}
        onClose={() => setTagsPopupOpen(false)}
      />

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
