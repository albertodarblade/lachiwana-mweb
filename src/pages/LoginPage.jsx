import React, { useState, useEffect } from 'react'
import { Page, Block, BlockTitle, Preloader, f7 } from 'framework7-react'
import { getSession, isTokenExpired } from '../stores/authStore'

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function GoogleSignInButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '14px 16px',
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: '8px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        fontSize: '16px',
        fontWeight: '500',
        color: '#3c4043',
        transition: 'opacity 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {loading ? <Preloader size={20} /> : <><GoogleLogo /><span>Sign in with Google</span></>}
    </button>
  )
}

const STATUS_MESSAGES = {
  expired: 'Your session has expired. Please sign in again.',
  auth_failed: 'Sign-in failed. Please try again.',
  access_denied: 'Sign-in was cancelled.',
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const serviceUrl = import.meta.env.LACHIWANA_SERVICE_URL

  const params = new URLSearchParams(window.location.search)

  useEffect(() => {
    const session = getSession()
    if (session && !isTokenExpired(session.token)) {
      const destination = params.get('redirect') || '/'
      f7.views.main.router.navigate(destination)
    }
  }, [])
  const expired = params.get('expired') === '1'
  const error = params.get('error')
  const statusMessage = expired ? STATUS_MESSAGES.expired : STATUS_MESSAGES[error] ?? null

  function handleSignIn() {
    setLoading(true)
    const redirect = params.get('redirect')
    if (redirect) localStorage.setItem('lachiwana_pending_redirect', redirect)
    window.location.href = `${serviceUrl}/api/v1/auth/google`
  }

  return (
    <Page noNavbar>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}>
        <BlockTitle large style={{ textAlign: 'center', marginBottom: '4px' }}>
          Lachiwana
        </BlockTitle>
        {statusMessage && (
          <Block style={{ width: '100%', maxWidth: '360px', margin: '16px 0 0' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: expired ? 'var(--f7-color-yellow-tint)' : 'var(--f7-color-red-tint)',
              color: expired ? 'var(--f7-color-yellow-shade)' : 'var(--f7-color-red-shade)',
              fontSize: '14px',
              textAlign: 'center',
            }}>
              {statusMessage}
            </div>
          </Block>
        )}
        <Block style={{ width: '100%', maxWidth: '360px', margin: '24px 0 0' }}>
          <GoogleSignInButton onClick={handleSignIn} loading={loading} />
        </Block>
      </div>
    </Page>
  )
}
