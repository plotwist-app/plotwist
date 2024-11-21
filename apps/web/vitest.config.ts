import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const r = (p: string) => resolve(__dirname, p)

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['src/**/'],
      reporter: ['html'],
    },
    setupFiles: ['./test/setup.ts', './test/mocks.ts'],
  },
  resolve: {
    alias: {
      '@/': r('./src'),
      '@': r('./src'),
    },
  },
})
