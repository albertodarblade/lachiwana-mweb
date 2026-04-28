import React, { useEffect } from 'react'
import { f7 } from 'framework7-react'
import { getSession, isTokenExpired, clearSession } from '../stores/authStore'

export default function ProtectedRoute({ children }) {
  const session = getSession()
  const expired = !!(session && isTokenExpired(session.token))

  useEffect(() => {
    const redirect = encodeURIComponent(window.location.pathname)
    if (!session) {
      f7.views.main.router.navigate(`/login?redirect=${redirect}`)
    } else if (expired) {
      clearSession()
      f7.views.main.router.navigate(`/login?expired=1&redirect=${redirect}`)
    }
  }, [])

  if (!session || expired) return null
  return children
}
