import React from 'react'
import { App as F7App, View } from 'framework7-react'
import NotebooksPage from './pages/NotebooksPage'
import CreateNotebookPage from './pages/CreateNotebookPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProtectedRoute from './components/ProtectedRoute'
import { getSession, isTokenExpired } from './stores/authStore'

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

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/auth/callback', component: AuthCallbackPage },
  { path: '/', component: ProtectedHome },
  { path: '/notebooks/create', component: ProtectedCreate },
]

const f7params = {
  name: 'Lachiwana',
  theme: 'auto',
  routes,
}

const PUBLIC_ROUTES = ['/login', '/auth/callback']

function resolveInitialUrl() {
  const path = window.location.pathname
  if (PUBLIC_ROUTES.includes(path)) return path
  const session = getSession()
  if (session && !isTokenExpired(session.token)) return path
  return '/login'
}

export default function App() {
  return (
    <F7App {...f7params}>
      <View main url={resolveInitialUrl()} />
    </F7App>
  )
}
