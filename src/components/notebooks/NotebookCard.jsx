import React from 'react'
import { Link } from 'framework7-react'
import styles from './NotebookCard.module.css'

export default function NotebookCard({ notebook }) {
  const color = notebook.color ?? '#FFCC00'
  return (
    <Link
      href={`/notebooks/${notebook.id}`}
      className={styles.card}
    >
      <div className={styles.inner}>
        <div
          className={styles.iconContainer}
          style={{ '--card-color': color }}
        >
          <i className={['f7-icons', styles.iconGlyph].join(' ')} style={{ color }}>
            {notebook.iconName ?? 'book'}
          </i>
        </div>
        <span className={styles.title}>{notebook.title}</span>
      </div>
    </Link>
  )
}
