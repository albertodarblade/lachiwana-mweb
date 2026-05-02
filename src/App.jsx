import React from 'react'
import { App as F7App, View } from 'framework7-react'
import NotebooksPage from './pages/NotebooksPage'
import CreateNotebookPage from './pages/CreateNotebookPage'
import NotebookDetailPage from './pages/NotebookDetailPage'
import EditNotebookPage from './pages/EditNotebookPage'
import CreateNotePage from './pages/CreateNotePage'
import NoteDetailPage from './pages/NoteDetailPage'
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

function ProtectedNoteCreate(props) {
  return (
    <ProtectedRoute>
      <CreateNotePage {...props} />
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

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/auth/callback', component: AuthCallbackPage },
  { path: '/', component: ProtectedHome },
  { path: '/notebooks/create', component: ProtectedCreate },
  { path: '/notebooks/:id/edit', component: ProtectedEdit },
  { path: '/notebooks/:notebookId/notes/create', component: ProtectedNoteCreate },
  { path: '/notebooks/:notebookId/notes/:noteId', component: ProtectedNoteDetail },
  { path: '/notebooks/:id', component: ProtectedDetail },
]

const f7params = {
  name: 'Lachiwana',
  theme: 'ios',
  routes,
}

export default function App() {
  return (
    <F7App {...f7params}>
      <View main url="/" browserHistory browserHistorySeparator="" />
    </F7App>
  )
}
