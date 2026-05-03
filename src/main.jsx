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
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
