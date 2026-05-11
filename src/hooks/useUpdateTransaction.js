import { useMutation } from '@tanstack/react-query'
import { f7 } from 'framework7-react'
import { updateTransaction } from '../api/transactions'
import queryClient from '../queryClient'

export function useUpdateTransaction(notebookId, transactionId) {
  return useMutation({
    mutationFn: (payload) => updateTransaction(notebookId, transactionId, payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', notebookId] })

      const snapshots = queryClient.getQueriesData({ queryKey: ['transactions', notebookId] })

      queryClient.setQueriesData({ queryKey: ['transactions', notebookId] }, (old) => {
        if (!old) return old
        const data = Array.isArray(old) ? old : (old?.data ?? [])
        const patched = data.map((t) =>
          t.id === transactionId ? { ...t, ...payload, updatedAt: new Date().toISOString() } : t
        )
        return Array.isArray(old) ? patched : { ...old, data: patched }
      })

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, value]) => queryClient.setQueryData(key, value))
      f7.toast.create({
        text: 'Error al guardar. Los cambios no fueron guardados.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', notebookId] })
    },
  })
}
