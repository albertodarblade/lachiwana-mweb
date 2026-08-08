import React from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, Accordion, AccordionItem, AccordionToggle, AccordionContent, List, ListItem } from 'framework7-react'
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
  const expensesClass = expenses == null ? styles.placeholder : styles.negative
  const incomeClass = income == null ? styles.placeholder : styles.positive

  const balanceAfter = (value) => (
    <span className={`${styles.balanceValue} ${balanceClass(value)}`}>
      <span>{balanceLabel(value)}</span>
      <span>{formatAmount(value)}</span>
    </span>
  )

  return (
    <Card className={styles.card} data-testid="month-summary-card">
      <Accordion className={styles.accordion}>
        <AccordionItem>
          <AccordionToggle className={styles.coverRow}>
            <span className={`${styles.coverValue} ${expensesClass}`}>{formatAmount(expenses)}</span>
            <span className={styles.coverSeparator}>·</span>
            <span className={`${styles.coverValue} ${incomeClass}`}>{formatAmount(income)}</span>
            <span className={styles.coverSeparator}>·</span>
            <span className={`${styles.coverValue} ${balanceClass(monthTotal)}`}>{formatAmount(monthTotal)}</span>
            <ChevronDown size={14} className={styles.coverChevron} />
          </AccordionToggle>
          <AccordionContent className={styles.content}>
            <List noShadow noBorder noHairlines className={styles.list}>
              <ListItem
                title={<span className={styles.balanceTitle}>Gastos del mes</span>}
                after={<span className={`${styles.value} ${expensesClass}`}>{formatAmount(expenses)}</span>}
              />
              <ListItem
                title={<span className={styles.balanceTitle}>Ingresos del mes</span>}
                after={<span className={`${styles.value} ${incomeClass}`}>{formatAmount(income)}</span>}
              />
              <ListItem
                className={styles.balanceRow}
                title={<span className={styles.balanceTitle}>Total del mes</span>}
                after={balanceAfter(monthTotal)}
              />
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
                after={balanceAfter(totalNotebook)}
              />
            </List>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
