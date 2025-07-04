import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      exclude: [
        // Type definition files
        '**/types/**',

        // UI components and styles
        '**/ui/**',

        // Entry points and configuration
        '**/entrypoints/**/index.ts',
        '**/entrypoints/*.ts',
        '**/wxt.config.ts',

        // Build output directories
        '.output/**',
        '.wxt/**',

        // Node modules
        'node_modules/**',

        // Default exclusions
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './'),
    },
  },
})
