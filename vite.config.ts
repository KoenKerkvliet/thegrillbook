import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from /thegrillbook/ until a custom domain is attached.
// Local dev keeps serving from the root so `npm run dev` works without a path prefix.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/thegrillbook/' : '/',
}))
