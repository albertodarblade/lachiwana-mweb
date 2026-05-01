import React, { useState, useEffect, useRef } from 'react'
import { Sheet, PageContent, Block, Button } from 'framework7-react'

const COUNTDOWN_START = 5

export default function DeleteConfirmDialog({ notebook, opened, onClose, onConfirm, isDeleting }) {
  const [countdown, setCountdown] = useState(COUNTDOWN_START)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (opened) {
      setCountdown(COUNTDOWN_START)
      intervalRef.current = setInterval(() => {
        setCountdown((n) => {
          if (n <= 1) {
            clearInterval(intervalRef.current)
            return 0
          }
          return n - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      setCountdown(COUNTDOWN_START)
    }
    return () => clearInterval(intervalRef.current)
  }, [opened])

  const confirmLabel = countdown > 0
    ? `Espera ${countdown}s`
    : isDeleting
      ? 'Eliminando...'
      : 'Eliminar'

  return (
    <Sheet
      opened={opened}
      onSheetClosed={onClose}
      onSheetClose={() => {}}
      style={{ height: 'auto' }}
      swipeToClose={false}
      backdrop
    >
      <PageContent style={{ padding: '24px 16px 40px' }}>
        <Block style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>
            Eliminar Cuaderno
          </h3>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '14px', lineHeight: 1.5 }}>
            ¿Eliminar <strong>«{notebook?.title ?? ''}»</strong>?
            Esta acción no se puede deshacer.
          </p>
        </Block>

        <Button
          large
          fill
          color="red"
          disabled={countdown > 0 || isDeleting}
          onClick={onConfirm}
          style={{ marginBottom: '12px' }}
        >
          {confirmLabel}
        </Button>

        <Button large outline onClick={onClose} disabled={isDeleting}>
          Cancelar
        </Button>
      </PageContent>
    </Sheet>
  )
}
