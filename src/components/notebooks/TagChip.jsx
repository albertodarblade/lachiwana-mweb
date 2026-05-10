import React from 'react'
import { LUCIDE_ICONS } from '../IconSelector/lucideIcons'
import styles from './TagChip.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

export default function TagChip({ tag, color }) {
  const chipColor = color ?? 'var(--f7-theme-color)'
  const LucideIcon = tag.icon ? lucideMap[tag.icon] : null

  return (
    <div className={styles.chip} style={{ color: chipColor }}>
      {LucideIcon ? (
        <LucideIcon size={14} className={styles.icon} />
      ) : tag.icon ? (
        <i className={['f7-icons', styles.icon].join(' ')}>{tag.icon}</i>
      ) : null}
      <span>{tag.title}</span>
    </div>
  )
}
