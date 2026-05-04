import React, { useState } from 'react'
import { Sheet, PageContent, Block, Searchbar, List, ListItem, Button } from 'framework7-react'

export default function MemberPicker({ allUsers = [], selectedIds, onChange, excludeId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = allUsers.filter((u) => {
    if (u.googleId === excludeId) return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  })

  function toggleUser(googleId) {
    const next = new Set(selectedIds)
    if (next.has(googleId)) {
      next.delete(googleId)
    } else {
      next.add(googleId)
    }
    onChange(next)
  }

  const count = selectedIds.size

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          color: count > 0 ? 'var(--f7-theme-color)' : 'var(--f7-list-item-subtitle-text-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{count > 0 ? `${count} miembro${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}` : 'Agregar miembros'}</span>
        <i className="f7-icons" style={{ fontSize: '16px', opacity: 0.5 }}>chevron_right</i>
      </div>

      <Sheet
        opened={isOpen}
        onSheetClosed={() => { setIsOpen(false); setSearchQuery('') }}
        swipeToClose
        backdrop
        style={{ height: 'auto' }}
      >
        <PageContent style={{ padding: '0 0 32px' }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'rgba(0,0,0,0.15)', margin: '12px auto 4px',
          }} />

          <div style={{ position: 'sticky', top: 0, background: 'var(--f7-page-bg-color)', zIndex: 10, paddingTop: 4 }}>
            <Searchbar
              placeholder="Buscar por nombre o email"
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
              onSearchbarClear={() => setSearchQuery('')}
            />
          </div>

          {filtered.length === 0 && (
            <Block style={{ textAlign: 'center', color: 'var(--f7-block-text-color)', opacity: 0.6 }}>
              <p>No hay usuarios disponibles</p>
            </Block>
          )}

          <List>
            {filtered.map((user) => (
              <ListItem
                key={user.googleId}
                checkbox
                checked={selectedIds.has(user.googleId)}
                onChange={() => toggleUser(user.googleId)}
                title={user.name}
                subtitle={user.email}
              >
                {user.picture
                  ? <img slot="media" src={user.picture} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} alt={user.name} />
                  : <i slot="media" className="f7-icons" style={{ fontSize: 40 }}>person_circle</i>
                }
              </ListItem>
            ))}
          </List>

          <Block>
            <Button large fill onClick={() => setIsOpen(false)}>
              Listo
            </Button>
          </Block>
        </PageContent>
      </Sheet>
    </>
  )
}
