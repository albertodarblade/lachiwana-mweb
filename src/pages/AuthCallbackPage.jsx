import React, { useEffect } from 'react'
import { Page, Preloader } from 'framework7-react'
import { setToken } from '../stores/tokenStore'
import { setUser } from '../stores/authStore'

function finish(destination) {
  if (localStorage.getItem('lachiwana_oauth_popup') === '1') {
    // Running inside the OAuth popup — signal main window via storage event.
    // window.opener is not used because Google's COOP header destroys it.
    localStorage.removeItem('lachiwana_oauth_popup')
    localStorage.setItem('lachiwana_oauth_done', destination)
    window.close()
  } else {
    window.location.replace(destination)
  }
}

export default function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const accessToken = params.get('accessToken')
    const expiresAt = params.get('expiresAt')
    const userRaw = params.get('user')
    const refreshToken = params.get('refreshToken')
    if (refreshToken) localStorage.setItem('lachiwana_rt', refreshToken)

    if (error) {
      finish(`/login?error=${encodeURIComponent(error)}`)
      return
    }

    if (!accessToken || !userRaw) {
      finish('/login?error=auth_failed')
      return
    }

    let user
    try {
      user = JSON.parse(decodeURIComponent(userRaw))
    } catch {
      finish('/login?error=auth_failed')
      return
    }

    const destination = localStorage.getItem('lachiwana_pending_redirect') || '/'
    localStorage.removeItem('lachiwana_pending_redirect')

    setUser(user)

    if (localStorage.getItem('lachiwana_oauth_popup') === '1') {
      // Popup flow: hand off token to main window via transient localStorage key
      localStorage.setItem('lachiwana_oauth_token', JSON.stringify({ accessToken, expiresAt, refreshToken }))
      console.debug('[auth] token captured at callback (popup)')
      finish(destination)
    } else {
      // Redirect flow: store token in memory directly, clear URL params
      setToken(accessToken, expiresAt)
      console.debug('[auth] token captured at callback (redirect)')
      window.history.replaceState({}, '', destination)
      window.location.replace(destination)
    }
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
