import React, { useState } from 'react'
import { Sheet, PageContent, List, ListItem, Block, Button } from 'framework7-react'
import TagChip from '../notebooks/TagChip'
import styles from './NoteTagPicker.module.css'

export default function NoteTagPicker({ notebookTags = [], selectedTagIds = [], onConfirm, opened, onClose }) {
  const [localIds, setLocalIds] = useState(selectedTagIds)

  function handleOpen() {
    setLocalIds(selectedTagIds)
  }

  function toggle(id) {
    setLocalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleConfirm() {
    onConfirm(localIds)
    onClose()
  }

  return (
    <Sheet
      opened={opened}
      onSheetOpen={handleOpen}
      onSheetClosed={onClose}
      swipeToClose
      backdrop
      style={{ height: 'auto' }}
    >
      <PageContent className={styles.pageContent}>
        <div className={styles.dragHandle} />

        <div className={styles.sheetTitle}>
          Etiquetas
        </div>

        {notebookTags.length === 0 ? (
          <Block>
            <p className={styles.emptyText}>
              Este cuaderno no tiene etiquetas.
            </p>
          </Block>
        ) : (
          <List>
            {notebookTags.map((tag) => (
              <ListItem
                key={tag.id}
                checkbox
                checked={localIds.includes(tag.id)}
                onChange={() => toggle(tag.id)}
                data-testid={`note-tag-item-${tag.id}`}
              >
                <div slot="title">
                  <TagChip tag={tag} />
                </div>
              </ListItem>
            ))}
          </List>
        )}

        <Block className={styles.confirmBlock}>
          <Button large fill onClick={handleConfirm} data-testid="note-tag-confirm">Listo</Button>
        </Block>
      </PageContent>
    </Sheet>
  )
}
