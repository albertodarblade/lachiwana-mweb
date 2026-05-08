import React from 'react'
import styles from './TagChip.module.css'

export default function TagChip({ tag, color }) {
  const chipColor = color ?? 'var(--f7-theme-color)'
  return (
    <div className={styles.chip} style={{ color: chipColor }}>
      <i className={['f7-icons', styles.icon].join(' ')}>{tag.icon}</i>
      <span>{tag.title}</span>
    </div>
  )
}
