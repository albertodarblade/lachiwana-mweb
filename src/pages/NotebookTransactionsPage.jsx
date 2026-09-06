import React, { useState, useRef } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight, Tabs, Tab,
  Block, Preloader, Fab, FabButtons, FabButton, FabBackdrop, Icon, Link, Badge,
} from 'framework7-react'
import { ArrowLeftRight, Search } from 'lucide-react'
import { LUCIDE_ICONS } from '../components/IconSelector/lucideIcons'
import { useNotebook } from '../hooks/useNotebook'
import { useTransactions } from '../hooks/useTransactions'
import { useTransactionSummary } from '../hooks/useTransactionSummary'
import MonthSelector from '../components/transactions/MonthSelector'
import MonthSummaryCard from '../components/transactions/MonthSummaryCard'
import TransactionsSummaryCard from '../components/transactions/TransactionsSummaryCard'
import TransactionCard from '../components/transactions/TransactionCard'
import TransactionEmptyState from '../components/transactions/TransactionEmptyState'
import TagSelectionSheet from '../components/transactions/TagSelectionSheet'
import TransactionFormSheet from '../components/transactions/TransactionFormSheet'
import TransactionFilterPanel from '../components/transactions/TransactionFilterPanel'
import TransactionsDashboard from '../components/transactions/TransactionsDashboard'
import TransactionChat from '../components/ai/TransactionChat'
import TagsPopup from '../components/notebooks/TagsPopup'
import { navigate, navigateBack } from '../utils/f7navigate'
import styles from './NotebookTransactionsPage.module.css'

const lucideMap = Object.fromEntries(LUCIDE_ICONS.map(({ name, Icon }) => [name, Icon]))

function currentYearMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function sumAmounts(transactions) {
  return transactions.reduce((acc, t) => acc + (t.value ?? 0), 0)
}

function formatAmount(value) {
  const abs = Math.abs(value ?? 0).toFixed(2)
  const sign = (value ?? 0) < 0 ? '-' : (value ?? 0) > 0 ? '+' : ''
  return `${sign}Bs. ${abs}`
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function monthRange(year, month) {
  const from = `${year}-${pad(month)}-01`
  const to = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`
  return { from, to }
}

export default function NotebookTransactionsPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook, isLoading, isPending, isError, fetchStatus } = useNotebook(id)
  const [cursor, setCursor] = useState(currentYearMonth)

  const { year: currentYear, month: currentMonth } = currentYearMonth()
  const isCurrentMonth = cursor.year === currentYear && cursor.month === currentMonth

  // Flow state
  const [transactionType, setTransactionType] = useState(null)
  const [selectedTagIds, setSelectedTagIds] = useState(new Set())
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [isTagsPopupOpen, setIsTagsPopupOpen] = useState(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [filters, setFilters] = useState({ content: '', tagIds: new Set() })
  const [dismissTxError, setDismissTxError] = useState(false)
  const [activeTab, setActiveTab] = useState('movements')
  const formClosingForBack = useRef(false)

  const viewType = notebook?.transactionsViewType ?? 'all'
  const byMonth = viewType === 'by-month'

  const activeFilterCount = (filters.content ? 1 : 0) + filters.tagIds.size
  const filterParams = {
    ...(byMonth ? cursor : {}),
    ...(filters.content ? { content: filters.content } : {}),
    ...(filters.tagIds.size ? { tags: [...filters.tagIds] } : {}),
  }

  const { data: transactions = [], isLoading: transactionsLoading, isError: transactionsError, fetchStatus: transactionsFetchStatus } = useTransactions(id, filterParams)

  const { data: summary } = useTransactionSummary(id)

  const notebookTags = notebook?.tags ?? []

  function resolveTagIds(tagIds = []) {
    return tagIds
      .map((tagId) => notebookTags.find((t) => (t.id ?? t._id) === tagId))
      .filter(Boolean)
  }

  const totalExpenses = sumAmounts(transactions.filter((t) => (t.value ?? 0) < 0))
  const totalIncome = sumAmounts(transactions.filter((t) => (t.value ?? 0) > 0))
  const netTotal = totalIncome + totalExpenses
  const resultClass =
    netTotal < 0 ? styles.resultNegative : netTotal > 0 ? styles.resultPositive : styles.resultNeutral

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

  if (isPending && fetchStatus === 'paused') {
    return (
      <Page>
        <Navbar title="Cuaderno" backLink="Atrás" backLinkUrl="/" />
        <Block className={styles.centered}>
          <p>Sin conexión — no hay datos guardados.</p>
        </Block>
      </Page>
    )
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

  const refMonth = byMonth ? cursor : { year: currentYear, month: currentMonth }
  const chatRange = monthRange(refMonth.year, refMonth.month)

const tabButtons = [
  { key: 'movements', label: 'Movimientos', tabId: 'transactions-tab-movements', testId: 'transactions-tab-movements' },
  { key: 'dashboard', label: 'Dashboard', tabId: 'transactions-tab-dashboard', testId: 'transactions-tab-dashboard' },
  { key: 'chatbot', label: 'Chatbot', tabId: 'transactions-tab-chatbot', testId: 'transactions-tab-chatbot' },
]

  return (
    <Page className={styles.pageWrap}>
      <Navbar>
        <NavLeft backLink="Atrás" backLinkUrl="/" backLinkForce />
        <NavTitle>
          <div
            className={styles.navTitleInner}
            onClick={() => navigate(`/notebooks/${id}/edit`)}
            data-testid="transactions-notebook-edit"
          >
            <div
              className={styles.iconContainer}
              style={{ '--icon-color': navbarColor }}
            >
              {(() => { const Icon = notebook.iconName ? (lucideMap[notebook.iconName] ?? ArrowLeftRight) : ArrowLeftRight; return <Icon size={20} className={styles.navIcon} /> })()}
            </div>
            <span className={styles.navTitleText}>{notebook.title}</span>
          </div>
        </NavTitle>
        <NavRight>
          <Link onClick={() => setIsFilterPanelOpen(true)} className={styles.filterBtn} data-testid="transactions-filter-open">
            <Search size={20} />
            {activeFilterCount > 0 && (
              <Badge color="red" className={styles.filterBadge}>{activeFilterCount}</Badge>
            )}
          </Link>
        </NavRight>
      </Navbar>

      {byMonth && (
        <MonthSelector
          year={cursor.year}
          month={cursor.month}
          onPrev={prevMonth}
          onNext={nextMonth}
        />
      )}

      <div
        className={styles.tabs}
        style={{ '--tabs-color': navbarColor }}
        data-testid="transactions-tabs"
      >
        {tabButtons.map((tab) => (
          <Link
            key={tab.key}
            tabLink={`#${tab.tabId}`}
            tabLinkActive={activeTab === tab.key}
            className={[styles.tabBtn, activeTab === tab.key ? styles.tabBtnActive : ''].join(' ')}
            onClick={() => setActiveTab(tab.key)}
            data-testid={tab.testId}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Tabs animated className={styles.tabsWrap}>
        <Tab id="transactions-tab-movements" tabActive={activeTab === 'movements'} className={styles.tab}>
          <div className={styles.list}>
            {transactionsError && transactions.length > 0 && !dismissTxError && (
              <Block className={styles.centered}>
                <p>Error al cargar. Mostrando datos guardados.</p>
                <span style={{ color: 'var(--f7-theme-color)', cursor: 'pointer' }} onClick={() => setDismissTxError(true)}>Descartar</span>
              </Block>
            )}
            {transactionsLoading && transactionsFetchStatus === 'paused' ? (
              <Block className={styles.centered}>
                <p>Sin conexión — mostrando datos guardados.</p>
              </Block>
            ) : transactionsLoading ? (
              <Block className={styles.centered}>
                <Preloader size={44} />
              </Block>
            ) : transactionsError && transactions.length === 0 ? (
              <Block className={styles.centered}>
                <p>Error al cargar los movimientos.</p>
              </Block>
            ) : transactions.length === 0 ? (
              <TransactionEmptyState />
            ) : (
              transactions.map((t) => (
                <TransactionCard key={t.id} transaction={{ ...t, tags: resolveTagIds(t.tags) }} color={navbarColor} onClick={() => { setIsFilterPanelOpen(false); navigate(`/notebooks/${id}/transactions/${t.id}/edit`) }} />
              ))
            )}
          </div>
        </Tab>

        <Tab id="transactions-tab-dashboard" tabActive={activeTab === 'dashboard'} className={styles.tab}>
          <div className={styles.summaryBar} data-testid="transactions-total-sticky">
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Gastos</span>
              <span className={`${styles.summaryValue} ${styles.itemNegative}`}>{formatAmount(totalExpenses)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Ingresos</span>
              <span className={`${styles.summaryValue} ${styles.itemPositive}`}>{formatAmount(totalIncome)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Resultado</span>
              <span className={`${styles.summaryValue} ${resultClass}`}>{formatAmount(netTotal)}</span>
            </div>
          </div>
          {byMonth ? (
            <MonthSummaryCard
              expenses={totalExpenses}
              income={totalIncome}
              totalNotebook={summary?.total}
              showAccumulated={isCurrentMonth}
            />
          ) : (
            <TransactionsSummaryCard
              expensesLabel="Gastos totales"
              incomeLabel="Ingresos totales"
              expenses={summary?.expenses}
              income={summary?.income}
              total={summary?.total}
            />
          )}
          {transactionsLoading && transactionsFetchStatus !== 'paused' ? (
            <Block className={styles.centered}>
              <Preloader size={44} />
            </Block>
          ) : (
            <TransactionsDashboard transactions={transactions} tags={notebookTags} color={navbarColor} />
          )}
        </Tab>

        <Tab id="transactions-tab-chatbot" tabActive={activeTab === 'chatbot'} className={styles.tab}>
          <TransactionChat
            notebookId={id}
            from={chatRange.from}
            to={chatRange.to}
            color={navbarColor}
          />
        </Tab>
      </Tabs>

      <FabBackdrop onClick={handleFlowClose} />

      {activeTab === 'movements' && (
        <Fab position="right-bottom" style={{ '--f7-fab-bg-color': navbarColor, '--f7-fab-pressed-bg-color': navbarColor, '--f7-glass-shadow-fab': '0 2px 8px rgba(0,0,0,0.28)' }}>
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
      )}

      <TagSelectionSheet
        opened={isTagSheetOpen}
        tags={notebook.tags ?? []}
        selectedTagIds={selectedTagIds}
        onConfirm={handleTagsConfirm}
        onClose={() => setIsTagSheetOpen(false)}
        onEditTags={handleEditTags}
        color={navbarColor}
      />

      <TagsPopup
        mode="edit"
        notebookId={id}
        tags={notebook.tags ?? []}
        onTagsChange={() => {}}
        opened={isTagsPopupOpen}
        onClose={handleTagsPopupClose}
        color={navbarColor}
      />

      <TransactionFormSheet
        opened={isFormSheetOpen}
        transactionType={transactionType}
        selectedTags={selectedTags}
        notebookId={id}
        color={navbarColor}
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
