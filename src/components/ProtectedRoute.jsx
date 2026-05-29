import React, { useEffect } from 'react'
import { getToken } from '../stores/tokenStore'

export default function ProtectedRoute({ children }) {
  const token = getToken()

  useEffect(() => {
    if (token) return
    const path = window.location.pathname
    if (path === '/login' || path.startsWith('/login')) return
    const redirect = encodeURIComponent(path)
    window.location.replace(`/login?redirect=${redirect}`)
  }, [])

  if (!token) return null
  return children
}
