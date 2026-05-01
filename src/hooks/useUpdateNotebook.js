import { useMutation } from '@tanstack/react-query'
import { updateNotebook } from '../api/notebooks'
import queryClient from '../queryClient'

export function useUpdateNotebook() {
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateNotebook(id, payload),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['notebooks'] })
      await queryClient.cancelQueries({ queryKey: ['notebook', variables.id] })

      const previousList = queryClient.getQueryData(['notebooks'])
      const previousDetail = queryClient.getQueryData(['notebook', variables.id])

      const updated = { ...variables, updatedAt: new Date().toISOString() }

      queryClient.setQueryData(['notebooks'], (old) => ({
        ...old,
        data: old?.data?.map((n) => n.id === variables.id ? { ...n, ...updated } : n) ?? [],
      }))

      queryClient.setQueryData(['notebook', variables.id], (old) => ({
        ...old,
        data: { ...old?.data, ...updated },
      }))

      return { previousList, previousDetail }
    },
    onError: (_err, variables, context) => {
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(['notebooks'], context.previousList)
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(['notebook', variables.id], context.previousDetail)
      }
    },
    onSettled: (_data, _err, variables) => {
      // Refetch the detail immediately — user is on the detail/edit page
      queryClient.invalidateQueries({ queryKey: ['notebook', variables.id] })
      // Mark the list stale but don't refetch now — it will refetch when
      // the home page mounts next time the user navigates back
      queryClient.invalidateQueries({ queryKey: ['notebooks'], refetchType: 'none' })
    },
  })
}
