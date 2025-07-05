import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { createABRepeatManager } from './abRepeatManager'
import type { ABRepeatState } from './types'

// Mock dependencies
vi.mock('./managers/urlManager')
vi.mock('./managers/videoLoopManager')
vi.mock('./state/abRepeatState')
vi.mock('./ui/domManager')

describe('abRepeatManager', () => {
  let mockStateManager: {
    getState: Mock
    setState: Mock
    toggleRepeat: Mock
    setStartTime: Mock
    setEndTime: Mock
    subscribe: Mock
    unsubscribe: Mock
  }
  let mockUrlManager: {
    loadStateFromURL: Mock
    updateURL: Mock
  }
  let mockVideoLoopManager: {
    findVideoElement: Mock
    startLoopCheck: Mock
    stopLoopCheck: Mock
    getCurrentTime: Mock
    cleanup: Mock
  }
  let mockDomManager: {
    insertButton: Mock
    insertForm: Mock
    updateUI: Mock
    cleanup: Mock
  }
  let stateChangeCallback: () => void

  beforeEach(async () => {
    vi.clearAllMocks()

    // Mock state manager
    let currentState: ABRepeatState = {
      enabled: false,
      startTime: null,
      endTime: null,
    }
    mockStateManager = {
      getState: vi.fn(() => currentState),
      setState: vi.fn((newState: Partial<ABRepeatState>) => {
        currentState = { ...currentState, ...newState }
        stateChangeCallback?.()
      }),
      toggleRepeat: vi.fn(() => {
        currentState.enabled = !currentState.enabled
        stateChangeCallback?.()
      }),
      setStartTime: vi.fn(),
      setEndTime: vi.fn(),
      subscribe: vi.fn((cb: () => void) => {
        stateChangeCallback = cb
      }),
      unsubscribe: vi.fn(),
    }

    // Mock URL manager
    mockUrlManager = {
      loadStateFromURL: vi.fn(),
      updateURL: vi.fn(),
    }

    // Mock video element
    const mockVideoElement = {} as HTMLVideoElement

    // Mock video loop manager
    mockVideoLoopManager = {
      findVideoElement: vi.fn().mockReturnValue(mockVideoElement),
      startLoopCheck: vi.fn(),
      stopLoopCheck: vi.fn(),
      getCurrentTime: vi.fn().mockReturnValue(0),
      cleanup: vi.fn(),
    }

    // Mock DOM manager
    mockDomManager = {
      insertButton: vi.fn(),
      insertForm: vi.fn(),
      updateUI: vi.fn(),
      cleanup: vi.fn(),
    }

    // Set up mocks
    const { createStateManager } = await import('./state/abRepeatState')
    ;(createStateManager as Mock).mockReturnValue(mockStateManager)

    const { createURLManager } = await import('./managers/urlManager')
    ;(createURLManager as Mock).mockReturnValue(mockUrlManager)

    const { createVideoLoopManager } = await import(
      './managers/videoLoopManager'
    )
    ;(createVideoLoopManager as Mock).mockReturnValue(mockVideoLoopManager)

    const { createDOMManager } = await import('./ui/domManager')
    ;(createDOMManager as Mock).mockReturnValue(mockDomManager)

    // Mock DOM APIs
    global.document = {
      querySelector: vi.fn((selector: string) => {
        if (selector === '.ytp-time-display') return {}
        if (selector === '#below') return {}
        return null
      }),
      body: {
        childList: true,
        subtree: true,
      },
    } as unknown as Document

    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as Window & typeof globalThis

    global.MutationObserver = vi.fn(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    })) as unknown as typeof MutationObserver
  })

  describe('video navigation', () => {
    it('should preserve enabled state when navigating to a new video', async () => {
      const manager = createABRepeatManager()

      // Initialize with repeat enabled
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: true,
        startTime: 10,
        endTime: 20,
      })

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Verify initial state
      expect(mockStateManager.setState).toHaveBeenCalledWith({
        enabled: true,
        startTime: 10,
        endTime: 20,
      })

      // Simulate video navigation
      mockUrlManager.loadStateFromURL.mockReturnValueOnce(null)

      // Get the event handler that was registered
      const ytNavigateHandler = (
        global.window.addEventListener as Mock
      ).mock.calls.find((call) => call[0] === 'yt-navigate-finish')?.[1]

      // Call the handler
      if (ytNavigateHandler) {
        ytNavigateHandler()
      }

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check that enabled state is preserved but times are reset
      const setStateCalls = mockStateManager.setState.mock.calls
      const lastCall = setStateCalls[setStateCalls.length - 1][0]

      expect(lastCall.enabled).toBe(true)
      expect(lastCall.startTime).toBeNull()
      expect(lastCall.endTime).toBeNull()
    })

    it('should reset times but keep enabled state when URL has no parameters', async () => {
      const manager = createABRepeatManager()

      // Initialize with repeat enabled and times set
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: true,
        startTime: 30,
        endTime: 60,
      })

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Simulate navigation to new video with no URL params
      mockUrlManager.loadStateFromURL.mockReturnValueOnce(null)

      // Get the event handler that was registered
      const ytNavigateHandler = (
        global.window.addEventListener as Mock
      ).mock.calls.find((call) => call[0] === 'yt-navigate-finish')?.[1]

      // Call the handler
      if (ytNavigateHandler) {
        ytNavigateHandler()
      }

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should preserve enabled state
      const setStateCalls = mockStateManager.setState.mock.calls
      const resetCall = setStateCalls.find(
        (call) => call[0].startTime === null && call[0].endTime === null,
      )

      expect(resetCall).toBeDefined()
      expect(resetCall?.[0].enabled).toBe(true)
    })

    it('should override with URL state if URL has different enabled value', async () => {
      const manager = createABRepeatManager()

      // Initialize with repeat enabled
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: true,
        startTime: 10,
        endTime: 20,
      })

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Simulate navigation with URL having disabled state
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: false,
        startTime: 5,
        endTime: 15,
      })

      // Get the event handler that was registered
      const ytNavigateHandler = (
        global.window.addEventListener as Mock
      ).mock.calls.find((call) => call[0] === 'yt-navigate-finish')?.[1]

      // Call the handler
      if (ytNavigateHandler) {
        ytNavigateHandler()
      }

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should use URL's enabled state
      const setStateCalls = mockStateManager.setState.mock.calls
      const lastCall = setStateCalls[setStateCalls.length - 1][0]

      expect(lastCall.enabled).toBe(false)
      expect(lastCall.startTime).toBe(5)
      expect(lastCall.endTime).toBe(15)
    })

    it('should update URL after navigation when enabled state is preserved', async () => {
      const manager = createABRepeatManager()

      // Initialize with repeat enabled
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: true,
        startTime: 10,
        endTime: 20,
      })

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Clear previous URL update calls
      mockUrlManager.updateURL.mockClear()

      // Simulate navigation to new video (URL has no AB repeat params)
      mockUrlManager.loadStateFromURL.mockReturnValueOnce(null)

      // Get the event handler that was registered
      const ytNavigateHandler = (
        global.window.addEventListener as Mock
      ).mock.calls.find((call) => call[0] === 'yt-navigate-finish')?.[1]

      // Call the handler
      if (ytNavigateHandler) {
        ytNavigateHandler()
      }

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should have called updateURL with enabled state preserved
      const updateURLCalls = mockUrlManager.updateURL.mock.calls
      const finalUpdateCall = updateURLCalls[updateURLCalls.length - 1]

      expect(finalUpdateCall).toBeDefined()
      expect(finalUpdateCall[0].enabled).toBe(true)
      expect(finalUpdateCall[0].startTime).toBe(null)
      expect(finalUpdateCall[0].endTime).toBe(null)
      expect(finalUpdateCall[1]).toEqual({
        isInitialLoad: false,
        setupInProgress: false,
      })
    })

    it('should handle popstate event similarly to yt-navigate-finish', async () => {
      const manager = createABRepeatManager()

      // Initialize with repeat enabled
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: true,
        startTime: 10,
        endTime: 20,
      })

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Clear previous calls
      mockStateManager.setState.mockClear()

      // Simulate popstate navigation
      mockUrlManager.loadStateFromURL.mockReturnValueOnce(null)

      // Get the event handler that was registered
      const popstateHandler = (
        global.window.addEventListener as Mock
      ).mock.calls.find((call) => call[0] === 'popstate')?.[1]

      // Call the handler
      if (popstateHandler) {
        popstateHandler()
      }

      // Wait for event processing
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should preserve enabled state
      const setStateCalls = mockStateManager.setState.mock.calls
      expect(setStateCalls.length).toBeGreaterThan(0)

      const resetCall = setStateCalls[0][0]
      expect(resetCall.enabled).toBe(true)
      expect(resetCall.startTime).toBeNull()
      expect(resetCall.endTime).toBeNull()
    })
  })

  describe('page reload', () => {
    it('should restore state from URL on page reload', async () => {
      const manager = createABRepeatManager()

      // Simulate URL state from a previous session
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: true,
        startTime: 45,
        endTime: 90,
      })

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Verify state was restored from URL
      expect(mockStateManager.setState).toHaveBeenCalledWith({
        enabled: true,
        startTime: 45,
        endTime: 90,
      })

      // Verify UI was updated
      expect(mockDomManager.updateUI).toHaveBeenCalled()

      // Verify video loop was started
      expect(mockVideoLoopManager.startLoopCheck).toHaveBeenCalled()
    })

    it('should initialize with default state when URL has no AB repeat parameters', async () => {
      const manager = createABRepeatManager()

      // Simulate fresh page load with no URL parameters
      mockUrlManager.loadStateFromURL.mockReturnValueOnce(null)

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Should not call setState when there's no URL state
      expect(mockStateManager.setState).not.toHaveBeenCalled()

      // Default state should be used (enabled: false)
      expect(mockStateManager.getState()).toEqual({
        enabled: false,
        startTime: null,
        endTime: null,
      })

      // Video loop should not be started
      expect(mockVideoLoopManager.startLoopCheck).not.toHaveBeenCalled()
    })

    it('should handle partial URL state on reload', async () => {
      const manager = createABRepeatManager()

      // Simulate URL with only enabled flag, no times
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: true,
        startTime: null,
        endTime: null,
      })

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Verify state was set correctly
      expect(mockStateManager.setState).toHaveBeenCalledWith({
        enabled: true,
        startTime: null,
        endTime: null,
      })

      // UI should be updated even without times
      expect(mockDomManager.updateUI).toHaveBeenCalled()

      // Video loop should be started (even without times set)
      expect(mockVideoLoopManager.startLoopCheck).toHaveBeenCalled()
    })

    it('should restore state with specific start and end times from URL', async () => {
      const manager = createABRepeatManager()

      // Simulate URL state with specific times
      mockUrlManager.loadStateFromURL.mockReturnValueOnce({
        enabled: true,
        startTime: 120, // 2:00
        endTime: 180, // 3:00
      })

      manager.init()

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Verify exact state was restored
      expect(mockStateManager.setState).toHaveBeenCalledWith({
        enabled: true,
        startTime: 120,
        endTime: 180,
      })

      // Verify URL was not updated during initial load
      expect(mockUrlManager.updateURL).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
          startTime: 120,
          endTime: 180,
        }),
        expect.objectContaining({
          isInitialLoad: true,
        }),
      )
    })
  })

  describe('cleanup', () => {
    it('should cleanup all managers', () => {
      const manager = createABRepeatManager()
      manager.init()
      manager.cleanup()

      expect(mockVideoLoopManager.cleanup).toHaveBeenCalled()
      expect(mockDomManager.cleanup).toHaveBeenCalled()
    })
  })
})
