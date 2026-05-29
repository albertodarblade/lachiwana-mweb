import React, { useState, useEffect } from 'react'
import { App as F7App, View, Preloader } from 'framework7-react'
import OfflineBanner from './components/OfflineBanner'
import UpdateBanner from './components/UpdateBanner'
import { setOnUpdateReady } from './stores/swUpdateStore'
import NotebooksPage from './pages/NotebooksPage'
import CreateNotebookPage from './pages/CreateNotebookPage'
import NotebookDetailPage from './pages/NotebookDetailPage'
import NotebookTransactionsPage from './pages/NotebookTransactionsPage'
import EditNotebookPage from './pages/EditNotebookPage'
import NoteEditorPage from './pages/NoteEditorPage'
import CreateNoteEditorPage from './pages/CreateNoteEditorPage'
import TransactionEditPage from './pages/TransactionEditPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import { getUser } from './stores/authStore'
import { getPrefs } from './stores/settingsStore'
import { getToken, setToken } from './stores/tokenStore'
import { refreshToken } from './api/auth'

function ProtectedHome(props) {
  return (
    <ProtectedRoute>
      <NotebooksPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedCreate(props) {
  return (
    <ProtectedRoute>
      <CreateNotebookPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedDetail(props) {
  return (
    <ProtectedRoute>
      <NotebookDetailPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedTransactions(props) {
  return (
    <ProtectedRoute>
      <NotebookTransactionsPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedEdit(props) {
  return (
    <ProtectedRoute>
      <EditNotebookPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedNoteEditor(props) {
  return (
    <ProtectedRoute>
      <NoteEditorPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedCreateNoteEditor(props) {
  return (
    <ProtectedRoute>
      <CreateNoteEditorPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedSettings(props) {
  return (
    <ProtectedRoute>
      <SettingsPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedTransactionEdit(props) {
  return (
    <ProtectedRoute>
      <TransactionEditPage {...props} />
    </ProtectedRoute>
  )
}

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/auth/callback', component: AuthCallbackPage },
  { path: '/settings', component: ProtectedSettings },
  { path: '/', component: ProtectedHome },
  { path: '/notebooks/create', component: ProtectedCreate },
  { path: '/notebooks/:id/edit', component: ProtectedEdit },
  { path: '/notebooks/:notebookId/notes/create', component: ProtectedCreateNoteEditor },
  { path: '/notebooks/:notebookId/notes/:noteId', component: ProtectedNoteEditor },
  { path: '/notebooks/:id/notes', component: ProtectedDetail },
  { path: '/notebooks/:notebookId/transactions/:transactionId/edit', component: ProtectedTransactionEdit },
  { path: '/notebooks/:id/transactions', component: ProtectedTransactions },
  { path: '/notebooks/:id', component: ProtectedDetail },
]

const f7params = {
  name: 'Lachiwana',
  theme: getPrefs(getUser()?.googleId ?? '').theme,
  routes,
}

export default function App() {
  const [waitingWorker, setWaitingWorker] = useState(null)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    setOnUpdateReady(setWaitingWorker)
  }, [])

  useEffect(() => {
    const path = window.location.pathname
    if (path === '/auth/callback' || path.startsWith('/login')) {
      setSessionChecked(true)
      return
    }
    if (getToken()) {
      setSessionChecked(true)
      return
    }
    refreshToken()
      .then(({ accessToken, expiresAt }) => {
        setToken(accessToken, expiresAt)
      })
      .catch(() => {
        // No valid session — ProtectedRoute will redirect to /login
      })
      .finally(() => {
        setSessionChecked(true)
      })
  }, [])

  // Keep --keyboard-offset in sync with the visual viewport so the note-editor
  // layout shrinks to exactly the area above the soft keyboard on all platforms.
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  if (!sessionChecked) {
    return (
      <div
        data-testid="app-session-loading"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
      >
        <Preloader size={44} />
      </div>
    )
  }

  return (
    <>
      <OfflineBanner />
      <UpdateBanner
        waitingWorker={waitingWorker}
        onDismiss={() => setWaitingWorker(null)}
      />
      <F7App {...f7params}>
        <View main url="/" browserHistory browserHistorySeparator="" />
      </F7App>
    </>
  )
}
