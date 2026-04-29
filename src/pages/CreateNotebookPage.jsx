import React, { useState } from 'react'
import { Page, Navbar, NavLeft, NavTitle, Block, BlockTitle, List, ListInput, Button, f7 } from 'framework7-react'
import { useCreateNotebook } from '../hooks/useCreateNotebook'
import { useUsers } from '../hooks/useUsers'
import { getSession } from '../stores/authStore'
import MemberPicker from '../components/notebooks/MemberPicker'
import IconSelector from '../components/notebooks/IconSelector'

const COLORS = [
  { label: 'Red', hex: '#FF3B30' },
  { label: 'Orange', hex: '#FF9500' },
  { label: 'Yellow', hex: '#FFCC00' },
  { label: 'Green', hex: '#34C759' },
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
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {COLORS.map((c) => (
            <div
              key={c.hex}
              onClick={() => setColor(color === c.hex ? null : c.hex)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: c.hex,
                flexShrink: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: color === c.hex ? '3px solid var(--f7-theme-color)' : '2px solid transparent',
                boxSizing: 'border-box',
              }}
            >
              {color === c.hex && (
                <i className="f7-icons" style={{ fontSize: '16px', color: '#fff' }}>checkmark</i>
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

      <Block>
        <Button large fill disabled={isPending} onClick={handleSubmit}>
          {isPending ? 'Creando...' : 'Crear Cuaderno'}
        </Button>
      </Block>
    </Page>
  )
}
