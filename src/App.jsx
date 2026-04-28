import React from 'react'
import { App as F7App, View } from 'framework7-react'
import HomePage from './pages/HomePage'

const routes = [
  { path: '/', component: HomePage },
]

const f7params = {
  name: 'Lachiwana',
  theme: 'auto',
  routes,
}

export default function App() {
  return (
    <F7App {...f7params}>
      <View main url="/" />
    </F7App>
  )
}
