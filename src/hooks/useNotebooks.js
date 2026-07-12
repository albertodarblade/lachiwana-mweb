import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNotebooks } from '../api/notebooks'
import { getUser } from '../stores/authStore'
import { getNotebooks, saveNotebooks } from '../lib/db'

export function useNotebooks() {
  const userId = getUser()?.googleId
  const [cached, setCached] = useState(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getNotebooks(userId).then((data) => {
      if (!cancelled) setCached(data)
    })
    return () => { cancelled = true }
  }, [userId])

  const query = useQuery({
    queryKey: ['notebooks'],
    queryFn: fetchNotebooks,
    staleTime: Infinity,
    enabled: !!userId,
    onSuccess: (data) => {
      if (userId && data?.data) {
        saveNotebooks(userId, data.data)
      }
    },
  })

  return {
    ...query,
    data: cached ?? query.data,
  }
}
