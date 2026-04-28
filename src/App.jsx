import React from 'react'
import { App as F7App, View } from 'framework7-react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProtectedRoute from './components/ProtectedRoute'
import { getSession, isTokenExpired } from './stores/authStore'

function ProtectedHome() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  )
}

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/auth/callback', component: AuthCallbackPage },
  { path: '/', component: ProtectedHome },
]

const f7params = {
  name: 'Lachiwana',
  theme: 'auto',
  routes,
}

function resolveInitialUrl() {
  const session = getSession()
  if (session && !isTokenExpired(session.token)) return '/'
  return '/login'
}

export default function App() {
  return (
    <F7App {...f7params}>
      <View main url={resolveInitialUrl()} />
    </F7App>
  )
}
