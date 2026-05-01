import React, { useState, useEffect } from 'react'
import {
  Sheet, PageContent, Navbar, NavLeft, NavTitle, NavRight,
  List, ListInput, Block, BlockTitle, Button, Link, f7,
} from 'framework7-react'
import { useUpdateNotebook } from '../../hooks/useUpdateNotebook'
import { useUsers } from '../../hooks/useUsers'
import IconSelector from './IconSelector'
import MemberPicker from './MemberPicker'

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

export default function EditNotebookSheet({ notebook, opened, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(null)
  const [iconName, setIconName] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [titleError, setTitleError] = useState(false)

  const { mutate, isPending } = useUpdateNotebook()
  const { data: usersData } = useUsers()
  const allUsers = usersData?.data ?? []

  useEffect(() => {
    if (notebook) {
      setTitle(notebook.title ?? '')
      setDescription(notebook.description ?? '')
      setColor(notebook.color ?? null)
      setIconName(notebook.iconName ?? null)
      setSelectedIds(new Set(notebook.users ?? []))
      setTitleError(false)
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
        onSuccess: onClose,
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
    <Sheet opened={opened} onSheetClosed={onClose} style={{ height: '90vh' }} swipeToClose>
      <PageContent style={{ paddingTop: 0 }}>
        <Navbar>
          <NavLeft>
            <Link sheetClose style={{ paddingLeft: '12px' }}>Cancelar</Link>
          </NavLeft>
          <NavTitle>Editar Cuaderno</NavTitle>
          <NavRight>
            <Link onClick={handleSave} disabled={isPending} style={{ paddingRight: '12px' }}>
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
                {color === c.hex && <i className="f7-icons" style={{ fontSize: '16px', color: '#fff' }}>checkmark</i>}
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

        <Block>
          <Button large fill disabled={isPending} onClick={handleSave}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Block>
      </PageContent>
    </Sheet>
  )
}
