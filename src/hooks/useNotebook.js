import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNotebook } from '../api/notebooks'
import { getUser } from '../stores/authStore'
import { getNotebook, saveNotebook } from '../lib/db'

export function useNotebook(id) {
  const userId = getUser()?.googleId
  const [cached, setCached] = useState(null)

  const getCachedNotebook = async () => {
    if (!id) return
    const data = await getNotebook(id)
    setCached(data)
  }

  useEffect(() => {
    getCachedNotebook()
  }, [id])

  const query = useQuery({
    queryKey: ['notebook', id],
    queryFn: () => fetchNotebook(id),
    staleTime: 0,
    enabled: !!id,
    select: (data) => data?.data,
  })

  useEffect(() => {
    if (id && query.data) {
      saveNotebook(id, query.data)
    }
  }, [id, query.data])

  const data = query.data === undefined ? (cached ?? null) : query.data

  return {
    ...query,
    isLoading: query.isLoading && cached === null,
    data,
  }
}
