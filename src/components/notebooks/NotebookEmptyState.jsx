import React from 'react'
import { Book } from 'lucide-react'
import { Block } from 'framework7-react'
import styles from './NotebookEmptyState.module.css'

export default function NotebookEmptyState() {
  return (
    <Block className={styles.block}>
      <Book size={64} className={styles.icon} />
      <p className={styles.text}>
        No tienes cuadernos creados
      </p>
    </Block>
  )
}
