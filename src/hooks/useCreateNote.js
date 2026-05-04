import { useMutation } from '@tanstack/react-query'
import { createNote, uploadAttachment } from '../api/notes'
import queryClient from '../queryClient'
import { prepareFileForUpload } from '../utils/compressImage'

export function useCreateNote(notebookId) {
  return useMutation({
    mutationFn: ({ title, tags }) => createNote(notebookId, { title, ...(tags?.length && { tags }) }),
    onMutate: async ({ title, tags }) => {
      await queryClient.cancelQueries({ queryKey: ['notes', notebookId] })
      const previous = queryClient.getQueryData(['notes', notebookId])

      const optimistic = {
        id: `temp-${Date.now()}`,
        title,
        tags: tags ?? [],
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
      const prepared = await prepareFileForUpload(file)
      const formData = new FormData()
      formData.append('file', prepared, file.name)
      await uploadAttachment(notebookId, noteId, formData)
    } catch (err) {
      errors.push(err)
    }
  }
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['note', notebookId, noteId] }),
    queryClient.invalidateQueries({ queryKey: ['notes', notebookId] }),
  ])
  return errors
}
