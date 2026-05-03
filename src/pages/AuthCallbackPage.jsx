import React, { useEffect } from 'react'
import { Page, Preloader } from 'framework7-react'
import { setSession } from '../stores/authStore'

function finish(destination) {
  if (localStorage.getItem('lachiwana_oauth_popup') === '1') {
    // Running inside the OAuth popup — signal main window via storage event.
    // window.opener is not used because Google's COOP header destroys it.
    localStorage.removeItem('lachiwana_oauth_popup')
    localStorage.setItem('lachiwana_oauth_done', destination)
    window.close()
  } else {
    // Redirect flow (popup was blocked) — navigate directly
    window.location.replace(destination)
  }
}

export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const token = params.get('token')
    const userRaw = params.get('user')

    if (error) {
      finish(`/login?error=${encodeURIComponent(error)}`)
      return
    }

    if (!token || !userRaw) {
      finish('/login?error=auth_failed')
      return
    }

    try {
      const user = JSON.parse(userRaw)
      setSession({ token, user })
    } catch {
      finish('/login?error=auth_failed')
      return
    }

    const destination = localStorage.getItem('lachiwana_pending_redirect') || '/'
    localStorage.removeItem('lachiwana_pending_redirect')
    finish(destination)
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
