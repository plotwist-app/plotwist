import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom' },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/': resolve(__dirname, './src'),
    },
  },
})
