import React from 'react'

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 400 }}>{s.label}</span>
    </div>
  )
}
