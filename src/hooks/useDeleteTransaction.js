import { useMutation } from '@tanstack/react-query'
import { f7 } from 'framework7-react'
import { deleteTransaction } from '../api/transactions'
import queryClient from '../queryClient'

export function useDeleteTransaction(notebookId, transactionId) {
  return useMutation({
    mutationFn: () => deleteTransaction(notebookId, transactionId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['transaction', notebookId, transactionId] })
      queryClient.invalidateQueries({ queryKey: ['transactions', notebookId] })
    },
    onError: (err) => {
      f7.toast.create({
        text: err?.message ?? 'Error al eliminar el movimiento. Intenta de nuevo.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    },
  })
}
