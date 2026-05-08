import React from 'react'
import { Block, Link } from 'framework7-react'
import styles from './UpdateBanner.module.css'

export default function UpdateBanner({ waitingWorker, onDismiss }) {
  if (!waitingWorker) return null

  function handleReload() {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }

  return (
    <Block className={styles.banner}>
      <span>Nueva versión disponible</span>
      <div className={styles.links}>
        <Link className={styles.updateLink} onClick={handleReload}>
          Actualizar
        </Link>
        {onDismiss && (
          <Link className={styles.dismissLink} onClick={onDismiss}>
            Ignorar
          </Link>
        )}
      </div>
    </Block>
  )
}
