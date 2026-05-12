import React, { useState } from 'react'
import { Tag } from 'lucide-react'
import { Block } from 'framework7-react'
import { useNotebook } from '../../hooks/useNotebook'
import TagChip from '../notebooks/TagChip'
import ThemedButton from '../notebooks/ThemedButton'
import NoteTagPicker from './NoteTagPicker'
import styles from './NoteEditorHeader.module.css'

export default function NoteEditorHeader({ notebookId, selectedTagIds, onTagsConfirm }) {
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const { data: notebookData } = useNotebook(notebookId)
  const notebookTags = notebookData?.tags ?? []
  const resolvedTags = (selectedTagIds ?? [])
    .map((id) => notebookTags.find((t) => t.id === id))
    .filter(Boolean)

  return (
    <Block className={styles.block}>
      {notebookTags.length > 0 && (
        <div className={styles.tagsRow}>
          {resolvedTags.map((tag) => <TagChip key={tag.id} tag={tag} color={notebookData?.color} />)}
          <ThemedButton
            variant="outline"
            color={notebookData?.color}
            onClick={() => setTagPickerOpen(true)}
            data-testid="note-tags-manage"
          >
            <Tag size={14} className={styles.manageIcon} />
            {resolvedTags.length > 0 ? 'Gestionar' : 'Agregar etiquetas'}
          </ThemedButton>
        </div>
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
