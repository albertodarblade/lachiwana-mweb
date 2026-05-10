import React, { useState } from 'react'
import { ChevronRight, CircleUser } from 'lucide-react'
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
        data-testid="member-picker-trigger"
      >
        <span>{count > 0 ? `${count} miembro${count !== 1 ? 's' : ''} seleccionado${count !== 1 ? 's' : ''}` : 'Agregar miembros'}</span>
        <ChevronRight size={16} className={styles.triggerChevron} />
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
              data-testid="member-picker-search"
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
                data-testid={`member-picker-user-${user.googleId}`}
              >
                {user.picture
                  ? <img slot="media" src={user.picture} width={40} height={40} className={styles.avatar} alt={user.name} />
                  : <CircleUser slot="media" size={40} className={styles.avatarIcon} />
                }
              </ListItem>
            ))}
          </List>

          <Block>
            <Button large fill onClick={() => setIsOpen(false)} data-testid="member-picker-done">
              Listo
            </Button>
          </Block>
        </PageContent>
      </Sheet>
    </>
  )
}
