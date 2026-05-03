import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'

import 'framework7/css/bundle'
import 'framework7-icons/css/framework7-icons.css'
import Framework7 from "framework7/lite-bundle";
import Framework7React from "framework7-react";
import App from './App'
import queryClient from './queryClient'
import { getSession } from './stores/authStore'
import { getPrefs, applyPrefs } from './stores/settingsStore'
import { notifyUpdateReady } from './stores/swUpdateStore'

Framework7.use(Framework7React);

applyPrefs(getPrefs(getSession()?.user?.googleId ?? ''))

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdateReady(newWorker)
            }
          })
        })
      })
    })
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((r) => r.unregister())
    })
  }
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
