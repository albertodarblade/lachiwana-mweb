import React, { useState, useEffect } from 'react'
import { ChevronLeft, Tag } from 'lucide-react'
import {
  Panel, Page, Navbar, NavLeft, NavTitle,
  Block, BlockTitle, List, ListInput, Button, Link,
} from 'framework7-react'
import { LUCIDE_ICONS } from '../IconSelector/lucideIcons'
import styles from './TransactionFilterPanel.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function TransactionFilterPanel({
  opened,
  onClose,
  tags,
  filters,
  onApply,
}) {
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
    onApply({ content: localContent.trim(), tagIds: localTagIds })
    onClose()
  }

  function handleClear() {
    setLocalContent('')
    setLocalTagIds(new Set())
    onApply({ content: '', tagIds: new Set() })
    onClose()
  }

  return (
    <Panel
      right
      opened={opened}
      onPanelClosed={onClose}
      backdrop
      className={styles.panel}
    >
      <Page>
        <Navbar>
          <NavLeft>
            <Link panelClose data-testid="filter-close">
              <ChevronLeft size={20} />
            </Link>
          </NavLeft>
          <NavTitle>Filtrar Transacciones</NavTitle>
        </Navbar>

        <List>
          <ListInput
            label="Contenido"
            type="text"
            placeholder="Buscar en transacciones..."
            value={localContent}
            onInput={(e) => setLocalContent(e.target.value)}
            clearButton
            data-testid="filter-content"
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
                    data-testid={`filter-tag-${tagId}`}
                  >
                    {(() => { const Icon = tag.icon ? (lucideMap[tag.icon] ?? Tag) : Tag; return <Icon size={16} /> })()}
                    <span>{tag.title}</span>
                  </button>
                )
              })}
            </Block>
          </>
        )}

        <Block className={styles.footer}>
          <Button large outline onClick={handleClear} className={styles.clearBtn} data-testid="filter-clear">
            Limpiar todo
          </Button>
          <Button large fill onClick={handleApply} className={styles.applyBtn} data-testid="filter-apply">
            Aplicar Filtros
          </Button>
        </Block>
      </Page>
    </Panel>
  )
}
