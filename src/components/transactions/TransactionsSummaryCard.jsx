import React from 'react'
import { Card } from 'framework7-react'
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import styles from './TransactionsSummaryCard.module.css'

function formatAmount(value) {
  if (value == null) return '–'
  const abs = Math.abs(value).toFixed(2)
  return `Bs. ${abs}`
}

function valueClass(value, kind) {
  if (value == null) return styles.placeholder
  if (kind === 'expense') return styles.negative
  if (kind === 'income') return styles.positive
  if (value < 0) return styles.totalNegative
  if (value > 0) return styles.totalPositive
  return styles.totalNeutral
}

export default function TransactionsSummaryCard({ expensesLabel, incomeLabel, expenses, income, total }) {
  return (
    <Card className={styles.card} data-testid="transactions-summary-card">
      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.label}><TrendingDown size={16} className={styles.icon} /> {expensesLabel || 'Gastos'}</span>
          <span className={`${styles.value} ${valueClass(expenses, 'expense')}`}>{formatAmount(expenses)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}><TrendingUp size={16} className={styles.icon} /> {incomeLabel || 'Ingresos'}</span>
          <span className={`${styles.value} ${valueClass(income, 'income')}`}>{formatAmount(income)}</span>
        </div>
        <div className={`${styles.row} ${styles.totalRow}`}>
          <span className={styles.label}><Wallet size={16} className={styles.icon} /> Balance</span>
          <span className={`${styles.value} ${valueClass(total)}`}>{formatAmount(total)}</span>
        </div>
      </div>
    </Card>
  )
}
