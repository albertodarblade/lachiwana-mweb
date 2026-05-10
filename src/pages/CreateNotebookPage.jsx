import React, { useState, useEffect, useRef } from 'react'
import { Page, Navbar, NavLeft, NavTitle, Block, BlockTitle, List, ListItem, ListInput, Button, f7 } from 'framework7-react'
import { useCreateNotebook } from '../hooks/useCreateNotebook'
import { useUsers } from '../hooks/useUsers'
import { getSession } from '../stores/authStore'
import { Check, Tag } from 'lucide-react'
import MemberPicker from '../components/notebooks/MemberPicker'
import IconSelector from '../components/IconSelector/IconSelector'
import TagsPopup from '../components/notebooks/TagsPopup'
import TypeSelector from '../components/notebooks/TypeSelector'
import styles from './CreateNotebookPage.module.css'

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

export default function CreateNotebookPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(null)
  const [iconName, setIconName] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [titleError, setTitleError] = useState(false)
  const [tags, setTags] = useState([])
  const [tagsPopupOpen, setTagsPopupOpen] = useState(false)
  const [type, setType] = useState('notes')
  const [transactionsViewType, setTransactionsViewType] = useState('all')
  const titleContainerRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      titleContainerRef.current?.querySelector('input')?.focus()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const { mutate, isPending } = useCreateNotebook()
  const { data: usersData } = useUsers()
  const allUsers = usersData?.data ?? []
  const currentUserId = getSession()?.user?.googleId

  function handleSubmit() {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    setTitleError(false)
    mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        color: color ?? undefined,
        iconName: iconName ?? undefined,
        users: [...selectedIds],
        tags: tags.map(({ title: t, icon }) => ({ title: t, icon })),
        type,
        ...(type === 'transactions' && { transactionsViewType }),
      },
      {
        onSuccess: () => { window.location.href = '/' },
        onError: () => {
          f7.toast.create({ text: 'Error al crear el cuaderno. Intenta de nuevo.', closeTimeout: 3000 }).open()
        },
      }
    )
  }

  return (
    <Page>
      <Navbar>
        <NavLeft backLink="Atrás" />
        <NavTitle>Nuevo Cuaderno</NavTitle>
      </Navbar>

      <List>
        <div ref={titleContainerRef}>
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
        </div>
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
              data-testid={`create-notebook-color-${c.label.toLowerCase()}`}
              style={{
                background: c.hex,
                border: color === c.hex ? '3px solid var(--f7-theme-color)' : '2px solid transparent',
              }}
            >
              {color === c.hex && <Check size={16} className={styles.checkIcon} />}
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
              data-testid="create-notebook-view-all"
            />
            <ListItem
              radio
              radioIcon="end"
              name="transactions-view-type"
              value="by-month"
              title="Por mes"
              checked={transactionsViewType === 'by-month'}
              onChange={() => setTransactionsViewType('by-month')}
              data-testid="create-notebook-view-by-month"
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
            excludeId={currentUserId}
          />
        </li>
      </List>

      <BlockTitle>Etiquetas</BlockTitle>
      <Block className={styles.tagsBlock}>
        <Button outline onClick={() => setTagsPopupOpen(true)} data-testid="create-notebook-tags">
          <Tag size={16} className={styles.tagIcon} />
          {tags.length > 0
            ? `${tags.length} etiqueta${tags.length !== 1 ? 's' : ''} configurada${tags.length !== 1 ? 's' : ''}`
            : 'Gestionar etiquetas'}
        </Button>
      </Block>

      <Block>
        <Button large fill disabled={isPending} onClick={handleSubmit} data-testid="create-notebook-submit">
          {isPending ? 'Creando...' : 'Crear Cuaderno'}
        </Button>
      </Block>

      <TagsPopup
        mode="create"
        tags={tags}
        onTagsChange={setTags}
        opened={tagsPopupOpen}
        onClose={() => setTagsPopupOpen(false)}
      />
    </Page>
  )
}
