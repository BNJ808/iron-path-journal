import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/nom-de-votre-repo/', // Remplacez par le nom de votre repo GitHub
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
