import React from 'react'
import { Block } from 'framework7-react'
import styles from './NotebookEmptyState.module.css'

export default function NotebookEmptyState() {
  return (
    <Block className={styles.block}>
      <i className={['f7-icons', styles.icon].join(' ')}>book</i>
      <p className={styles.text}>
        No tienes cuadernos creados
      </p>
    </Block>
  )
}
