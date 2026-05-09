import React, { useState, useRef } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, Preloader, Fab, FabButtons, FabButton, FabBackdrop, Icon, Link, Badge,
} from 'framework7-react'
import { useNotebook } from '../hooks/useNotebook'
import { useTransactions } from '../hooks/useTransactions'
import MonthSelector from '../components/transactions/MonthSelector'
import TransactionCard from '../components/transactions/TransactionCard'
import TransactionEmptyState from '../components/transactions/TransactionEmptyState'
import TagSelectionSheet from '../components/transactions/TagSelectionSheet'
import TransactionFormSheet from '../components/transactions/TransactionFormSheet'
import TransactionFilterPanel from '../components/transactions/TransactionFilterPanel'
import TagsPopup from '../components/notebooks/TagsPopup'
import { navigate, navigateBack } from '../utils/f7navigate'
import styles from './NotebookTransactionsPage.module.css'

function currentYearMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function sumAmounts(transactions) {
  return transactions.reduce((acc, t) => acc + (t.value ?? 0), 0)
}

export default function NotebookTransactionsPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook, isLoading, isError } = useNotebook(id)
  const [cursor, setCursor] = useState(currentYearMonth)

  // Flow state
  const [transactionType, setTransactionType] = useState(null)
  const [selectedTagIds, setSelectedTagIds] = useState(new Set())
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [isTagsPopupOpen, setIsTagsPopupOpen] = useState(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [filters, setFilters] = useState({ content: '', tagIds: new Set() })
  const formClosingForBack = useRef(false)

  const viewType = notebook?.transactionsViewType ?? 'all'
  const byMonth = viewType === 'by-month'

  const activeFilterCount = (filters.content ? 1 : 0) + filters.tagIds.size
  const filterParams = {
    ...(byMonth ? cursor : {}),
    ...(filters.content ? { content: filters.content } : {}),
    ...(filters.tagIds.size ? { tags: [...filters.tagIds] } : {}),
  }

  const { data: transactions = [] } = useTransactions(id, filterParams)

  const notebookTags = notebook?.tags ?? []

  function resolveTagIds(tagIds = []) {
    return tagIds
      .map((tagId) => notebookTags.find((t) => (t.id ?? t._id) === tagId))
      .filter(Boolean)
  }

  const total = sumAmounts(transactions)

  function prevMonth() {
    setCursor(({ year, month }) => {
      if (month === 1) return { year: year - 1, month: 12 }
      return { year, month: month - 1 }
    })
  }

  function nextMonth() {
    setCursor(({ year, month }) => {
      if (month === 12) return { year: year + 1, month: 1 }
      return { year, month: month + 1 }
    })
  }

  function handleTypeSelect(type) {
    setTransactionType(type)
    if (notebook?.tags?.length > 0) {
      setIsTagSheetOpen(true)
    } else {
      setIsFormSheetOpen(true)
    }
  }

  function handleTagsConfirm(ids) {
    setSelectedTagIds(ids)
    setIsTagSheetOpen(false)
    setIsFormSheetOpen(true)
  }

  function handleFormBack() {
    if (!notebook?.tags?.length) {
      handleFlowClose()
      return
    }
    formClosingForBack.current = true
    setIsFormSheetOpen(false)
    setTimeout(() => setIsTagSheetOpen(true), 300)
  }

  function handleFormSheetClosed() {
    if (formClosingForBack.current) {
      formClosingForBack.current = false
      return
    }
    handleFlowClose()
  }

  function handleFlowClose() {
    setTransactionType(null)
    setSelectedTagIds(new Set())
    setIsTagSheetOpen(false)
    setIsFormSheetOpen(false)
  }

  function handleEditTags() {
    setIsTagSheetOpen(false)
    setTimeout(() => setIsTagsPopupOpen(true), 300)
  }

  function handleTagsPopupClose() {
    setIsTagsPopupOpen(false)
    if (transactionType !== null) {
      setTimeout(() => setIsTagSheetOpen(true), 300)
    }
  }

  if (isLoading) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
        <Block className={styles.centered}>
          <Preloader size={44} />
        </Block>
      </Page>
    )
  }

  if (isError || !notebook) {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
        <Block className={styles.centered}>
          <p className={styles.errorText}>Cuaderno no encontrado.</p>
          <span className={styles.backLink} onClick={() => navigateBack()}>
            Volver al inicio
          </span>
        </Block>
      </Page>
    )
  }

  const navbarColor = notebook.color ?? 'var(--f7-theme-color)'
  const selectedTags = (notebook.tags ?? []).filter(
    (t) => selectedTagIds.has(t.id ?? t._id)
  )

  return (
    <Page>
      <Navbar>
        <NavLeft backLink="Atrás" backLinkUrl="/" />
        <NavTitle>
          <div
            className={styles.navTitleInner}
            onClick={() => navigate(`/notebooks/${id}/edit`)}
          >
            <div
              className={styles.iconContainer}
              style={{ '--icon-color': navbarColor }}
            >
              <i className={['f7-icons', styles.navIcon].join(' ')}>
                {notebook.iconName ?? 'arrow_right_arrow_left_square'}
              </i>
            </div>
            <span className={styles.navTitleText}>{notebook.title}</span>
          </div>
        </NavTitle>
        <NavRight>
          <Link onClick={() => setIsFilterPanelOpen(true)} className={styles.filterBtn}>
            <i className="f7-icons">slider_horizontal_3</i>
            {activeFilterCount > 0 && (
              <Badge color="red" className={styles.filterBadge}>{activeFilterCount}</Badge>
            )}
          </Link>
        </NavRight>
      </Navbar>

      {byMonth ? (
        <>
          <MonthSelector
            year={cursor.year}
            month={cursor.month}
            total={total}
            onPrev={prevMonth}
            onNext={nextMonth}
          />
          <div className={styles.sectionTitle}>Movimientos</div>
          {transactions.length === 0 ? (
            <TransactionEmptyState />
          ) : (
            <div className={styles.list}>
              {transactions.map((t) => (
                <TransactionCard key={t.id} transaction={{ ...t, tags: resolveTagIds(t.tags) }} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <Block className={styles.allSummary}>
            <span className={styles.allSummaryLabel}>Balance total</span>
            <span
              className={[
                styles.allSummaryTotal,
                total < 0 ? styles.negative : total > 0 ? styles.positive : styles.neutral,
              ].join(' ')}
            >
              {total < 0 ? '-' : total > 0 ? '+' : ''}Bs. {Math.abs(total)}
            </span>
          </Block>
          {transactions.length === 0 ? (
            <TransactionEmptyState />
          ) : (
            <div className={styles.list}>
              {transactions.map((t) => (
                <TransactionCard key={t.id} transaction={{ ...t, tags: resolveTagIds(t.tags) }} />
              ))}
            </div>
          )}
        </>
      )}

      <FabBackdrop onClick={handleFlowClose} />

      <Fab position="right-bottom" style={{ '--f7-fab-bg-color': navbarColor, '--f7-fab-pressed-bg-color': navbarColor }}>
        <Icon ios="f7:plus" md="material:add" />
        <Icon ios="f7:xmark" md="material:close" />
        <FabButtons position="top">
          <FabButton
            fabClose
            label="Gasto"
            className={styles.expenseBtn}
            onClick={() => handleTypeSelect('expense')}
          >
            <Icon ios="f7:minus" md="material:remove" />
          </FabButton>
          <FabButton
            fabClose
            label="Ingreso"
            className={styles.incomeBtn}
            onClick={() => handleTypeSelect('income')}
          >
            <Icon ios="f7:plus" md="material:add" />
          </FabButton>
        </FabButtons>
      </Fab>

      <TagSelectionSheet
        opened={isTagSheetOpen}
        tags={notebook.tags ?? []}
        selectedTagIds={selectedTagIds}
        onConfirm={handleTagsConfirm}
        onClose={() => setIsTagSheetOpen(false)}
        onEditTags={handleEditTags}
      />

      <TagsPopup
        mode="edit"
        notebookId={id}
        tags={notebook.tags ?? []}
        onTagsChange={() => {}}
        opened={isTagsPopupOpen}
        onClose={handleTagsPopupClose}
      />

      <TransactionFormSheet
        opened={isFormSheetOpen}
        transactionType={transactionType}
        selectedTags={selectedTags}
        notebookId={id}
        onBack={handleFormBack}
        onClose={handleFormSheetClosed}
        onSuccess={handleFlowClose}
      />

      <TransactionFilterPanel
        opened={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        tags={notebookTags}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
      />
    </Page>
  )
}
