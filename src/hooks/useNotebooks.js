import { useQuery } from '@tanstack/react-query'
import { fetchNotebooks } from '../api/notebooks'

export function useNotebooks() {
  return useQuery({
    queryKey: ['notebooks'],
    queryFn: fetchNotebooks,
  })
}
