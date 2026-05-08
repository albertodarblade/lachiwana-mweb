import React from 'react'
import { Link } from 'framework7-react'
import styles from './NotebookCard.module.css'

export default function NotebookCard({ notebook }) {
  return (
    <Link
      href={`/notebooks/${notebook.id}`}
      className={styles.card}
    >
      <div className={styles.inner}>
        <div
          className={styles.colorBar}
          style={{ background: notebook.color ?? 'var(--f7-theme-color)' }}
        />
        <div className={styles.iconCol}>
          <i
            className={['f7-icons', styles.iconGlyph].join(' ')}
            style={{ color: notebook.color ?? 'var(--f7-theme-color)' }}
          >
            {notebook.iconName ?? 'book'}
          </i>
        </div>
        <span className={styles.title}>
          {notebook.title}
        </span>
      </div>
    </Link>
  )
}
