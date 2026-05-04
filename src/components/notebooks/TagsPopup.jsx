import React, { useState } from 'react'
import {
  Sheet, PageContent,
  List, ListInput, Block, Button, Link, f7,
} from 'framework7-react'
import TagChip from './TagChip'
import IconSelector from './IconSelector'
import { useAddTag } from '../../hooks/useAddTag'
import { useUpdateTag } from '../../hooks/useUpdateTag'
import { useDeleteTag } from '../../hooks/useDeleteTag'

const DRAG_HANDLE = (
  <div style={{
    width: 36, height: 4, borderRadius: 2,
    background: 'rgba(0,0,0,0.15)', margin: '12px auto 4px',
  }} />
)

const EMPTY_FORM = { title: '', icon: 'circle_fill' }

export default function TagsPopup({ mode = 'create', notebookId, tags = [], onTagsChange, opened, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [titleError, setTitleError] = useState(false)

  const { mutate: addTag, isPending: isAdding } = useAddTag(notebookId)
  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag(notebookId)
  const { mutate: deleteTag, pendingId: deletingId } = useDeleteTag(notebookId)

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setTitleError(false)
    setFormOpen(true)
  }

  function openEdit(tag) {
    setForm({ title: tag.title, icon: tag.icon || 'circle_fill' })
    setEditingId(tag.id)
    setTitleError(false)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setTitleError(false)
  }

  function validate() {
    const titleValid = form.title.trim().length > 0
    setTitleError(!titleValid)
    return titleValid
  }

  function handleConfirm() {
    if (!validate()) return

    const payload = { title: form.title.trim(), icon: form.icon }

    if (mode === 'create') {
      if (editingId) {
        onTagsChange(tags.map((t) => t.id === editingId ? { ...t, ...payload } : t))
      } else {
        onTagsChange([...tags, { id: `temp-${Date.now()}`, ...payload }])
      }
      closeForm()
      return
    }

    if (editingId) {
      updateTag({ tagId: editingId, ...payload }, {
        onSuccess: closeForm,
        onError: () => {
          f7.toast.create({ text: 'Error al guardar la etiqueta. Intenta de nuevo.', closeTimeout: 3000, position: 'top' }).open()
        },
      })
    } else {
      addTag(payload, {
        onSuccess: (data) => {
          onTagsChange([...tags, data?.data ?? { id: `confirmed-${Date.now()}`, ...payload }])
          closeForm()
        },
        onError: () => {
          f7.toast.create({ text: 'Error al agregar la etiqueta. Intenta de nuevo.', closeTimeout: 3000, position: 'top' }).open()
        },
      })
    }
  }

  function handleDelete(tag) {
    if (mode === 'create') {
      onTagsChange(tags.filter((t) => t.id !== tag.id))
      return
    }
    deleteTag({ tagId: tag.id }, {
      onError: () => {
        f7.toast.create({ text: 'Error al eliminar la etiqueta. Intenta de nuevo.', closeTimeout: 3000, position: 'top' }).open()
      },
    })
  }

  const isMutating = isAdding || isUpdating

  return (
    <Sheet opened={opened} onSheetClosed={onClose} swipeToClose backdrop style={{ height: 'auto' }}>
      <PageContent style={{ padding: '0 0 32px' }}>
        {DRAG_HANDLE}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 4px' }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>Etiquetas</span>
          {!formOpen && (
            <Link onClick={openAdd}>
              <i className="f7-icons">plus</i>
            </Link>
          )}
        </div>

        {tags.length === 0 && !formOpen && (
          <Block>
            <p style={{ opacity: 0.5, fontSize: 13, margin: 0 }}>Sin etiquetas. Toca + para agregar.</p>
          </Block>
        )}

        {tags.map((tag) => (
          <div
            key={tag.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 16px', borderBottom: '1px solid var(--f7-list-item-border-color)',
            }}
          >
            <TagChip tag={tag} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Link onClick={() => openEdit(tag)} disabled={deletingId === tag.id}>
                <i className="f7-icons" style={{ fontSize: 18, color: 'var(--f7-theme-color)' }}>pencil</i>
              </Link>
              <Link onClick={() => handleDelete(tag)} disabled={deletingId === tag.id}>
                <i className="f7-icons" style={{ fontSize: 18, color: 'var(--f7-color-red)' }}>
                  {deletingId === tag.id ? 'clock' : 'trash'}
                </i>
              </Link>
            </div>
          </div>
        ))}

        {formOpen && (
          <Block style={{ marginTop: 8 }}>
            <List>
              <ListInput
                label="Título de la etiqueta"
                type="text"
                placeholder="Ej: Urgente"
                value={form.title}
                onInput={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setTitleError(false) }}
                errorMessage="El título de la etiqueta es obligatorio"
                errorMessageForce={titleError}
                clearButton
              />
              <li>
                <IconSelector value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon: icon || 'circle_fill' }))} />
              </li>
            </List>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button outline onClick={closeForm} style={{ flex: 1 }}>Cancelar</Button>
              <Button fill onClick={handleConfirm} disabled={isMutating} style={{ flex: 1 }}>
                {isMutating ? 'Guardando...' : editingId ? 'Guardar' : 'Agregar'}
              </Button>
            </div>
          </Block>
        )}

        {!formOpen && (
          <Block>
            <Button outline onClick={openAdd}>
              <i className="f7-icons" style={{ marginRight: 6 }}>tag</i>
              Agregar etiqueta
            </Button>
          </Block>
        )}
      </PageContent>
    </Sheet>
  )
}
