import React from 'react'
import styles from './SaveStatusIndicator.module.css'

const STATES = {
  editing: { color: '#007AFF', label: 'Editando...' },
  saving:  { color: '#007AFF', label: 'Guardando...' },
  saved:   { color: '#34C759', label: 'Guardado' },
  error:   { color: '#FF3B30', label: 'No guardado' },
}

export default function SaveStatusIndicator({ status }) {
  const s = STATES[status]
  if (!s) return null
  return (
    <div className={styles.wrapper}>
      <div className={styles.dot} style={{ background: s.color }} />
      <span className={styles.label}>{s.label}</span>
    </div>
  )
}
