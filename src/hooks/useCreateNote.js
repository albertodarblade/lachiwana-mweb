import { useMutation } from '@tanstack/react-query'
import { createNote, uploadAttachment } from '../api/notes'
import queryClient from '../queryClient'

export function useCreateNote(notebookId) {
  return useMutation({
    mutationFn: ({ title }) => createNote(notebookId, { title }),
    onMutate: async ({ title }) => {
      await queryClient.cancelQueries({ queryKey: ['notes', notebookId] })
      const previous = queryClient.getQueryData(['notes', notebookId])

      const optimistic = {
        id: `temp-${Date.now()}`,
        title,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(['notes', notebookId], (old) => ({
        ...old,
        data: [optimistic, ...(old?.data ?? [])],
      }))

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['notes', notebookId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
    },
  })
}

export async function uploadAttachmentsSequentially(notebookId, noteId, files) {
  const errors = []
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      await uploadAttachment(notebookId, noteId, formData)
    } catch (err) {
      errors.push(err)
    }
  }
  return errors
}
