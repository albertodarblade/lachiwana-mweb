import React from 'react'
import { Block, Link } from 'framework7-react'

export default function UpdateBanner({ waitingWorker, onDismiss }) {
  if (!waitingWorker) return null

  function handleReload() {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }

  return (
    <Block
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9000,
        margin: 0,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--f7-color-blue)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      <span>Nueva versión disponible</span>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link
          style={{ color: '#fff', fontWeight: 600, textDecoration: 'underline' }}
          onClick={handleReload}
        >
          Actualizar
        </Link>
        {onDismiss && (
          <Link style={{ color: 'rgba(255,255,255,0.7)' }} onClick={onDismiss}>
            Ignorar
          </Link>
        )}
      </div>
    </Block>
  )
}
