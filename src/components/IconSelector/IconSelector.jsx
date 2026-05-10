import { useState, useMemo, useEffect } from 'react'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import { Sheet, PageContent, Searchbar } from 'framework7-react'
import { LUCIDE_ICONS, DEFAULT_ICONS } from './lucideIcons'
import { SPANISH_MAP } from './spanishIconMap'
import styles from './IconSelector.module.css'

function normalise(str) {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function searchIcons(query) {
  if (!query.trim()) return DEFAULT_ICONS

  const q = normalise(query)

  if (SPANISH_MAP[q]) {
    const names = new Set(SPANISH_MAP[q])
    const results = LUCIDE_ICONS.filter((i) => names.has(i.name))
    if (results.length > 0) return results
  }

  const prefixMatches = Object.entries(SPANISH_MAP)
    .filter(([key]) => key.startsWith(q))
    .flatMap(([, names]) => names)
  if (prefixMatches.length > 0) {
    const names = new Set(prefixMatches)
    const results = LUCIDE_ICONS.filter((i) => names.has(i.name))
    if (results.length > 0) return results
  }

  return LUCIDE_ICONS.filter((i) => i.name.toLowerCase().includes(q))
}

export default function IconSelector({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(timer)
  }, [query])

  const filtered = useMemo(() => searchIcons(debouncedQuery), [debouncedQuery])

  function close() {
    setIsOpen(false)
    setQuery('')
    setDebouncedQuery('')
  }

  function select(iconName) {
    onChange(value === iconName ? null : iconName)
    close()
  }

  const selectedEntry = useMemo(
    () => (value ? LUCIDE_ICONS.find((i) => i.name === value) : null),
    [value]
  )
  const SelectedIcon = selectedEntry?.Icon

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={styles.trigger}
        style={{ color: value ? 'var(--f7-theme-color)' : 'var(--f7-list-item-subtitle-text-color)' }}
        data-testid="icon-selector-trigger"
      >
        {SelectedIcon ? (
          <SelectedIcon size={24} className={styles.triggerIcon} />
        ) : (
          <LayoutGrid size={24} className={styles.triggerIconEmpty} />
        )}
        <span className={styles.triggerLabel}>{value ?? 'Seleccionar ícono'}</span>
        <ChevronRight size={16} className={styles.triggerChevron} />
      </div>

      <Sheet
        opened={isOpen}
        onSheetClosed={close}
        swipeToClose
        backdrop
        style={{ height: '70vh' }}
      >
        {/* Outer wrapper: flex column that fills the sheet height */}
        <div className={styles.sheetOuter}>

          {/* Fixed header — drag handle + searchbar + result count, never scrolls */}
          <div className={styles.header}>
            <div className={styles.dragHandle} />
            <Searchbar
              placeholder="Buscar ícono..."
              value={query}
              onInput={(e) => setQuery(e.target.value)}
              onSearchbarClear={() => setQuery('')}
              data-testid="icon-selector-search"
            />
            <p className={styles.resultCount}>
              {debouncedQuery.trim()
                ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`
                : `${filtered.length} íconos sugeridos — busca para ver más`}
            </p>
          </div>

          {/* PageContent is the ONLY scroll container — icons scroll, header does not */}
          <PageContent className={styles.iconScroll}>
            {filtered.length === 0 && debouncedQuery.trim() ? (
              <div className={styles.emptyBlock}>
                <p>Sin resultados para &ldquo;{debouncedQuery}&rdquo;</p>
                <p>Intenta con otra palabra</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map(({ name, Icon }) => {
                  const selected = value === name
                  return (
                    <div
                      key={name}
                      onClick={() => select(name)}
                      title={name}
                      data-testid={`icon-selector-item-${name}`}
                      className={[
                        styles.gridItem,
                        selected ? styles.gridItemSelected : styles.gridItemDefault,
                      ].join(' ')}
                    >
                      <Icon
                        size={24}
                        className={styles.gridIcon}
                        color={selected ? '#fff' : 'currentColor'}
                      />
                      <span className={styles.gridLabel}>{name}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </PageContent>

        </div>
      </Sheet>
    </>
  )
}
