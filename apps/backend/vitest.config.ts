import swc from 'unplugin-swc'
import tsConfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './',
    globalSetup: './src/test/global-setup.ts',
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
        'src/domain/errors/**',
        'src/infra/ports/**',
        'src/infra/http/routes/**',
        'src/infra/http/server.ts',
        'src/infra/http/transform-schema.ts',
        'src/infra/db/**',
        'src/infra/http/schemas/**',
        'src/infra/adapters/**',
        'src/infra/factories/**',
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
