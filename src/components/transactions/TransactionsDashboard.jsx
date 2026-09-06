import React from 'react'
import { Block } from 'framework7-react'
import styles from './TransactionsDashboard.module.css'

function formatAmount(value) {
  const abs = Math.abs(value).toFixed(2)
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  return `${sign}Bs. ${abs}`
}

export default function TransactionsDashboard({ transactions, tags, color }) {
  const groups = new Map()

  transactions.forEach((t) => {
    const tagIds = t.tags ?? []
    const value = t.value ?? 0
    const targets = tagIds.length > 0 ? tagIds : [null]

    targets.forEach((tagId) => {
      const tag = tagId == null ? null : tags.find((x) => (x.id ?? x._id) === tagId)
      const key = tagId == null ? 'none' : tagId
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label: tag?.title ?? 'Sin categoría',
          rowColor: tag?.color ?? null,
          expenses: 0,
          income: 0,
          count: 0,
        })
      }
      const g = groups.get(key)
      if (value < 0) g.expenses += value
      else if (value > 0) g.income += value
      g.count += 1
    })
  })

  const rows = [...groups.values()].sort((a, b) => {
    const aTotal = a.expenses + a.income
    const bTotal = b.expenses + b.income
    return Math.abs(bTotal) - Math.abs(aTotal)
  })
  const maxMagnitude = Math.max(1, ...rows.map((r) => Math.abs(r.expenses + r.income)))

  if (rows.length === 0) {
    return (
      <Block className={styles.empty}>
        Sin movimientos en el periodo seleccionado.
      </Block>
    )
  }

  return (
    <div className={styles.list}>
      {rows.map((row) => {
        const magnitude = Math.abs(row.expenses + row.income)
        const barWidth = Math.round((magnitude / maxMagnitude) * 100)
        const rowColor = row.rowColor ?? color
        return (
          <div key={row.key} className={styles.card}>
            <div className={styles.header}>
              <span className={styles.dot} style={{ background: rowColor }} />
              <span className={styles.label}>{row.label}</span>
              <span className={styles.count}>
                {row.count} {row.count === 1 ? 'movimiento' : 'movimientos'}
              </span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.bar} style={{ width: `${barWidth}%`, background: rowColor }} />
            </div>
            <div className={styles.amounts}>
              {row.expenses < 0 && (
                <span className={styles.negative}>Gastos: {formatAmount(row.expenses)}</span>
              )}
              {row.income > 0 && (
                <span className={styles.positive}>Ingresos: {formatAmount(row.income)}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}