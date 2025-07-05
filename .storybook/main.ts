import type { StorybookConfig } from '@storybook/html-vite'
import vitestConfig from '../vitest.config'

const config: StorybookConfig = {
  stories: ['../entrypoints/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      ...vitestConfig.resolve,
    }
    return config
  },
}

export default config