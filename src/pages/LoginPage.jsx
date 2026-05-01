import React, { useState, useEffect } from 'react'
import { Page, Block, Preloader, Button } from 'framework7-react'
import { getSession, isTokenExpired } from '../stores/authStore'
import styles from './LoginPage.module.css'

const COLORS = {
  primary: '#BF5A00',
  text: '#111827',
  secondaryText: '#4B5563',
  lightGray: '#F3F4F6',
  decorativeHex: 'rgba(229, 231, 235, 0.3)',
}

function Hexagon({ size = 100, color = COLORS.decorativeHex, strokeWidth = 2, fill = 'none', className, style }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 100 115.47" className={className} style={style}>
      <path
        d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        transform="translate(0, 7.735)"
      />
    </svg>
  )
}

function MainLogo() {
  return (
    <div className={styles.mainLogo}>
      <svg width="80" height="92" viewBox="0 0 80 92" fill="none">
        {/* Outer Orange Hexagon */}
        <path d="M40 0L74.641 20V72L40 92L5.35898 72V20L40 0Z" fill={COLORS.primary} />
        {/* Inner White Hexagon Ring */}
        <path d="M40 12L64.2487 26V66L40 80L15.7513 66V26L40 12Z" fill="white" />
        {/* Innermost Orange Hexagon */}
        <path d="M40 22L57.3205 32V60L40 70L22.6795 60V32L40 22Z" fill={COLORS.primary} />
      </svg>
    </div>
  )
}

function GoogleLogo() {
  return (
    <div className={styles.googleLogoContainer}>
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    </div>
  )
}

const STATUS_MESSAGES = {
  expired: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
  auth_failed: 'Error al iniciar sesión. Inténtalo de nuevo.',
  access_denied: 'Inicio de sesión cancelado.',
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const serviceUrl = import.meta.env.LACHIWANA_SERVICE_URL
  const params = new URLSearchParams(window.location.search)

  useEffect(() => {
    const session = getSession()
    if (session && !isTokenExpired(session.token)) {
      const destination = params.get('redirect') || '/'
      window.location.replace(destination)
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
    <Page noNavbar className={styles.page}>
      {/* Decorative Background Hexagons */}
      <Hexagon size={120} style={{ position: 'absolute', top: '-2%', left: '-5%', opacity: 0.2 }} />
      <Hexagon size={80} style={{ position: 'absolute', top: '15%', right: '-10%', opacity: 0.15 }} />
      <Hexagon size={160} style={{ position: 'absolute', bottom: '15%', right: '-15%', opacity: 0.1 }} />
      <Hexagon size={140} style={{ position: 'absolute', bottom: '-5%', left: '-10%', opacity: 0.15 }} />

      <div className={styles.container}>
        <MainLogo />

        <h1 className={styles.title}>
          Lachiwana
        </h1>

        <h2 className={styles.subtitle}>
          Tu colmena familiar
        </h2>

        <p className={styles.description}>
          Organiza notas y tareas con toda tu familia. Trabajen juntos, como una colmena en armonía.
        </p>

        {statusMessage && (
          <Block className={styles.statusBlock}>
            <div className={`${styles.statusMessage} ${expired ? styles.statusExpired : styles.statusError}`}>
              {statusMessage}
            </div>
          </Block>
        )}

        <Button
          large
          fill
          onClick={handleSignIn}
          disabled={loading}
          className={styles.loginButton}
        >
          {loading ? (
            <Preloader color="white" size={24} />
          ) : (
            <>
              <GoogleLogo />
              <span>Continuar con Google</span>
            </>
          )}
        </Button>

        <div className={styles.footer}>
          <Hexagon size={24} color="#D1D5DB" fill="none" strokeWidth={6} />
          <span>Gratis para siempre · No requiere tarjeta</span>
        </div>
      </div>
    </Page>
  )
}
