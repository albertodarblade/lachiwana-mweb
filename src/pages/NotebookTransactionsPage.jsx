import React, { useState } from 'react'
import {
  Page, Navbar, NavLeft, NavTitle, NavRight,
  Block, Preloader, Fab, Icon, Link, f7,
} from 'framework7-react'
import { useNotebook } from '../hooks/useNotebook'
import { useTransactions } from '../hooks/useTransactions'
import MonthSelector from '../components/transactions/MonthSelector'
import TransactionCard from '../components/transactions/TransactionCard'
import TransactionEmptyState from '../components/transactions/TransactionEmptyState'
import { navigate, navigateBack } from '../utils/f7navigate'
import styles from './NotebookTransactionsPage.module.css'

function currentYearMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function sumAmounts(transactions) {
  return transactions.reduce((acc, t) => acc + (t.amount ?? 0), 0)
}

export default function NotebookTransactionsPage({ f7route }) {
  const id = f7route?.params?.id
  const { data: notebook, isLoading, isError } = useNotebook(id)
  const [cursor, setCursor] = useState(currentYearMonth)

  const viewType = notebook?.transactionsViewType ?? 'all'
  const byMonth = viewType === 'by-month'

  const filteredTransactions = useTransactions(id, byMonth ? cursor : {})
  const allTransactions = useTransactions(id)

  const monthTotal = sumAmounts(filteredTransactions)
  const allTotal = sumAmounts(allTransactions)

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
          <Link onClick={() => navigate(`/notebooks/${id}/edit`)}>
            <i className="f7-icons">slider_horizontal_3</i>
          </Link>
        </NavRight>
      </Navbar>

      {byMonth ? (
        <>
          <MonthSelector
            year={cursor.year}
            month={cursor.month}
            total={monthTotal}
            onPrev={prevMonth}
            onNext={nextMonth}
          />
          <div className={styles.sectionTitle}>Movimientos</div>
          {filteredTransactions.length === 0 ? (
            <TransactionEmptyState />
          ) : (
            <div className={styles.list}>
              {filteredTransactions.map((t) => (
                <TransactionCard key={t._id} transaction={t} />
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
                allTotal < 0 ? styles.negative : allTotal > 0 ? styles.positive : styles.neutral,
              ].join(' ')}
            >
              {allTotal < 0 ? '-' : allTotal > 0 ? '+' : ''}Bs. {Math.abs(allTotal)}
            </span>
          </Block>
          {allTransactions.length === 0 ? (
            <TransactionEmptyState />
          ) : (
            <div className={styles.list}>
              {allTransactions.map((t) => (
                <TransactionCard key={t._id} transaction={t} />
              ))}
            </div>
          )}
        </>
      )}

      <Fab
        position="right-bottom"
        onClick={() =>
          f7.toast.create({ text: 'Próximamente', closeTimeout: 2000 }).open()
        }
        style={{
          '--f7-fab-bg-color': navbarColor,
          '--f7-fab-pressed-bg-color': navbarColor,
          '--f7-touch-ripple-color': 'rgba(255,255,255,0.25)',
        }}
      >
        <Icon ios="f7:plus" md="material:add" />
      </Fab>
    </Page>
  )
}
