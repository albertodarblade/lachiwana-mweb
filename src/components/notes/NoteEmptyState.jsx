import React from 'react'
import { Block } from 'framework7-react'

export default function NoteEmptyState() {
  return (
    <Block style={{ textAlign: 'center', paddingTop: '40px', opacity: 0.5 }}>
      <i className="f7-icons" style={{ fontSize: '48px' }}>note_text</i>
      <p style={{ margin: '12px 0 0', fontSize: '15px' }}>
        Aún no hay notas. ¡Crea la primera!
      </p>
    </Block>
  )
}
