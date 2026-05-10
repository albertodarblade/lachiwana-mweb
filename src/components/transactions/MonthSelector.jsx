import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Block } from 'framework7-react'
import styles from './MonthSelector.module.css'

function monthLabel(year, month) {
  return new Date(year, month - 1).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  })
}

function formatTotal(total) {
  const abs = Math.abs(total)
  const sign = total < 0 ? '-' : total > 0 ? '+' : ''
  return `${sign}Bs. ${abs}`
}

export default function MonthSelector({ year, month, total, onPrev, onNext }) {
  const totalClass =
    total < 0 ? styles.negative : total > 0 ? styles.positive : styles.neutral

  return (
    <Block className={styles.block}>
      <div className={styles.nav}>
        <button className={styles.chevron} onClick={onPrev} aria-label="Mes anterior" data-testid="month-selector-prev">
          <ChevronLeft size={20} />
        </button>
        <div className={styles.center}>
          <span className={styles.monthLabel}>{monthLabel(year, month)}</span>
          <span className={[styles.total, totalClass].join(' ')}>
            {formatTotal(total)}
          </span>
        </div>
        <button className={styles.chevron} onClick={onNext} aria-label="Mes siguiente" data-testid="month-selector-next">
          <ChevronRight size={20} />
        </button>
      </div>
    </Block>
  )
}
