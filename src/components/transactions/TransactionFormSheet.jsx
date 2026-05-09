import React, { useState, useEffect, useRef } from 'react'
import {
  Sheet, PageContent, Block, List, ListInput, Button, f7,
} from 'framework7-react'
import { useCreateTransaction } from '../../hooks/useCreateTransaction'
import TagChip from '../notebooks/TagChip'
import styles from './TransactionFormSheet.module.css'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function formatDateDisplay(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function TransactionFormSheet({
  opened,
  transactionType,
  selectedTags,
  notebookId,
  onBack,
  onClose,
  onSuccess,
}) {
  const [amount, setAmount] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState(todayISO)
  const amountRef = useRef(null)
  const dateInputRef = useRef(null)

  const { mutate, isPending } = useCreateTransaction(notebookId)

  useEffect(() => {
    if (opened) {
      setAmount('')
      setContent('')
      setDate(todayISO())
      const timer = setTimeout(() => amountRef.current?.focus(), 350)
      return () => clearTimeout(timer)
    }
  }, [opened])

  function handleSubmit() {
    const raw = parseFloat(amount)
    if (!amount || isNaN(raw) || raw === 0) {
      f7.toast.create({ text: 'Ingresa un monto válido.', closeTimeout: 2500 }).open()
      return
    }
    const value = transactionType === 'expense' ? -Math.abs(raw) : Math.abs(raw)
    const tagIds = selectedTags.map((t) => t.id ?? t._id).filter(Boolean)

    mutate(
      {
        value,
        date,
        ...(content.trim() && { content: content.trim() }),
        ...(tagIds.length && { tags: tagIds }),
      },
      {
        onSuccess: () => onSuccess(),
        onError: (err) => {
          f7.toast
            .create({
              text: err?.message ?? 'Error al guardar. Intenta de nuevo.',
              closeTimeout: 3000,
            })
            .open()
        },
      }
    )
  }

  const isExpense = transactionType === 'expense'
  const submitLabel = isPending
    ? 'Guardando...'
    : isExpense
    ? 'Añadir Gasto'
    : 'Añadir Ingreso'

  return (
    <Sheet
      opened={opened}
      onSheetClosed={onClose}
      backdrop
      style={{ height: 'auto' }}
    >
      <PageContent className={styles.pageContent}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack} aria-label="Volver">
            <i className="f7-icons">chevron_left</i>
          </button>
          <div className={styles.headerSpacer} />
        </div>

        {selectedTags.length > 0 && (
          <div className={styles.tagsRow} onClick={onBack}>
            {selectedTags.map((tag) => (
              <TagChip key={tag.id ?? tag._id} tag={tag} />
            ))}
            <i className={['f7-icons', styles.tagsChevron].join(' ')}>chevron_right</i>
          </div>
        )}

        <List className={styles.amountList}>
          <li className={styles.amountRow}>
            <span className={styles.currency}>Bs.</span>
            <input
              ref={amountRef}
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.amountInput}
            />
          </li>
        </List>

        <List>
          <ListInput
            type="text"
            placeholder="Descripción"
            value={content}
            onInput={(e) => setContent(e.target.value)}
            clearButton
          />
        </List>

        <div
          className={styles.dateRow}
          onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
        >
          <i className={['f7-icons', styles.calendarIcon].join(' ')}>calendar</i>
          <span className={styles.dateLabel}>{formatDateDisplay(date)}</span>
          <input
            ref={dateInputRef}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.hiddenDateInput}
          />
        </div>

        <Block>
          <Button
            large
            fill
            disabled={isPending}
            onClick={handleSubmit}
            className={isExpense ? styles.expenseSubmit : styles.incomeSubmit}
          >
            {submitLabel}
          </Button>
        </Block>
      </PageContent>
    </Sheet>
  )
}
