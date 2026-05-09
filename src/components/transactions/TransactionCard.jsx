import React from 'react'
import TagChip from '../notebooks/TagChip'
import styles from './TransactionCard.module.css'

function relativeDate(isoDate) {
  const d = new Date(isoDate)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function formatAmount(amount) {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : amount > 0 ? '+' : ''
  return `${sign}Bs. ${abs}`
}

export default function TransactionCard({ transaction }) {
  const { description, amount, date, tags = [], attachments = [] } = transaction

  const amountClass =
    amount < 0 ? styles.negative : amount > 0 ? styles.positive : styles.neutral

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <span className={styles.description}>{description}</span>
        <span className={[styles.amount, amountClass].join(' ')}>
          {formatAmount(amount)}
        </span>
      </div>
      <div className={styles.meta}>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <TagChip key={tag._id ?? tag.title} tag={tag} />
          ))}
          {attachments.length > 0 && (
            <span className={styles.attachBadge}>
              <i className="f7-icons">paperclip</i>
              {attachments.length}
            </span>
          )}
        </div>
        <span className={styles.date}>{relativeDate(date)}</span>
      </div>
    </div>
  )
}
