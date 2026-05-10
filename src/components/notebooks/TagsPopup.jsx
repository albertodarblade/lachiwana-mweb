import React, { useState } from 'react'
import {
  Sheet, PageContent,
  List, ListInput, Block, Button, Link, f7,
} from 'framework7-react'
import { Plus, Pencil, Trash2, Clock, Tag } from 'lucide-react'
import TagChip from './TagChip'
import IconSelector from '../IconSelector/IconSelector'
import { useAddTag } from '../../hooks/useAddTag'
import { useUpdateTag } from '../../hooks/useUpdateTag'
import { useDeleteTag } from '../../hooks/useDeleteTag'
import styles from './TagsPopup.module.css'

const EMPTY_FORM = { title: '', icon: null }

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
    setForm({ title: tag.title, icon: tag.icon || null })
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
    <Sheet
      opened={opened}
      onSheetClosed={() => { closeForm(); onClose() }}
      swipeToClose
      backdrop
      style={{ height: 'auto' }}
    >
      <PageContent className={styles.pageContent}>
        <div className={styles.dragHandle} />

        <div className={styles.header}>
          <span className={styles.headerTitle}>Etiquetas</span>
          {!formOpen && (
            <Link onClick={openAdd} data-testid="tags-add-new">
              <Plus size={20} />
            </Link>
          )}
        </div>

        {tags.length === 0 && !formOpen && (
          <Block>
            <p className={styles.emptyText}>Sin etiquetas. Toca + para agregar.</p>
          </Block>
        )}

        {tags.map((tag) => (
          <div key={tag.id} className={styles.tagRow}>
            <TagChip tag={tag} />
            <div className={styles.tagActions}>
              <Link onClick={() => openEdit(tag)} disabled={deletingId === tag.id} data-testid={`tag-edit-${tag.id}`}>
                <Pencil size={18} className={styles.editIcon} />
              </Link>
              <Link onClick={() => handleDelete(tag)} disabled={deletingId === tag.id} data-testid={`tag-delete-${tag.id}`}>
                {deletingId === tag.id
                  ? <Clock size={18} className={styles.deleteIcon} />
                  : <Trash2 size={18} className={styles.deleteIcon} />}
              </Link>
            </div>
          </div>
        ))}

        {formOpen && (
          <Block className={styles.formBlock}>
            <List>
              <ListInput
                autofocus
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
                <IconSelector value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon: icon }))} />
              </li>
            </List>
            <div className={styles.formButtons}>
              <Button outline onClick={closeForm} className={styles.formButton} data-testid="tag-form-cancel">Cancelar</Button>
              <Button fill onClick={handleConfirm} disabled={isMutating} className={styles.formButton} data-testid="tag-form-confirm">
                {isMutating ? 'Guardando...' : editingId ? 'Guardar' : 'Agregar'}
              </Button>
            </div>
          </Block>
        )}

        {!formOpen && (
          <Block>
            <Button outline onClick={openAdd} data-testid="tags-add-button">
              <Tag size={16} className={styles.addTagIcon} />
              Agregar etiqueta
            </Button>
          </Block>
        )}
      </PageContent>
    </Sheet>
  )
}
