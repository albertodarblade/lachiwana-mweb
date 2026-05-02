import { useMutation } from '@tanstack/react-query'
import { uploadAttachment } from '../api/notes'
import queryClient from '../queryClient'

export function useUploadAttachment(notebookId, noteId) {
  return useMutation({
    mutationFn: (formData) => uploadAttachment(notebookId, noteId, formData),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['note', notebookId, noteId] })
    },
  })
}
