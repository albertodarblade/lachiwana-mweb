import React from 'react'
import { CheckSquare } from 'lucide-react'
import { Block } from 'framework7-react'
import styles from './TaskEmptyState.module.css'

export default function TaskEmptyState() {
  return (
    <Block className={styles.block}>
      <CheckSquare size={48} className={styles.icon} />
      <p className={styles.text}>
        Próximamente: tareas
      </p>
    </Block>
  )
}
