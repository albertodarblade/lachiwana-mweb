import { useMutation } from '@tanstack/react-query'
import { deleteNote } from '../api/notes'
import queryClient from '../queryClient'
import { f7 } from 'framework7-react'

// Intentionally non-optimistic per spec: deletion waits for server confirmation.
// A 5-second countdown gate in the UI prevents accidental deletion.
export function useDeleteNote(notebookId, noteId) {
  return useMutation({
    mutationFn: () => deleteNote(notebookId, noteId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['note', notebookId, noteId] })
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
    },
    onError: (err) => {
      f7.toast.create({
        text: err?.message ?? 'Error al eliminar la nota. Intenta de nuevo.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    },
  })
}
