import { useState, useEffect, useRef } from 'react'
import { Tag, Calendar, EllipsisVertical } from 'lucide-react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, List, ListInput, Preloader,
  Actions, ActionsGroup, ActionsButton,
  Sheet, PageContent, Button, f7,
} from 'framework7-react'
import { useTransaction } from '../hooks/useTransaction'
import { useNotebook } from '../hooks/useNotebook'
import { useUpdateTransaction } from '../hooks/useUpdateTransaction'
import { useDeleteTransaction } from '../hooks/useDeleteTransaction'
import SaveStatusIndicator from '../components/notes/SaveStatusIndicator'
import TagChip from '../components/notebooks/TagChip'
import ThemedButton from '../components/notebooks/ThemedButton'
import TagSelectionSheet from '../components/transactions/TagSelectionSheet'
import TagsPopup from '../components/notebooks/TagsPopup'
import { navigate } from '../utils/f7navigate'
import styles from './TransactionEditPage.module.css'

const DEBOUNCE_MS = 300
const COUNTDOWN_START = 5

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

  const [deleted, setDeleted] = useState(false)
  const { data: transaction, isLoading, isFetching, fetchStatus } = useTransaction(notebookId, transactionId, { enabled: !deleted })
  const { data: notebook } = useNotebook(notebookId)
  const notebookTags = notebook?.tags ?? []
  const { mutate } = useUpdateTransaction(notebookId, transactionId)
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction(notebookId, transactionId)

  const [saveStatus, setSaveStatus] = useState('saved')
  const [amount, setAmount] = useState('')
  const [isExpense, setIsExpense] = useState(true)
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [tagSheetOpen, setTagSheetOpen] = useState(false)
  const [tagsPopupOpen, setTagsPopupOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_START)

  const debounceRef = useRef(null)
  const dateInputRef = useRef(null)
  const needsInitRef = useRef(true)
  const intervalRef = useRef(null)

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

  // Countdown timer for delete confirmation
  useEffect(() => {
    if (deleteOpen) {
      setCountdown(COUNTDOWN_START)
      intervalRef.current = setInterval(() => {
        setCountdown((n) => {
          if (n <= 1) { clearInterval(intervalRef.current); return 0 }
          return n - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
      setCountdown(COUNTDOWN_START)
    }
    return () => clearInterval(intervalRef.current)
  }, [deleteOpen])

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

  function handleDeleteConfirm() {
    deleteTransaction(undefined, {
      onSuccess: () => {
        setDeleted(true) // Disable useTransaction to prevent 404 refetch
        setDeleteOpen(false)
        navigate(`/notebooks/${notebookId}/transactions`)
      },
    })
  }

  const resolvedTags = selectedTagIds
    .map((tagId) => notebookTags.find((t) => (t.id ?? t._id) === tagId))
    .filter(Boolean)

  const confirmLabel = countdown > 0
    ? `Espera ${countdown}s`
    : isDeleting ? 'Eliminando...' : 'Eliminar'

  return (
    <>
      <Page onPageBeforeIn={handlePageBeforeIn}>
        <Navbar>
          <NavLeft backLink="Atrás" />
          <NavTitle>
            <SaveStatusIndicator status={saveStatus} />
          </NavTitle>
          <NavRight>
            <ThemedButton
              variant="icon"
              color={notebook?.color}
              onClick={() => setActionsOpen(true)}
              data-testid="edit-transaction-actions-open"
            >
              <EllipsisVertical size={20} />
            </ThemedButton>
          </NavRight>
        </Navbar>

        {/* Backdrop spinner — only when no data has arrived yet */}
        {fetchStatus === 'paused' && !transaction && (
          <div className={styles.loadingBackdrop}>
            <p style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Sin conexión — no hay datos guardados.</p>
          </div>
        )}
        {(isLoading || isFetching) && !transaction && fetchStatus !== 'paused' && (
          <div className={styles.loadingBackdrop}>
            <Preloader size={44} color="white" />
          </div>
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

        <div className={styles.tagsRow}>
          {resolvedTags.map((tag) => (
            <TagChip key={tag.id ?? tag._id} tag={tag} />
          ))}
          <ThemedButton
            variant="outline"
            color={notebook?.color}
            onClick={() => setTagSheetOpen(true)}
            data-testid="edit-transaction-tags-row"
          >
            <Tag size={14} className={styles.tagsIcon} />
            {resolvedTags.length > 0 ? 'Gestionar' : 'Agregar etiquetas'}
          </ThemedButton>
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
              {/* Actions menu */}
      <Actions opened={actionsOpen} onActionsClosed={() => setActionsOpen(false)}>
        <ActionsGroup>
          <ActionsButton
            color="red"
            onClick={() => { setActionsOpen(false); setDeleteOpen(true) }}
            data-testid="edit-transaction-delete-action"
          >
            Eliminar movimiento
          </ActionsButton>
        </ActionsGroup>
        <ActionsGroup>
          <ActionsButton bold onClick={() => setActionsOpen(false)}>
            Cancelar
          </ActionsButton>
        </ActionsGroup>
      </Actions>

      {/* Delete confirmation sheet with countdown */}
      <Sheet
        opened={deleteOpen}
        onSheetClosed={() => setDeleteOpen(false)}
        style={{ height: 'auto' }}
        swipeToClose={false}
        backdrop
      >
        <PageContent className={styles.deletePageContent}>
          <Block className={styles.deleteBlock}>
            <h3 className={styles.deleteHeading}>Eliminar Movimiento</h3>
            <p className={styles.deleteBody}>
              ¿Eliminar este movimiento? Esta acción no se puede deshacer.
            </p>
          </Block>

          <Button
            large fill color="red"
            disabled={countdown > 0 || isDeleting}
            onClick={handleDeleteConfirm}
            className={styles.confirmButton}
            data-testid="edit-transaction-delete-confirm"
          >
            {confirmLabel}
          </Button>

          <Button
            large outline
            disabled={isDeleting}
            onClick={() => setDeleteOpen(false)}
            data-testid="edit-transaction-delete-cancel"
          >
            Cancelar
          </Button>
        </PageContent>
      </Sheet>
      </Page>
    </>
  )
}
