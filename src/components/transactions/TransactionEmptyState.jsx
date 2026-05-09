import React from 'react'
import { Block } from 'framework7-react'
import styles from './TransactionEmptyState.module.css'

export default function TransactionEmptyState() {
  return (
    <Block className={styles.block}>
      <i className={['f7-icons', styles.icon].join(' ')}>
        arrow_right_arrow_left_square
      </i>
      <p className={styles.text}>Sin movimientos en este período.</p>
    </Block>
  )
}
