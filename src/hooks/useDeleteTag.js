import { useMutation } from '@tanstack/react-query'
import { deleteTag } from '../api/tags'
import queryClient from '../queryClient'

export function useDeleteTag(notebookId) {
  const mutation = useMutation({
    mutationFn: ({ tagId }) => deleteTag(notebookId, tagId),
    onMutate: async ({ tagId }) => {
      await queryClient.cancelQueries({ queryKey: ['notebook', notebookId] })
      const previous = queryClient.getQueryData(['notebook', notebookId])
      queryClient.setQueryData(['notebook', notebookId], (old) => ({
        ...old,
        data: {
          ...old?.data,
          tags: (old?.data?.tags ?? []).filter((t) => t.id !== tagId),
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

  return { ...mutation, pendingId: mutation.isPending ? mutation.variables?.tagId : null }
}
