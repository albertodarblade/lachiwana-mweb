import React, { useState } from 'react'
import { Sheet, PageContent, List, ListItem, Block, Button } from 'framework7-react'
import TagChip from '../notebooks/TagChip'
import styles from './NoteTagPicker.module.css'

function hexToRgbString(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return null
  return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`
}

export default function NoteTagPicker({ notebookTags = [], selectedTagIds = [], onConfirm, opened, onClose, color }) {
  const [localIds, setLocalIds] = useState(selectedTagIds)

  const themeColor = color ?? 'var(--f7-theme-color)'
  const rgb =
    typeof themeColor === 'string' && themeColor.startsWith('#')
      ? hexToRgbString(themeColor)
      : null
  const themeVars = {
    '--f7-theme-color': themeColor,
    '--f7-theme-color-shade': `color-mix(in srgb, ${themeColor} 85%, black)`,
    '--f7-theme-color-tint': `color-mix(in srgb, ${themeColor} 85%, white)`,
    ...(rgb ? { '--f7-theme-color-rgb': rgb } : {}),
  }

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
      style={{ height: '99vh' }}
    >
      <PageContent className={styles.pageContent} style={themeVars}>
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
                  <TagChip tag={tag} color={color} />
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
