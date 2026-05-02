import { useMutation } from '@tanstack/react-query'
import { deleteAttachment } from '../api/notes'
import queryClient from '../queryClient'
import { f7 } from 'framework7-react'

export function useDeleteAttachment(notebookId, noteId) {
  return useMutation({
    mutationFn: (attachId) => deleteAttachment(notebookId, noteId, attachId),
    onMutate: async (attachId) => {
      await queryClient.cancelQueries({ queryKey: ['note', notebookId, noteId] })
      await queryClient.cancelQueries({ queryKey: ['notes', notebookId] })

      const previousNote = queryClient.getQueryData(['note', notebookId, noteId])
      const previousList = queryClient.getQueryData(['notes', notebookId])

      queryClient.setQueryData(['note', notebookId, noteId], (old) => ({
        ...old,
        data: {
          ...old?.data,
          attachments: old?.data?.attachments?.filter((a) => a.id !== attachId) ?? [],
        },
      }))

      queryClient.setQueryData(['notes', notebookId], (old) => ({
        ...old,
        data: old?.data?.map((n) =>
          n.id === noteId
            ? { ...n, attachments: n.attachments?.filter((a) => a.id !== attachId) ?? [] }
            : n
        ) ?? [],
      }))

      return { previousNote, previousList }
    },
    onError: (_err, _attachId, context) => {
      if (context?.previousNote !== undefined) {
        queryClient.setQueryData(['note', notebookId, noteId], context.previousNote)
      }
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(['notes', notebookId], context.previousList)
      }
      f7.toast.create({
        text: 'Error al eliminar el archivo. Intenta de nuevo.',
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
