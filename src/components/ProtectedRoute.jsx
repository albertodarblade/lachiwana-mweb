import React, { useEffect } from 'react'
import { getToken } from '../stores/tokenStore'
import { getSession } from '../stores/authStore'

export default function ProtectedRoute({ children }) {
  const token = getToken()
  const session = getSession()

  useEffect(() => {
    if (token || session) return
    const path = window.location.pathname
    if (path === '/login' || path.startsWith('/login')) return
    const redirect = encodeURIComponent(path)
    window.location.replace(`/login?redirect=${redirect}`)
  }, [])

  if (!token && !session) return null
  return children
}
