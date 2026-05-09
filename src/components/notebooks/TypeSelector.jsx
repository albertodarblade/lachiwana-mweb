import React from 'react'
import { List, ListItem } from 'framework7-react'
import styles from './TypeSelector.module.css'

const OPTIONS = [
  { value: 'notes', label: 'Notas', icon: 'note_text' },
  { value: 'transactions', label: 'Transacciones', icon: 'arrow_right_arrow_left_square' },
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
        >
          <i slot="media" className={['f7-icons', styles.optionIcon].join(' ')}>
            {opt.icon}
          </i>
        </ListItem>
      ))}
    </List>
  )
}
