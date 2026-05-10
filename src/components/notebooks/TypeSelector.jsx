import React from 'react'
import { FileText, ArrowLeftRight } from 'lucide-react'
import { List, ListItem } from 'framework7-react'
import styles from './TypeSelector.module.css'

const OPTIONS = [
  { value: 'notes', label: 'Notas', Icon: FileText },
  { value: 'transactions', label: 'Transacciones', Icon: ArrowLeftRight },
]

export default function TypeSelector({ value, onChange, disabled = false }) {
  return (
    <List className={styles.list}>
      {OPTIONS.map((opt) => (
        <ListItem
          key={opt.value}
          radio
          radioIcon="end"
          name="notebook-type"
          value={opt.value}
          title={opt.label}
          checked={value === opt.value}
          disabled={disabled}
          onChange={() => onChange(opt.value)}
          className={value === opt.value ? styles.selected : ''}
          data-testid={`notebook-type-${opt.value}`}
        >
          <opt.Icon slot="media" size={20} className={styles.optionIcon} />
        </ListItem>
      ))}
    </List>
  )
}
