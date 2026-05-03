import React, { useState, useEffect } from 'react'
import { App as F7App, View } from 'framework7-react'
import OfflineBanner from './components/OfflineBanner'
import UpdateBanner from './components/UpdateBanner'
import { setOnUpdateReady } from './stores/swUpdateStore'
import NotebooksPage from './pages/NotebooksPage'
import CreateNotebookPage from './pages/CreateNotebookPage'
import NotebookDetailPage from './pages/NotebookDetailPage'
import EditNotebookPage from './pages/EditNotebookPage'
import NoteDetailPage from './pages/NoteDetailPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import { getSession } from './stores/authStore'
import { getPrefs } from './stores/settingsStore'

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

function ProtectedEdit(props) {
  return (
    <ProtectedRoute>
      <EditNotebookPage {...props} />
    </ProtectedRoute>
  )
}

function ProtectedNoteDetail(props) {
  return (
    <ProtectedRoute>
      <NoteDetailPage {...props} />
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

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/auth/callback', component: AuthCallbackPage },
  { path: '/settings', component: ProtectedSettings },
  { path: '/', component: ProtectedHome },
  { path: '/notebooks/create', component: ProtectedCreate },
  { path: '/notebooks/:id/edit', component: ProtectedEdit },
  { path: '/notebooks/:notebookId/notes/:noteId', component: ProtectedNoteDetail },
  { path: '/notebooks/:id', component: ProtectedDetail },
]

const f7params = {
  name: 'Lachiwana',
  theme: getPrefs(getSession()?.user?.googleId ?? '').theme,
  routes,
}

export default function App() {
  const [waitingWorker, setWaitingWorker] = useState(null)

  useEffect(() => {
    setOnUpdateReady(setWaitingWorker)
  }, [])

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
