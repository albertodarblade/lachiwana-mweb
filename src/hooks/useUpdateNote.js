import { useMutation } from '@tanstack/react-query'
import { updateNote } from '../api/notes'
import queryClient from '../queryClient'
import { f7 } from 'framework7-react'

export function useUpdateNote(notebookId, noteId) {
  return useMutation({
    mutationFn: ({ title }) => updateNote(notebookId, noteId, { title }),
    onMutate: async ({ title }) => {
      await queryClient.cancelQueries({ queryKey: ['note', notebookId, noteId] })
      const previous = queryClient.getQueryData(['note', notebookId, noteId])

      queryClient.setQueryData(['note', notebookId, noteId], (old) => ({
        ...old,
        data: { ...old?.data, title, updatedAt: new Date().toISOString() },
      }))

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['note', notebookId, noteId], context.previous)
      }
      f7.toast.create({
        text: 'Error al guardar. El título no fue actualizado.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['note', notebookId, noteId] })
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId], refetchType: 'none' })
    },
  })
}
