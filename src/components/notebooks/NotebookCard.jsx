import React, { useMemo } from 'react'
import { Book, Heart } from 'lucide-react'
import { Link } from 'framework7-react'
import { LUCIDE_ICONS } from '../IconSelector/lucideIcons'
import styles from './NotebookCard.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function NotebookCard({ notebook, isPinned = false, onPinToggle }) {
  const color = notebook.color ?? '#FFCC00'
  const destination =
    notebook.type === 'transactions'
      ? `/notebooks/${notebook.id}/transactions`
      : `/notebooks/${notebook.id}/notes`

  const NotebookIcon = notebook.iconName ? (lucideMap[notebook.iconName] ?? Book) : Book

  return (
    <div className={styles.card} data-testid={`notebook-card-${notebook.id}`}>
      <Link href={destination} className={styles.cardLink}>
        <div className={styles.inner}>
          <div
            className={styles.iconContainer}
            style={{ '--card-color': color }}
          >
            <NotebookIcon size={24} className={styles.iconGlyph} style={{ color }} />
          </div>
          <span className={styles.title}>{notebook.title}</span>
        </div>
      </Link>
      {onPinToggle && (
        <button
          className={`${styles.pinButton}${isPinned ? ` ${styles.active}` : ''}`}
          onClick={() => onPinToggle(notebook.id)}
          data-testid={`notebook-card-pin-${notebook.id}`}
        >
          <Heart size={20} fill={isPinned ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  )
}
