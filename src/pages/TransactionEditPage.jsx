import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Calendar } from 'lucide-react'
import {
  Page, Navbar, NavLeft, NavTitle,
  Block, List, ListInput, Preloader, f7,
} from 'framework7-react'
import { useTransaction } from '../hooks/useTransaction'
import { useNotebook } from '../hooks/useNotebook'
import { useUpdateTransaction } from '../hooks/useUpdateTransaction'
import SaveStatusIndicator from '../components/notes/SaveStatusIndicator'
import TagChip from '../components/notebooks/TagChip'
import TagSelectionSheet from '../components/transactions/TagSelectionSheet'
import TagsPopup from '../components/notebooks/TagsPopup'
import styles from './TransactionEditPage.module.css'

const DEBOUNCE_MS = 300

function formatDateDisplay(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function TransactionEditPage({ f7route }) {
  const notebookId = f7route?.params?.notebookId
  const transactionId = f7route?.params?.transactionId

  const { data: transaction, isLoading, isFetching } = useTransaction(notebookId, transactionId)
  const { data: notebook } = useNotebook(notebookId)
  const notebookTags = notebook?.tags ?? []
  const { mutate } = useUpdateTransaction(notebookId, transactionId)

  const [saveStatus, setSaveStatus] = useState('saved')
  const [amount, setAmount] = useState('')
  const [isExpense, setIsExpense] = useState(true)
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [tagSheetOpen, setTagSheetOpen] = useState(false)
  const [tagsPopupOpen, setTagsPopupOpen] = useState(false)

  const debounceRef = useRef(null)
  const dateInputRef = useRef(null)
  const needsInitRef = useRef(true)

  // Re-initialize form fields on every page visit.
  function handlePageBeforeIn() {
    needsInitRef.current = true
  }

  useEffect(() => {
    if (transaction && needsInitRef.current) {
      needsInitRef.current = false
      const val = transaction.value ?? 0
      setAmount(String(Math.abs(val)))
      setIsExpense(val < 0)
      setContent(transaction.content ?? '')
      setDate(transaction.date ? transaction.date.split('T')[0] : '')
      setSelectedTagIds(transaction.tags ?? [])
      setSaveStatus('saved')
    }
  }, [transaction])

  function save(payload) {
    setSaveStatus('saving')
    mutate(payload, {
      onSuccess: () => setSaveStatus('saved'),
      onError: () => {
        setSaveStatus('error')
        f7.toast.create({
          text: 'Error al guardar. Intenta de nuevo.',
          closeTimeout: 3000,
          position: 'top',
        }).open()
      },
    })
  }

  function triggerDebounced(payload) {
    setSaveStatus('editing')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(payload), DEBOUNCE_MS)
  }

  function handleAmountChange(e) {
    const raw = e.target.value
    setAmount(raw)
    const parsed = parseFloat(raw)
    if (!raw || isNaN(parsed) || parsed === 0) { setSaveStatus('editing'); return }
    triggerDebounced({ value: isExpense ? -Math.abs(parsed) : Math.abs(parsed) })
  }

  function handleTypeToggle(toExpense) {
    if (toExpense === isExpense) return
    setIsExpense(toExpense)
    const parsed = parseFloat(amount)
    if (!amount || isNaN(parsed) || parsed === 0) return
    triggerDebounced({ value: toExpense ? -Math.abs(parsed) : Math.abs(parsed) })
  }

  function handleContentChange(e) {
    const val = e.target.value
    setContent(val)
    triggerDebounced({ content: val.trim() })
  }

  function handleDateChange(e) {
    const val = e.target.value
    setDate(val)
    save({ date: val })
  }

  function handleTagsConfirm(newIds) {
    const ids = [...newIds]
    setSelectedTagIds(ids)
    setTagSheetOpen(false)
    save({ tags: ids })
  }

  function handleEditTags() {
    setTagSheetOpen(false)
    setTimeout(() => setTagsPopupOpen(true), 300)
  }

  function handleTagsPopupClose() {
    setTagsPopupOpen(false)
    setTimeout(() => setTagSheetOpen(true), 300)
  }

  const resolvedTags = selectedTagIds
    .map((tagId) => notebookTags.find((t) => (t.id ?? t._id) === tagId))
    .filter(Boolean)


  return (
    <>
      <Page onPageBeforeIn={handlePageBeforeIn}>
        <Navbar>
          <NavLeft backLink="Atrás" />
          <NavTitle>
            <SaveStatusIndicator status={saveStatus} />
          </NavTitle>
        </Navbar>

        {(isLoading || isFetching) && !transaction && (
          <Block className={styles.loadingBlock}>
            <Preloader size={44} />
          </Block>
        )}

        <div className={styles.typeRow}>
          <button
            className={[styles.typeBtn, !isExpense ? styles.typeBtnActive : ''].join(' ')}
            onClick={() => handleTypeToggle(false)}
            style={!isExpense ? { borderColor: '#16A34A', color: '#16A34A' } : {}}
            data-testid="edit-transaction-type-income"
          >
            Ingreso
          </button>
          <button
            className={[styles.typeBtn, isExpense ? styles.typeBtnActive : ''].join(' ')}
            onClick={() => handleTypeToggle(true)}
            style={isExpense ? { borderColor: '#e53935', color: '#e53935' } : {}}
            data-testid="edit-transaction-type-expense"
          >
            Gasto
          </button>
        </div>

        <div
          className={styles.tagsRow}
          onClick={() => setTagSheetOpen(true)}
          data-testid="edit-transaction-tags-row"
        >
          {resolvedTags.length > 0
            ? resolvedTags.map((tag) => <TagChip key={tag.id ?? tag._id} tag={tag} />)
            : <span className={styles.tagsPlaceholder}>Agregar etiquetas</span>}
          <ChevronRight size={16} className={styles.tagsChevron} />
        </div>

        <List className={styles.amountList}>
          <li className={styles.amountRow}>
            <span className={styles.currency}>Bs.</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className={styles.amountInput}
              data-testid="edit-transaction-amount"
            />
          </li>
        </List>

        <List>
          <ListInput
            type="text"
            placeholder="Descripción"
            value={content}
            onInput={handleContentChange}
            clearButton
            data-testid="edit-transaction-description"
          />
        </List>

        <div
          className={styles.dateRow}
          onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
          data-testid="edit-transaction-date-picker"
        >
          <Calendar size={20} className={styles.calendarIcon} />
          <span className={styles.dateLabel}>{formatDateDisplay(date)}</span>
          <input
            ref={dateInputRef}
            type="date"
            value={date}
            onChange={handleDateChange}
            className={styles.hiddenDateInput}
          />
        </div>

        <TagSelectionSheet
          opened={tagSheetOpen}
          tags={notebookTags}
          selectedTagIds={new Set(selectedTagIds)}
          onConfirm={handleTagsConfirm}
          onClose={() => setTagSheetOpen(false)}
          onEditTags={handleEditTags}
        />

        <TagsPopup
          mode="edit"
          notebookId={notebookId}
          tags={notebookTags}
          onTagsChange={() => {}}
          opened={tagsPopupOpen}
          onClose={handleTagsPopupClose}
        />
      </Page>
    </>
  )
}
