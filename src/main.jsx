import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'

import 'framework7/css/bundle'
import 'framework7-icons/css/framework7-icons.css'
import Framework7 from "framework7/lite-bundle";
import Framework7React from "framework7-react";
import App from './App'
import queryClient from './queryClient'

Framework7.use(Framework7React);

ReactDOM.createRoot(document.getElementById('app')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
