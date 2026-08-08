import React from 'react'
import { Card, List, ListItem } from 'framework7-react'
import styles from './TransactionsSummaryCard.module.css'

function formatAmount(value) {
  if (value == null) return '–'
  const abs = Math.abs(value).toFixed(2)
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  return `${sign}Bs. ${abs}`
}

function totalLabel(total) {
  return total == null || total >= 0 ? 'Ahorrado' : 'Gastado de más'
}

function totalClass(total) {
  if (total == null) return styles.placeholder
  if (total < 0) return styles.totalNegative
  if (total > 0) return styles.totalPositive
  return styles.totalNeutral
}

export default function TransactionsSummaryCard({ expensesLabel, incomeLabel, expenses, income, total }) {
  const expensesClass = expenses == null ? styles.placeholder : styles.negative
  const incomeClass = income == null ? styles.placeholder : styles.positive

  return (
    <Card className={styles.card} data-testid="transactions-summary-card">
      <List noShadow noBorder noHairlines className={styles.list}>
        <ListItem
          title={<span className={styles.totalTitle}>{expensesLabel}</span>}
          after={<span className={`${styles.value} ${expensesClass}`}>{formatAmount(expenses)}</span>}
        />
        <ListItem
          title={<span className={styles.totalTitle}>{incomeLabel}</span>}
          after={<span className={`${styles.value} ${incomeClass}`}>{formatAmount(income)}</span>}
        />
        <ListItem
          className={styles.totalRow}
          title={<span className={styles.totalTitle}>{totalLabel(total)}</span>}
          after={<span className={`${styles.value} ${totalClass(total)}`}>{formatAmount(total)}</span>}
        />
      </List>
    </Card>
  )
}
