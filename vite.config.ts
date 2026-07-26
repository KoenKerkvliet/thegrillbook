import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the thegrillbook.nl root now that the custom domain is attached.
export default defineConfig({
  plugins: [react()],
  base: '/',
})
