import { createURLManager } from './managers/urlManager'
import { createVideoLoopManager } from './managers/videoLoopManager'
import { createStateManager } from './state/abRepeatState'
import { createDOMManager } from './ui/domManager'

export function createABRepeatManager() {
  // Tracking flags
  let isInitialLoad = true
  let setupInProgress = false

  // Create managers
  const stateManager = createStateManager()
  const urlManager = createURLManager()
  const videoLoopManager = createVideoLoopManager()
  const domManager = createDOMManager({
    onToggleRepeat: () => stateManager.toggleRepeat(),
    onStartTimeChange: (time: number | null) => stateManager.setStartTime(time),
    onEndTimeChange: (time: number | null) => stateManager.setEndTime(time),
    getCurrentTime: () => videoLoopManager.getCurrentTime(),
  })

  // Subscribe to state changes
  stateManager.subscribe(() => {
    const state = stateManager.getState()

    // Update URL
    urlManager.updateURL(state, { isInitialLoad, setupInProgress })

    // Update UI
    domManager.updateUI(state)

    // Manage video loop
    const videoElement = videoLoopManager.findVideoElement()
    if (state.enabled && videoElement) {
      videoLoopManager.startLoopCheck(state)
    } else if (!state.enabled) {
      videoLoopManager.stopLoopCheck()
    }
  })

  // Video change handling
  function handleVideoChange(): void {
    setupInProgress = true

    // Get current state to preserve enabled status
    const currentState = stateManager.getState()

    // Reset state but preserve enabled status
    stateManager.setState({
      enabled: currentState.enabled,
      startTime: null,
      endTime: null,
    })

    // Load from URL (this will override if URL has different values)
    const urlState = urlManager.loadStateFromURL()
    if (urlState) {
      // If URL doesn't have enabled state, preserve current enabled state
      if (urlState.enabled === undefined) {
        urlState.enabled = currentState.enabled
      }
      stateManager.setState(urlState)
    }

    setupInProgress = false
    isInitialLoad = false

    // Force URL update after setup is complete
    const finalState = stateManager.getState()
    urlManager.updateURL(finalState, {
      isInitialLoad: false,
      setupInProgress: false,
    })
  }

  // Initialization
  function init(): void {
    // Mark as initial load to prevent URL updates
    isInitialLoad = true

    // Load initial state
    const urlState = urlManager.loadStateFromURL()
    if (urlState) {
      stateManager.setState(urlState)
    }

    // Find video element
    videoLoopManager.findVideoElement()

    // Insert UI elements
    const tryInsertUI = () => {
      const state = stateManager.getState()
      domManager.insertButton(state)
      domManager.insertForm(state)

      // Check if UI is ready
      const timeDisplay = document.querySelector('.ytp-time-display')
      const belowPlayer = document.querySelector('#below')

      if (!timeDisplay || !belowPlayer) {
        setTimeout(tryInsertUI, 100)
      } else {
        isInitialLoad = false

        // Start loop check if enabled
        if (state.enabled) {
          const videoElement = videoLoopManager.findVideoElement()
          if (videoElement) {
            videoLoopManager.startLoopCheck(state)
          }
        }
      }
    }
    tryInsertUI()

    // Watch for video changes
    const observer = new MutationObserver(() => {
      const videoElement = videoLoopManager.findVideoElement()
      if (videoElement && stateManager.getState().enabled) {
        videoLoopManager.startLoopCheck(stateManager.getState())
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    // Listen for navigation
    window.addEventListener('yt-navigate-finish', handleVideoChange)
    window.addEventListener('popstate', handleVideoChange)
  }

  // Cleanup
  function cleanup(): void {
    videoLoopManager.cleanup()
    domManager.cleanup()
  }

  return {
    init,
    cleanup,
  }
}
