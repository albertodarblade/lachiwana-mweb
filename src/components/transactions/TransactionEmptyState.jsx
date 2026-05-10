import React from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Block } from 'framework7-react'
import styles from './TransactionEmptyState.module.css'

export default function TransactionEmptyState() {
  return (
    <Block className={styles.block}>
      <ArrowLeftRight size={48} className={styles.icon} />
      <p className={styles.text}>Sin movimientos en este período.</p>
    </Block>
  )
}
