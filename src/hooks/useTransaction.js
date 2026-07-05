import { useQuery } from '@tanstack/react-query'
import { fetchTransaction } from '../api/transactions'
import queryClient from '../queryClient'

export function useTransaction(notebookId, transactionId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['transaction', notebookId, transactionId],
    queryFn: () => fetchTransaction(notebookId, transactionId),
    enabled: enabled && !!notebookId && !!transactionId,
    select: (res) => res?.data ?? res,
    initialData: () => {
      const all = queryClient.getQueriesData({ queryKey: ['transactions', notebookId] })
      for (const [, data] of all) {
        if (!data) continue
        const list = data.data ?? data
        if (!Array.isArray(list)) continue
        const tx = list.find((t) => t.id === transactionId)
        if (tx) {
          return data.data ? { ...data, data: tx } : tx
        }
      }
      return undefined
    },
    initialDataUpdatedAt: () => {
      const all = queryClient.getQueriesData({ queryKey: ['transactions', notebookId] })
      for (const [key] of all) {
        const state = queryClient.getQueryState(key)
        if (state?.dataUpdatedAt) return state.dataUpdatedAt
      }
      return undefined
    },
    staleTime: 0,
  })
}
