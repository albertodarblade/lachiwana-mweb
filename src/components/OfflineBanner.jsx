import React from 'react'
import useNetwork from '../hooks/useNetwork'
import { clearReconnected, dismissOfflineBanner } from '../stores/networkStore'
import styles from './OfflineBanner.module.css'

export default function OfflineBanner() {
  const { isOnline, justReconnected, offlineDismissed } = useNetwork()

  if (isOnline && !justReconnected) return null
  if (offlineDismissed) return null

  if (justReconnected) {
    return (
      <div
        className={[styles.toast, styles.online].join(' ')}
        onClick={() => { clearReconnected(); dismissOfflineBanner() }}
        data-testid="offline-banner-reconnected"
      >
        <span>Conexión restaurada</span>
        <span className={styles.subtext}>Toca para actualizar</span>
      </div>
    )
  }

  return (
    <div
      className={[styles.toast, styles.offline].join(' ')}
      data-testid="offline-banner-offline"
    >
      <span>Sin conexión — mostrando datos guardados</span>
    </div>
  )
}
