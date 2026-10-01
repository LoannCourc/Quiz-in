import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Même alias que dans tsconfig.app.json et dans app/ : types et constantes communs.
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
})
