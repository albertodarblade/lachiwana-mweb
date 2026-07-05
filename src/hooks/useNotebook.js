import { useQuery } from '@tanstack/react-query'
import { fetchNotebook } from '../api/notebooks'
import queryClient from '../queryClient'

export function useNotebook(id) {
  return useQuery({
    queryKey: ['notebook', id],
    queryFn: () => fetchNotebook(id),
    enabled: !!id,
    select: (data) => data?.data,
    initialData: () => {
      const list = queryClient.getQueryData(['notebooks'])
      const notebook = list?.data?.find((n) => n.id === id)
      if (!notebook) return undefined
      return { ...list, data: notebook }
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(['notebooks'])?.dataUpdatedAt,
  })
}
