import React, { useMemo } from 'react'
import { Book } from 'lucide-react'
import { Link } from 'framework7-react'
import { LUCIDE_ICONS } from '../IconSelector/lucideIcons'
import styles from './NotebookCard.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function NotebookCard({ notebook }) {
  const color = notebook.color ?? '#FFCC00'
  const destination =
    notebook.type === 'transactions'
      ? `/notebooks/${notebook.id}/transactions`
      : `/notebooks/${notebook.id}/notes`

  const NotebookIcon = notebook.iconName ? (lucideMap[notebook.iconName] ?? Book) : Book

  return (
    <Link
      href={destination}
      className={styles.card}
      data-testid={`notebook-card-${notebook.id}`}
    >
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
  )
}
