import React, { useState, useEffect } from 'react'
import { Sheet, PageContent, Block, List, ListItem, Button } from 'framework7-react'
import styles from './TagSelectionSheet.module.css'

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
          <Button outline small className={styles.editBtn} onClick={onEditTags}>
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
            >
              <i slot="media" className={['f7-icons', styles.tagIcon].join(' ')}>
                {tag.icon}
              </i>
            </ListItem>
          ))}
        </List>

        <Block>
          <Button large fill onClick={() => onConfirm(localSelected)}>
            Confirmar
          </Button>
        </Block>
      </PageContent>
    </Sheet>
  )
}
