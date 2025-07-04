import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        'src/test/**',
        'scripts/**',
        'docs/**',
        'supabase/**',
        'migrations/**',
        'examples/**',
        'k8s/**',
        'config/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    reporters: ['verbose', 'html', 'json'],
    outputFile: {
      html: './coverage/test-report.html',
      json: './coverage/test-results.json'
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    isolate: true,
    passWithNoTests: true,
    allowOnly: false,
    sequence: {
      shuffle: false
    },
    typecheck: {
      enabled: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './')
    }
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.VITE_SUPABASE_URL': '"https://test.supabase.co"',
    'process.env.VITE_SUPABASE_ANON_KEY': '"test-key"'
  }
}) 