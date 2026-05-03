import React, { useState, useEffect } from 'react'
import useNetwork from '../hooks/useNetwork'
import { clearReconnected } from '../stores/networkStore'

const toastBase = {
  position: 'fixed',
  bottom: 24,
  left: 0,
  zIndex: 9000,
  borderRadius: 12,
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: '14px',
  fontWeight: 500,
  boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
  cursor: 'pointer',
  userSelect: 'none',
}

export default function OfflineBanner() {
  const { isOnline, justReconnected } = useNetwork()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isOnline) setDismissed(false)
  }, [isOnline])

  if (isOnline && !justReconnected) return null
  if (dismissed) return null

  if (justReconnected) {
    return (
      <div
        style={{ ...toastBase, backgroundColor: 'var(--f7-color-green)', color: '#fff' }}
        onClick={() => { clearReconnected(); setDismissed(true) }}
      >
        <span>Conexión restaurada</span>
        <span style={{ opacity: 0.8, fontSize: 12 }}>Toca para actualizar</span>
      </div>
    )
  }

  return (
    <div
      style={{ ...toastBase, backgroundColor: 'var(--f7-color-red)', color: '#fff' }}
      onClick={() => setDismissed(true)}
    >
      <span>Sin conexión — solo lectura</span>
    </div>
  )
}
