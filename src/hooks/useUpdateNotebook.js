import { useMutation } from '@tanstack/react-query'
import { updateNotebook } from '../api/notebooks'
import queryClient from '../queryClient'

export function useUpdateNotebook() {
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateNotebook(id, payload),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['notebooks'] })
      const previous = queryClient.getQueryData(['notebooks'])

      queryClient.setQueryData(['notebooks'], (old) => ({
        ...old,
        data: old?.data?.map((n) =>
          n.id === variables.id
            ? { ...n, ...variables, updatedAt: new Date().toISOString() }
            : n
        ) ?? [],
      }))

      return { previous }
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['notebooks'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
    },
  })
}
