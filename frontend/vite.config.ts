import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Point the API at a fixed URL in tests, whatever frontend/.env says.
    env: { VITE_API_URL: 'http://localhost:5001/api' },
  },
})
