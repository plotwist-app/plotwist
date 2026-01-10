import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      enabled: true,
      exclude: [
        '**/*.d.ts',
        'drizzle.config.ts',
        'tsup.config.ts',
        'vitest.config.ts',
        'deploy/index.ts',
        'src/main.ts',
        'src/@types/**',
        'src/utils/**',
        'src/test/factories/**',
        'src/ports/**',
        'src/domain/errors/**',
        'src/http/schemas/**',
        'src/http/routes/**',
        'src/http/server.ts',
        'src/http/transform-schema.ts',
        'src/db/**',
        'src/adapters/**',
        'src/factories/**',
        'src/domain/entities/**',
      ],
    },
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
})
