import type { Decorator } from '@storybook/html'
import { mockYouTubeEnvironment, cleanupMocks } from '../utils/mockHelpers'

export const withTheme: Decorator = (storyFn, context) => {
  const theme = context.globals.theme || 'light'
  const isDark = theme === 'dark'
  
  // Apply theme
  mockYouTubeEnvironment(isDark)
  
  // Create story
  const story = storyFn()
  
  // Cleanup on unmount
  if (typeof story === 'object' && story instanceof HTMLElement) {
    const originalRemove = story.remove
    story.remove = function() {
      cleanupMocks()
      originalRemove.call(this)
    }
  }
  
  return story
}