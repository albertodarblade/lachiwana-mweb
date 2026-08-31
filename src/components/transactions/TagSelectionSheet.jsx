import React, { useState, useEffect } from 'react'
import { Tag } from 'lucide-react'
import { Sheet, List, ListItem, Button } from 'framework7-react'
import { LUCIDE_ICONS } from '../IconSelector/lucideIcons'
import styles from './TagSelectionSheet.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

function hexToRgbString(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return null
  return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`
}

export default function TagSelectionSheet({
  opened,
  tags,
  selectedTagIds,
  onConfirm,
  onClose,
  onEditTags,
  color,
}) {
  const [localSelected, setLocalSelected] = useState(new Set(selectedTagIds))

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
      backdrop
      swipeToClose
      swipeHandler=".tag-swipe-handle"
      style={{ height: '90vh' }}
    >
      <div className={styles.sheetOuter} style={themeVars}>

        {/* Fixed header — drag handle + title + edit button */}
        <div className={styles.fixedHeader}>
          <div className={`${styles.swipeZone} tag-swipe-handle`}>
            <div className={styles.dragHandle} />
          </div>
          <div className={styles.header}>
            <div>
              <p className={styles.title}>Categoría</p>
              <p className={styles.subtitle}>Elige una o más categorías.</p>
            </div>
            <Button outline small className={styles.editBtn} onClick={onEditTags} data-testid="tag-selection-edit">
              Gestionar
            </Button>
          </div>
        </div>

        {/* Scrollable tag list */}
        <div className={styles.scrollArea}>
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
        </div>

        {/* Confirm button always visible at the bottom */}
        <div className={styles.footer}>
          <Button large fill onClick={() => onConfirm(localSelected)} data-testid="tag-selection-confirm">
            Confirmar
          </Button>
        </div>

      </div>
    </Sheet>
  )
}
