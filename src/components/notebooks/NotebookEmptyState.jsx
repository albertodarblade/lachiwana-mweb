import React from 'react'
import { Block } from 'framework7-react'

export default function NotebookEmptyState() {
  return (
    <Block style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      gap: '12px',
      color: 'var(--f7-block-text-color)',
    }}>
      <i className="f7-icons" style={{ fontSize: '64px', opacity: 0.35 }}>book</i>
      <p style={{ margin: 0, fontSize: '16px', textAlign: 'center', opacity: 0.6 }}>
        No tienes cuadernos creados
      </p>
    </Block>
  )
}
