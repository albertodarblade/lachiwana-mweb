import React, { useState } from 'react'
import { Sheet, PageContent, Block, Searchbar, List, ListItem, Button } from 'framework7-react'
import styles from './MemberPicker.module.css'

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
        className={styles.trigger}
        style={{ color: count > 0 ? 'var(--f7-theme-color)' : 'var(--f7-list-item-subtitle-text-color)' }}
      >
        <span>{count > 0 ? `${count} miembro${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}` : 'Agregar miembros'}</span>
        <i className={['f7-icons', styles.triggerChevron].join(' ')}>chevron_right</i>
      </div>

      <Sheet
        opened={isOpen}
        onSheetClosed={() => { setIsOpen(false); setSearchQuery('') }}
        swipeToClose
        backdrop
        style={{ height: 'auto' }}
      >
        <PageContent className={styles.pageContent}>
          <div className={styles.dragHandle} />

          <div className={styles.stickySearch}>
            <Searchbar
              placeholder="Buscar por nombre o email"
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
              onSearchbarClear={() => setSearchQuery('')}
            />
          </div>

          {filtered.length === 0 && (
            <Block className={styles.emptyBlock}>
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
                  ? <img slot="media" src={user.picture} width={40} height={40} className={styles.avatar} alt={user.name} />
                  : <i slot="media" className={['f7-icons', styles.avatarIcon].join(' ')}>person_circle</i>
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
