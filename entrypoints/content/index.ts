import { isVideoPage } from '~/utils/youtube'
import { createABRepeatManager } from './abRepeatManager'

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],

  async main(ctx) {
    let manager: ReturnType<typeof createABRepeatManager> | null = null

    // Initialize on video page
    const initializeIfVideoPage = () => {
      if (isVideoPage()) {
        if (!manager) {
          manager = createABRepeatManager()
          manager.init()
        }
      } else {
        if (manager) {
          manager.cleanup()
          manager = null
        }
      }
    }

    // Initial check
    initializeIfVideoPage()

    // Listen for YouTube navigation events
    window.addEventListener('yt-navigate-finish', initializeIfVideoPage)

    // Cleanup
    ctx.onInvalidated(() => {
      window.removeEventListener('yt-navigate-finish', initializeIfVideoPage)
      if (manager) {
        manager.cleanup()
      }
    })
  },
})
