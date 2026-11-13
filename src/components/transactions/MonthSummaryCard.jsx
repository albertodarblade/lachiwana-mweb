import React from 'react'
import { Card } from 'framework7-react'
import { CalendarClock, Wallet } from 'lucide-react'
import styles from './MonthSummaryCard.module.css'

function formatAmount(value) {
  if (value == null) return '–'
  const abs = Math.abs(value).toFixed(2)
  return `Bs. ${abs}`
}

function valueClass(value) {
  if (value == null) return styles.placeholder
  if (value < 0) return styles.negative
  if (value > 0) return styles.positive
  return styles.neutral
}

export default function MonthSummaryCard({ expenses, income, totalNotebook, showAccumulated }) {
  const monthTotal = (expenses ?? 0) + (income ?? 0)
  const accumulatedValue = totalNotebook == null ? null : totalNotebook - monthTotal

  return (
    <Card className={styles.card} data-testid="month-summary-card">
      <div className={styles.rows}>
        {showAccumulated && (
          <div className={styles.row}>
            <span className={styles.label}><CalendarClock size={16} className={styles.icon} /> Saldo mes anterior</span>
            <span className={`${styles.value} ${valueClass(accumulatedValue)}`}>{formatAmount(accumulatedValue)}</span>
          </div>
        )}
        <div className={`${styles.row} ${showAccumulated ? styles.rowDivider : ''}`}>
          <span className={styles.label}><Wallet size={16} className={styles.icon} /> Balance del cuaderno</span>
          <span className={`${styles.value} ${valueClass(totalNotebook)}`}>{formatAmount(totalNotebook)}</span>
        </div>
      </div>
    </Card>
  )
}