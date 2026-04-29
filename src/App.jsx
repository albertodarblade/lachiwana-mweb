import React from 'react'
import { App as F7App, View } from 'framework7-react'
import NotebooksPage from './pages/NotebooksPage'
import CreateNotebookPage from './pages/CreateNotebookPage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProtectedRoute from './components/ProtectedRoute'
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

export default function App() {
  return (
    <F7App {...f7params}>
      <View main url="/" browserHistory browserHistorySeparator="" />
    </F7App>
  )
}
