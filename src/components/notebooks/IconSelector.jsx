import React, { useState, useMemo } from 'react'
import { Sheet, PageContent, Searchbar, Block } from 'framework7-react'
import { ALL_F7_ICONS } from './f7Icons'

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
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: value ? 'var(--f7-theme-color)' : 'var(--f7-list-item-subtitle-text-color)',
        }}
      >
        {value ? (
          <i className="f7-icons" style={{ fontSize: '28px' }}>{value}</i>
        ) : (
          <i className="f7-icons" style={{ fontSize: '28px', opacity: 0.4 }}>square_grid_2x2</i>
        )}
        <span style={{ flex: 1 }}>{value ?? 'Seleccionar ícono'}</span>
        <i className="f7-icons" style={{ fontSize: '16px', opacity: 0.5 }}>chevron_right</i>
      </div>

      <Sheet
        opened={isOpen}
        onSheetClosed={close}
        swipeToClose
        backdrop
        style={{ height: 'auto' }}
      >
        <PageContent style={{ paddingTop: 0 }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'rgba(0,0,0,0.15)', margin: '12px auto 8px',
          }} />
          <div style={{ position: 'sticky', top: 0, background: 'var(--f7-page-bg-color)', zIndex: 10, paddingTop: '4px' }}>
            <Searchbar
              placeholder="Buscar ícono..."
              value={query}
              onInput={(e) => setQuery(e.target.value)}
              onSearchbarClear={() => setQuery('')}
            />
            <p style={{ margin: '4px 16px 8px', fontSize: '12px', color: 'var(--f7-block-text-color)', opacity: 0.6 }}>
              {query.trim()
                ? `${totalMatches} resultado${totalMatches !== 1 ? 's' : ''}`
                : `Mostrando ${INITIAL_LIMIT} de ${ALL_F7_ICONS.length} — busca para filtrar`}
            </p>
          </div>

          {filtered.length === 0 && (
            <Block style={{ textAlign: 'center', opacity: 0.6 }}>
              <p>Sin resultados para "{query}"</p>
            </Block>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            padding: '0 12px 80px',
          }}>
            {filtered.map((icon) => {
              const selected = value === icon
              return (
                <div
                  key={icon}
                  onClick={() => select(icon)}
                  title={icon}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 4px 6px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: selected ? 'var(--f7-theme-color)' : 'transparent',
                    color: selected ? '#fff' : 'inherit',
                    gap: '4px',
                  }}
                >
                  <i className="f7-icons" style={{ fontSize: '24px' }}>{icon}</i>
                  <span style={{
                    fontSize: '8px',
                    lineHeight: 1.2,
                    textAlign: 'center',
                    wordBreak: 'break-all',
                    opacity: 0.7,
                    maxWidth: '100%',
                  }}>
                    {icon}
                  </span>
                </div>
              )
            })}
          </div>
        </PageContent>
      </Sheet>
    </>
  )
}
