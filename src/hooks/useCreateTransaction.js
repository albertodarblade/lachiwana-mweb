import { useMutation } from '@tanstack/react-query'
import { createTransaction } from '../api/transactions'
import queryClient from '../queryClient'

function makeTempId() {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function transactionVariants(notebookId) {
  return queryClient.getQueriesData({ queryKey: ['transactions', notebookId] })
}

function addTransactionOptimistically(notebookId, transaction) {
  transactionVariants(notebookId).forEach(([key, old]) => {
    if (!old) return
    const data = Array.isArray(old) ? old : (old?.data ?? [])
    const next = [transaction, ...data]
    queryClient.setQueryData(key, Array.isArray(old) ? next : { ...old, data: next })
  })
}

function replaceTransactionInCache(notebookId, tempId, realTransaction) {
  transactionVariants(notebookId).forEach(([key, old]) => {
    if (!old) return
    const data = Array.isArray(old) ? old : (old?.data ?? [])
    const next = data.map((t) => (t.id === tempId ? { ...realTransaction } : t))
    queryClient.setQueryData(key, Array.isArray(old) ? next : { ...old, data: next })
  })
}

function removeTransactionFromCache(notebookId, tempId) {
  transactionVariants(notebookId).forEach(([key, old]) => {
    if (!old) return
    const data = Array.isArray(old) ? old : (old?.data ?? [])
    const next = data.filter((t) => t.id !== tempId)
    queryClient.setQueryData(key, Array.isArray(old) ? next : { ...old, data: next })
  })
}

export function useCreateTransaction(notebookId) {
  return useMutation({
    mutationFn: (payload) => createTransaction(notebookId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', notebookId] })

      const tempId = payload.__tempId || makeTempId()
      const tempTransaction = {
        id: tempId,
        value: payload.value ?? 0,
        date: payload.date ?? new Date().toISOString().split('T')[0],
        content: payload.content ?? '',
        tags: payload.tags ?? [],
        attachments: [],
        createdAt: new Date().toISOString(),
        _pending: true,
      }
      addTransactionOptimistically(notebookId, tempTransaction)
      return { tempId }
    },
    onSuccess: (data, variables, context) => {
      const realTransaction = data?.data ?? data
      if (context?.tempId) {
        replaceTransactionInCache(notebookId, context.tempId, { ...realTransaction, _pending: false })
        return
      }
      queryClient.invalidateQueries({ queryKey: ['transactions', notebookId] })
    },
    onError: (_err, _variables, context) => {
      if (context?.tempId) {
        removeTransactionFromCache(notebookId, context.tempId)
      }
    },
    onSettled: (data, error, variables, context) => {
      if (!context?.tempId) return
      queryClient.invalidateQueries({ queryKey: ['transactions', notebookId] })
    },
  })
}