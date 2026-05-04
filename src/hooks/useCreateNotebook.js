import { useMutation } from '@tanstack/react-query'
import { createNotebook } from '../api/notebooks'
import queryClient from '../queryClient'
import { getSession } from '../stores/authStore'

export function useCreateNotebook() {
  return useMutation({
    mutationFn: createNotebook,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['notebooks'] })
      const previous = queryClient.getQueryData(['notebooks'])

      const optimistic = {
        id: `temp-${Date.now()}`,
        title: payload.title,
        description: payload.description ?? null,
        color: payload.color ?? null,
        iconName: payload.iconName ?? null,
        owner: getSession()?.user?.googleId ?? '',
        users: payload.users ?? [],
        tags: payload.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(['notebooks'], (old) => ({
        ...old,
        data: [optimistic, ...(old?.data ?? [])],
      }))

      return { previous }
    },
    onError: (_err, _payload, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['notebooks'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
    },
  })
}
