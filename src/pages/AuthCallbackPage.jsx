import React, { useEffect } from 'react'
import { Page, Preloader } from 'framework7-react'
import { setSession } from '../stores/authStore'

export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const token = params.get('token')
    const userRaw = params.get('user')

    if (error) {
      window.location.replace(`/login?error=${encodeURIComponent(error)}`)
      return
    }

    if (!token || !userRaw) {
      window.location.replace('/login?error=auth_failed')
      return
    }

    try {
      const user = JSON.parse(userRaw)
      setSession({ token, user })
    } catch {
      window.location.replace('/login?error=auth_failed')
      return
    }

    const destination = localStorage.getItem('lachiwana_pending_redirect') || '/'
    localStorage.removeItem('lachiwana_pending_redirect')
    window.location.replace(destination)
  }, [])

  return (
    <Page noNavbar>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Preloader size={44} />
      </div>
    </Page>
  )
}
