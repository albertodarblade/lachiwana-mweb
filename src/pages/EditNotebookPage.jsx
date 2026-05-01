import React, { useState, useEffect } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  List, ListInput, Block, BlockTitle, Link, f7,
} from 'framework7-react'
import { useNotebook } from '../hooks/useNotebook'
import { useUpdateNotebook } from '../hooks/useUpdateNotebook'
import { useUsers } from '../hooks/useUsers'
import IconSelector from '../components/notebooks/IconSelector'
import MemberPicker from '../components/notebooks/MemberPicker'
import { navigateBack } from '../utils/f7navigate'

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

export default function EditNotebookPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook } = useNotebook(id)
  const { mutate, isPending } = useUpdateNotebook()
  const { data: usersData } = useUsers()
  const allUsers = usersData?.data ?? []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(null)
  const [iconName, setIconName] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [titleError, setTitleError] = useState(false)

  useEffect(() => {
    if (notebook) {
      setTitle(notebook.title ?? '')
      setDescription(notebook.description ?? '')
      setColor(notebook.color ?? null)
      setIconName(notebook.iconName ?? null)
      setSelectedIds(new Set(notebook.users ?? []))
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
      },
      {
        onSuccess: () => navigateBack(),
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

  return (
    <Page>
      <Navbar>
        <NavLeft>
          <Link onClick={() => navigateBack()} style={{ paddingLeft: '12px' }}>
            <i className="f7-icons">xmark</i>
          </Link>
        </NavLeft>
        <NavTitle>Editar Cuaderno</NavTitle>
        <NavRight>
          <Link
            onClick={handleSave}
            disabled={isPending}
            style={{ paddingRight: '12px', fontWeight: '600' }}
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
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {COLORS.map((c) => (
            <div
              key={c.hex}
              onClick={() => setColor(color === c.hex ? null : c.hex)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: c.hex, flexShrink: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            excludeId={notebook?.owner}
          />
        </li>
      </List>
    </Page>
  )
}
