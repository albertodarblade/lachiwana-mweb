import React from 'react'
import { FileText } from 'lucide-react'
import { Block } from 'framework7-react'
import styles from './NoteEmptyState.module.css'

export default function NoteEmptyState() {
  return (
    <Block className={styles.block}>
      <FileText size={48} className={styles.icon} />
      <p className={styles.text}>
        Aún no hay notas. ¡Crea la primera!
      </p>
    </Block>
  )
}
