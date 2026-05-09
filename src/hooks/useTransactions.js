import { useNotebook } from './useNotebook'

export function useTransactions(notebookId, { year, month } = {}) {
  const { data: notebook } = useNotebook(notebookId)
  const transactions = notebook?.transactions ?? []

  if (year != null && month != null) {
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
  }

  return transactions
}
