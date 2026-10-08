import React from 'react'
import styles from './ErrorBoundary.module.css'

export default class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Error capturado:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    const { error } = this.state

    if (error) {
      return (
        <div className={styles.container} role="alert">
          <div className={styles.card}>
            <span className={styles.emoji} aria-hidden="true">🙂</span>
            <h1 className={styles.title}>Ups, algo pasó</h1>
            <p className={styles.message}>
              Algo salió mal al cargar la página. Casi siempre se arregla
              refrescando, así que por favor refresca la página e intenta de
              nuevo. ¡Gracias por tu paciencia!
            </p>
            <button className={styles.button} onClick={this.handleReload}>
              Refrescar página
            </button>
            {error?.message ? (
              <details className={styles.details}>
                <summary>Detalles técnicos</summary>
                <pre className={styles.detailText}>{String(error.message)}</pre>
              </details>
            ) : null}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
