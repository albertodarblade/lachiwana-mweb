import React, { useEffect } from 'react'
import { getSession, isTokenExpired, clearSession } from '../stores/authStore'

export default function ProtectedRoute({ children }) {
  const session = getSession()
  const expired = !!(session && isTokenExpired(session.token))

  useEffect(() => {
    const redirect = encodeURIComponent(window.location.pathname)
    if (!session) {
      window.location.replace(`/login?redirect=${redirect}`)
    } else if (expired) {
      clearSession()
      window.location.replace(`/login?expired=1&redirect=${redirect}`)
    }
  }, [])

  if (!session || expired) return null
  return children
}
