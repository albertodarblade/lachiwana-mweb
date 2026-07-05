import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: false,
      devOptions: { enabled: false },
    }),
  ],
  envPrefix: 'LACHIWANA_',
  optimizeDeps: {
    include: ['framework7', 'framework7-react'],
    dedupe: ['react', 'react-dom'],
  },
})
