import React from 'react'
import { Block } from 'framework7-react'
import styles from './NoteEmptyState.module.css'

export default function NoteEmptyState() {
  return (
    <Block className={styles.block}>
      <i className={['f7-icons', styles.icon].join(' ')}>note_text</i>
      <p className={styles.text}>
        Aún no hay notas. ¡Crea la primera!
      </p>
    </Block>
  )
}
