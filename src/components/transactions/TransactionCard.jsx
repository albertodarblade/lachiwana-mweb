import React from 'react'
import { Paperclip } from 'lucide-react'
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

function formatAmount(value) {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : value > 0 ? '+' : ''
  return `${sign}Bs. ${abs}`
}

export default function TransactionCard({ transaction, onClick }) {
  const { content, value, date, tags = [], attachments = [] } = transaction

  const amountClass =
    value < 0 ? styles.negative : value > 0 ? styles.positive : styles.neutral

  return (
    <div className={styles.card} onClick={onClick} data-testid={`transaction-card-${transaction.id}`}>
      <div className={styles.row}>
        <span className={styles.description}>{content}</span>
        <span className={[styles.amount, amountClass].join(' ')}>
          {formatAmount(value)}
        </span>
      </div>
      <div className={styles.meta}>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <TagChip key={tag._id ?? tag.title} tag={tag} />
          ))}
          {attachments.length > 0 && (
            <span className={styles.attachBadge}>
              <Paperclip size={14} />
              {attachments.length}
            </span>
          )}
        </div>
        <span className={styles.date}>{relativeDate(date)}</span>
      </div>
    </div>
  )
}
