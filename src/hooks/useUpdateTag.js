import { useMutation } from '@tanstack/react-query'
import { updateTag } from '../api/tags'
import queryClient from '../queryClient'

export function useUpdateTag(notebookId) {
  return useMutation({
    mutationFn: ({ tagId, title, icon }) => updateTag(notebookId, tagId, { title, icon }),
    onMutate: async ({ tagId, title, icon }) => {
      await queryClient.cancelQueries({ queryKey: ['notebook', notebookId] })
      const previous = queryClient.getQueryData(['notebook', notebookId])
      queryClient.setQueryData(['notebook', notebookId], (old) => ({
        ...old,
        data: {
          ...old?.data,
          tags: (old?.data?.tags ?? []).map((t) =>
            t.id === tagId ? { ...t, title, icon } : t
          ),
        },
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
