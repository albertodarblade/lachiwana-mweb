import React, { useEffect } from 'react'
import { Page, Preloader } from 'framework7-react'
import { setSession } from '../stores/authStore'

function decodeBase64Url(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'))
}

export default function AuthCallbackPage({ f7router }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const token = params.get('token')
    const userEncoded = params.get('user')

    if (error) {
      f7router.navigate(`/login?error=${encodeURIComponent(error)}`)
      return
    }

    if (!token || !userEncoded) {
      f7router.navigate('/login?error=auth_failed')
      return
    }

    try {
      const user = JSON.parse(decodeBase64Url(userEncoded))
      setSession({ token, user })
    } catch {
      f7router.navigate('/login?error=auth_failed')
      return
    }

    const destination = localStorage.getItem('lachiwana_pending_redirect') || '/'
    localStorage.removeItem('lachiwana_pending_redirect')
    f7router.navigate(destination)
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
