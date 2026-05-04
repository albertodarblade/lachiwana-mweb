import { useMutation } from '@tanstack/react-query'
import { updateNote } from '../api/notes'
import queryClient from '../queryClient'
import { f7 } from 'framework7-react'

export function useUpdateNote(notebookId, noteId) {
  return useMutation({
    mutationFn: ({ title, tags }) => updateNote(notebookId, noteId, {
      ...(title !== undefined && { title }),
      ...(tags !== undefined && { tags }),
    }),
    onMutate: async ({ title, tags }) => {
      await queryClient.cancelQueries({ queryKey: ['note', notebookId, noteId] })
      await queryClient.cancelQueries({ queryKey: ['notes', notebookId] })
      const previous = queryClient.getQueryData(['note', notebookId, noteId])

      const patch = {
        ...(title !== undefined && { title }),
        ...(tags !== undefined && { tags }),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(['note', notebookId, noteId], (old) => ({
        ...old,
        data: { ...old?.data, ...patch },
      }))

      queryClient.setQueryData(['notes', notebookId], (old) => ({
        ...old,
        data: old?.data?.map((n) => n.id === noteId ? { ...n, ...patch } : n) ?? [],
      }))

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['note', notebookId, noteId], context.previous)
      }
      f7.toast.create({
        text: 'Error al guardar. Los cambios no fueron guardados.',
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
