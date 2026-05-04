import { useMutation } from '@tanstack/react-query'
import { addTag } from '../api/tags'
import queryClient from '../queryClient'

export function useAddTag(notebookId) {
  return useMutation({
    mutationFn: ({ title, icon }) => addTag(notebookId, { title, icon }),
    onMutate: async ({ title, icon }) => {
      await queryClient.cancelQueries({ queryKey: ['notebook', notebookId] })
      const previous = queryClient.getQueryData(['notebook', notebookId])
      const optimisticTag = { id: `temp-${Date.now()}`, title, icon }
      queryClient.setQueryData(['notebook', notebookId], (old) => ({
        ...old,
        data: { ...old?.data, tags: [...(old?.data?.tags ?? []), optimisticTag] },
      }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['notebook', notebookId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] })
      queryClient.invalidateQueries({ queryKey: ['notebooks'], refetchType: 'none' })
    },
  })
}
