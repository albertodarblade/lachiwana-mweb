import React, { useState } from 'react'
import { Block, Button } from 'framework7-react'
import { useNotebook } from '../../hooks/useNotebook'
import TagChip from '../notebooks/TagChip'
import NoteTagPicker from './NoteTagPicker'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function NoteEditorHeader({ notebookId, selectedTagIds, onTagsConfirm, createdAt }) {
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const { data: notebookData } = useNotebook(notebookId)
  const notebookTags = notebookData?.tags ?? []
  const resolvedTags = (selectedTagIds ?? [])
    .map((id) => notebookTags.find((t) => t.id === id))
    .filter(Boolean)

  return (
    <Block style={{ margin: '8px 0 0', paddingTop: 0, paddingBottom: 8 }}>
      {notebookTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
          {resolvedTags.map((tag) => <TagChip key={tag.id} tag={tag} />)}
          <Button small outline onClick={() => setTagPickerOpen(true)} style={{ flexShrink: 0 }}>
            <i className="f7-icons" style={{ marginRight: 4, fontSize: 14 }}>tag</i>
            {resolvedTags.length > 0 ? 'Gestionar' : 'Agregar etiquetas'}
          </Button>
        </div>
      )}
      {createdAt && (
        <p style={{ margin: 0, fontSize: 12, opacity: 0.5 }}>
          Creado: {formatDate(createdAt)}
        </p>
      )}
      <NoteTagPicker
        notebookTags={notebookTags}
        selectedTagIds={selectedTagIds}
        onConfirm={onTagsConfirm}
        opened={tagPickerOpen}
        onClose={() => setTagPickerOpen(false)}
      />
    </Block>
  )
}
