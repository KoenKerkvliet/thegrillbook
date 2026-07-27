import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Served from the bbqheros.nl root now that the custom domain is attached.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // public/manifest.webmanifest is already linked from index.html — reuse it
      // instead of generating a second, competing one.
      manifest: false,
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ico,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  base: '/',
})
