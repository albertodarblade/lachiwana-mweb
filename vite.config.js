import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envPrefix: 'LACHIWANA_',
  optimizeDeps: {
    include: ['framework7', 'framework7-react'],
  },
})
