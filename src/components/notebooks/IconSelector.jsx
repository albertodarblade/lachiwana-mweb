import React, { useState, useMemo } from 'react'
import { Sheet, PageContent, Searchbar, Block } from 'framework7-react'
import { ALL_F7_ICONS } from './f7Icons'
import styles from './IconSelector.module.css'

const INITIAL_LIMIT = 96

export default function IconSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_F7_ICONS.slice(0, INITIAL_LIMIT)
    const q = query.trim().toLowerCase()
    return ALL_F7_ICONS.filter((name) => name.includes(q))
  }, [query])

  const totalMatches = useMemo(() => {
    if (!query.trim()) return ALL_F7_ICONS.length
    const q = query.trim().toLowerCase()
    return ALL_F7_ICONS.filter((name) => name.includes(q)).length
  }, [query])

  function close() {
    setIsOpen(false)
    setQuery('')
  }

  function select(icon) {
    onChange(value === icon ? null : icon)
    close()
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={styles.trigger}
        style={{ color: value ? 'var(--f7-theme-color)' : 'var(--f7-list-item-subtitle-text-color)' }}
      >
        {value ? (
          <i className={['f7-icons', styles.triggerIcon].join(' ')}>{value}</i>
        ) : (
          <i className={['f7-icons', styles.triggerIconEmpty].join(' ')}>square_grid_2x2</i>
        )}
        <span className={styles.triggerLabel}>{value ?? 'Seleccionar ícono'}</span>
        <i className={['f7-icons', styles.triggerChevron].join(' ')}>chevron_right</i>
      </div>

      <Sheet
        opened={isOpen}
        onSheetClosed={close}
        swipeToClose
        backdrop
        style={{ height: '70vh' }}
      >
        <PageContent className={styles.sheetContent}>
          <div className={styles.dragHandle} />
          <div className={styles.stickyHeader}>
            <Searchbar
              placeholder="Buscar ícono..."
              value={query}
              onInput={(e) => setQuery(e.target.value)}
              onSearchbarClear={() => setQuery('')}
            />
            <p className={styles.resultCount}>
              {query.trim()
                ? `${totalMatches} resultado${totalMatches !== 1 ? 's' : ''}`
                : `Mostrando ${INITIAL_LIMIT} de ${ALL_F7_ICONS.length} — busca para filtrar`}
            </p>
          </div>

          {filtered.length === 0 && (
            <Block className={styles.emptyBlock}>
              <p>Sin resultados para "{query}"</p>
            </Block>
          )}

          <div className={styles.grid}>
            {filtered.map((icon) => {
              const selected = value === icon
              return (
                <div
                  key={icon}
                  onClick={() => select(icon)}
                  title={icon}
                  className={[styles.gridItem, selected ? styles.gridItemSelected : styles.gridItemDefault].join(' ')}
                >
                  <i className={['f7-icons', styles.gridIcon].join(' ')}>{icon}</i>
                  <span className={styles.gridLabel}>{icon}</span>
                </div>
              )
            })}
          </div>
        </PageContent>
      </Sheet>
    </>
  )
}
