import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'

import 'framework7/css/bundle'
import 'framework7-icons/css/framework7-icons.css'

import App from './App'
import queryClient from './queryClient'

ReactDOM.createRoot(document.getElementById('app')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
