import React, { useState, useEffect } from 'react'
import {
  Panel, Page, Navbar, NavLeft, NavTitle,
  Block, BlockTitle, List, ListInput, Button, Link,
} from 'framework7-react'
import styles from './TransactionFilterPanel.module.css'

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
            <Link panelClose>
              <i className="f7-icons">chevron_left</i>
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
                  >
                    <i className="f7-icons">{tag.icon}</i>
                    <span>{tag.title}</span>
                  </button>
                )
              })}
            </Block>
          </>
        )}

        <Block className={styles.footer}>
          <Button large outline onClick={handleClear} className={styles.clearBtn}>
            Limpiar todo
          </Button>
          <Button large fill onClick={handleApply} className={styles.applyBtn}>
            Aplicar Filtros
          </Button>
        </Block>
      </Page>
    </Panel>
  )
}
