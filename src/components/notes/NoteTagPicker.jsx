import React, { useState } from 'react'
import { Sheet, PageContent, List, ListItem, Block, Button } from 'framework7-react'
import TagChip from '../notebooks/TagChip'

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
      <PageContent style={{ padding: '0 0 32px' }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(0,0,0,0.15)', margin: '12px auto 4px',
        }} />

        <div style={{ padding: '8px 16px 4px', fontSize: 17, fontWeight: 600 }}>
          Etiquetas
        </div>

        {notebookTags.length === 0 ? (
          <Block>
            <p style={{ opacity: 0.5, fontSize: 13, margin: 0 }}>
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
              >
                <div slot="title">
                  <TagChip tag={tag} />
                </div>
              </ListItem>
            ))}
          </List>
        )}

        <Block style={{ marginTop: 8 }}>
          <Button large fill onClick={handleConfirm}>Listo</Button>
        </Block>
      </PageContent>
    </Sheet>
  )
}
