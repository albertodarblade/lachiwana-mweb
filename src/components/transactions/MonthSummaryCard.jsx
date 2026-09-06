import React from 'react'
import { Card, List, ListItem } from 'framework7-react'
import styles from './MonthSummaryCard.module.css'

function formatAmount(value) {
  if (value == null) return '–'
  const abs = Math.abs(value).toFixed(2)
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  return `${sign}Bs. ${abs}`
}

function balanceLabel(value) {
  return value == null || value >= 0 ? 'Ahorrado' : 'Gastado de más'
}

function balanceClass(value) {
  if (value == null) return styles.placeholder
  if (value < 0) return styles.totalNegative
  if (value > 0) return styles.totalPositive
  return styles.totalNeutral
}

export default function MonthSummaryCard({ expenses, income, totalNotebook, showAccumulated }) {
  const monthTotal = (expenses ?? 0) + (income ?? 0)
  const accumulatedValue = totalNotebook == null ? null : totalNotebook - monthTotal

  const balanceValue = (value) => (
    <span className={`${styles.balanceValue} ${balanceClass(value)}`}>
      <span>{balanceLabel(value)}</span>
      <span>{formatAmount(value)}</span>
    </span>
  )

  return (
    <Card className={styles.card} data-testid="month-summary-card">
      <List noShadow noBorder noHairlines className={styles.list}>
        {showAccumulated && (
          <ListItem
            className={styles.balanceRow}
            title={<span className={styles.balanceTitle}>Saldo acumulado último mes</span>}
            after={<span className={`${styles.value} ${styles.accumulated}`}>{formatAmount(accumulatedValue)}</span>}
          />
        )}
        <ListItem
          className={styles.balanceRow}
          title={<span className={styles.balanceTitle}>Total del cuaderno</span>}
          after={balanceValue(totalNotebook)}
        />
      </List>
    </Card>
  )
}