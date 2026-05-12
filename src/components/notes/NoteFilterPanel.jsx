import React, { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import {
  Panel, Page, Navbar, NavLeft, NavTitle,
  Block, BlockTitle, List, ListInput, Button, Link,
} from 'framework7-react'
import { LUCIDE_ICONS } from '../IconSelector/lucideIcons'
import styles from './NoteFilterPanel.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function NoteFilterPanel({ opened, onClose, filters, onApply, tags = [] }) {
  const [localContent, setLocalContent] = useState('')
  const [localTagIds, setLocalTagIds] = useState(new Set())

  useEffect(() => {
    if (opened) {
      setLocalContent(filters.content ?? '')
      setLocalTagIds(new Set(filters.tagIds ?? []))
    }
  }, [opened, filters])

  function toggleTag(id) {
    setLocalTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleApply() {
    onApply({
      content: localContent.trim(),
      tagIds: localTagIds,
    })
    onClose()
  }

  function handleClear() {
    setLocalContent('')
    setLocalTagIds(new Set())
    onApply({ content: '', tagIds: new Set() })
    onClose()
  }

  return (
    <Panel right opened={opened} onPanelClosed={onClose} backdrop className={styles.panel}>
      <Page>
        <Navbar>
          <NavLeft>
            <Link panelClose data-testid="note-filter-close">
              <ChevronLeft size={20} />
            </Link>
          </NavLeft>
          <NavTitle>Buscar Notas</NavTitle>
        </Navbar>

        <List>
          <ListInput
            label="Contenido"
            type="text"
            placeholder="Buscar en notas..."
            value={localContent}
            onInput={(e) => setLocalContent(e.target.value)}
            clearButton
            data-testid="note-filter-content"
          />
        </List>

        {tags.length > 0 && (
          <>
            <BlockTitle>Etiquetas</BlockTitle>
            <Block className={styles.tagsBlock}>
              {tags.map((tag) => {
                const tagId = tag.id ?? tag._id
                const active = localTagIds.has(tagId)
                return (
                  <button
                    key={tagId}
                    className={[styles.tagChip, active ? styles.tagChipActive : ''].join(' ')}
                    onClick={() => toggleTag(tagId)}
                    data-testid={`note-filter-tag-${tagId}`}
                  >
                    {(() => {
                      const LucideIcon = tag.icon ? lucideMap[tag.icon] : null
                      if (LucideIcon) return <LucideIcon size={14} className={styles.tagChipIcon} />
                      if (tag.icon) return <i className={['f7-icons', styles.tagChipIcon].join(' ')}>{tag.icon}</i>
                      return null
                    })()}
                    {tag.title}
                  </button>
                )
              })}
            </Block>
          </>
        )}

        <Block className={styles.footer}>
          <Button large outline onClick={handleClear} className={styles.clearBtn} data-testid="note-filter-clear">
            Limpiar todo
          </Button>
          <Button large fill onClick={handleApply} className={styles.applyBtn} data-testid="note-filter-apply">
            Aplicar Filtros
          </Button>
        </Block>
      </Page>
    </Panel>
  )
}
