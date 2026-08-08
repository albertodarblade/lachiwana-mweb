import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Block, Link } from 'framework7-react'
import styles from './MonthSelector.module.css'

function monthLabel(year, month) {
  return new Date(year, month - 1).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  })
}

export default function MonthSelector({ year, month, onPrev, onNext }) {
  return (
    <Block className={styles.block}>
      <div className={styles.nav}>
        <Link className={styles.chevron} onClick={onPrev} aria-label="Mes anterior" data-testid="month-selector-prev">
          <ChevronLeft size={20} />
        </Link>
        <div className={styles.center}>
          <span className={styles.monthLabel}>{monthLabel(year, month)}</span>
        </div>
        <Link className={styles.chevron} onClick={onNext} aria-label="Mes siguiente" data-testid="month-selector-next">
          <ChevronRight size={20} />
        </Link>
      </div>
    </Block>
  )
}
