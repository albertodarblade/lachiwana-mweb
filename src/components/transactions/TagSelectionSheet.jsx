import React, { useState, useEffect } from 'react'
import { Tag } from 'lucide-react'
import { Sheet, PageContent, Block, List, ListItem, Button } from 'framework7-react'
import { LUCIDE_ICONS } from '../IconSelector/lucideIcons'
import styles from './TagSelectionSheet.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function TagSelectionSheet({
  opened,
  tags,
  selectedTagIds,
  onConfirm,
  onClose,
  onEditTags,
}) {
  const [localSelected, setLocalSelected] = useState(new Set(selectedTagIds))

  useEffect(() => {
    if (opened) setLocalSelected(new Set(selectedTagIds))
  }, [opened, selectedTagIds])

  function toggleTag(id) {
    setLocalSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Sheet
      opened={opened}
      onSheetClosed={onClose}
      swipeToClose
      backdrop
      style={{ height: 'auto', maxHeight: '80vh' }}
    >
      <PageContent className={styles.pageContent}>
        <div className={styles.dragHandle} />

        <div className={styles.header}>
          <div>
            <p className={styles.title}>Categoría</p>
            <p className={styles.subtitle}>Elige una o más categorías para tu movimiento.</p>
          </div>
          <Button outline small className={styles.editBtn} onClick={onEditTags} data-testid="tag-selection-edit">
            Editar
          </Button>
        </div>

        <List className={styles.list}>
          {tags.map((tag) => (
            <ListItem
              key={tag.id ?? tag._id}
              checkbox
              checked={localSelected.has(tag.id ?? tag._id)}
              onChange={() => toggleTag(tag.id ?? tag._id)}
              title={tag.title}
              data-testid={`tag-selection-item-${tag.id ?? tag._id}`}
            >
              {(() => {
                const Icon = tag.icon ? (lucideMap[tag.icon] ?? Tag) : Tag
                return <Icon slot="media" size={20} className={styles.tagIcon} />
              })()}
            </ListItem>
          ))}
        </List>

        <Block>
          <Button large fill onClick={() => onConfirm(localSelected)} data-testid="tag-selection-confirm">
            Confirmar
          </Button>
        </Block>
      </PageContent>
    </Sheet>
  )
}
