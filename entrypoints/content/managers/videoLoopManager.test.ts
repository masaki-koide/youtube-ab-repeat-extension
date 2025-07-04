import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createVideoLoopManager,
  type TimerService,
  type VideoService,
} from './videoLoopManager'

describe('VideoLoopManager', () => {
  let mockVideoElement: HTMLVideoElement
  let mockVideoService: VideoService
  let mockTimerService: TimerService
  let timerCallbacks: Map<number, () => void>
  let timerId: number

  beforeEach(() => {
    // Mock video element
    mockVideoElement = {
      currentTime: 0,
      duration: 100,
      paused: false,
    } as HTMLVideoElement

    // Mock video service
    mockVideoService = {
      querySelector: vi.fn(() => mockVideoElement),
    }

    // Mock timer service with manual control
    timerCallbacks = new Map()
    timerId = 0
    mockTimerService = {
      setInterval: vi.fn((callback: () => void, _delay: number) => {
        const id = ++timerId
        timerCallbacks.set(id, callback)
        return id
      }),
      clearInterval: vi.fn((id: number) => {
        timerCallbacks.delete(id)
      }),
    }
  })

  function triggerIntervalCallback(id: number) {
    const callback = timerCallbacks.get(id)
    if (callback) {
      callback()
    }
  }

  describe('findVideoElement', () => {
    it('searches for and returns video element', () => {
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)

      const result = manager.findVideoElement()

      expect(mockVideoService.querySelector).toHaveBeenCalledWith('video')
      expect(result).toBe(mockVideoElement)
    })

    it('returns null when video element is not found', () => {
      mockVideoService.querySelector = vi.fn(() => null)
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)

      const result = manager.findVideoElement()

      expect(result).toBe(null)
    })
  })

  describe('getCurrentTime', () => {
    it('returns current time of video element as integer', () => {
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)
      manager.findVideoElement()
      mockVideoElement.currentTime = 45.7

      const time = manager.getCurrentTime()

      expect(time).toBe(45)
    })

    it('returns 0 when video element is not present', () => {
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)
      // do not call findVideoElement

      const time = manager.getCurrentTime()

      expect(time).toBe(0)
    })
  })

  describe('startLoopCheck', () => {
    it('starts loop check interval', () => {
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)
      manager.findVideoElement()

      manager.startLoopCheck({ enabled: true, startTime: 10, endTime: 30 })

      expect(mockTimerService.setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        100,
      )
    })

    it('clears existing interval before starting new one', () => {
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)
      manager.findVideoElement()

      // first interval
      manager.startLoopCheck({ enabled: true, startTime: 10, endTime: 30 })
      const firstIntervalId = 1

      // second interval
      manager.startLoopCheck({ enabled: true, startTime: 20, endTime: 40 })

      expect(mockTimerService.clearInterval).toHaveBeenCalledWith(
        firstIntervalId,
      )
      expect(mockTimerService.setInterval).toHaveBeenCalledTimes(2)
    })

    describe('loop processing', () => {
      it('returns to start time when end time is reached', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        manager.findVideoElement()

        manager.startLoopCheck({ enabled: true, startTime: 10, endTime: 30 })
        mockVideoElement.currentTime = 30

        triggerIntervalCallback(1)

        expect(mockVideoElement.currentTime).toBe(10)
      })

      it('returns to start time when exceeding end time', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        manager.findVideoElement()

        manager.startLoopCheck({ enabled: true, startTime: 10, endTime: 30 })
        mockVideoElement.currentTime = 35

        triggerIntervalCallback(1)

        expect(mockVideoElement.currentTime).toBe(10)
      })

      it('does nothing if end time is not reached', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        manager.findVideoElement()

        manager.startLoopCheck({ enabled: true, startTime: 10, endTime: 30 })
        mockVideoElement.currentTime = 25

        triggerIntervalCallback(1)

        expect(mockVideoElement.currentTime).toBe(25)
      })

      it('does nothing when disabled', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        manager.findVideoElement()

        manager.startLoopCheck({ enabled: false, startTime: 10, endTime: 30 })
        mockVideoElement.currentTime = 35

        triggerIntervalCallback(1)

        expect(mockVideoElement.currentTime).toBe(35)
      })

      it('does nothing when video element is missing', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        // do not call findVideoElement

        manager.startLoopCheck({ enabled: true, startTime: 10, endTime: 30 })

        expect(() => triggerIntervalCallback(1)).not.toThrow()
      })
    })

    describe('default value handling', () => {
      it('uses 0 when start time is null', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        manager.findVideoElement()

        manager.startLoopCheck({ enabled: true, startTime: null, endTime: 30 })
        mockVideoElement.currentTime = 30

        triggerIntervalCallback(1)

        expect(mockVideoElement.currentTime).toBe(0)
      })

      it('uses video duration when end time is null', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        manager.findVideoElement()
        mockVideoElement.duration = 60

        manager.startLoopCheck({ enabled: true, startTime: 50, endTime: null })
        mockVideoElement.currentTime = 60

        triggerIntervalCallback(1)

        expect(mockVideoElement.currentTime).toBe(50)
      })
    })

    describe('invalid range handling', () => {
      it('does nothing when end time is 0', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        manager.findVideoElement()

        manager.startLoopCheck({ enabled: true, startTime: 0, endTime: 0 })
        mockVideoElement.currentTime = 10

        triggerIntervalCallback(1)

        expect(mockVideoElement.currentTime).toBe(10)
      })

      it('does nothing when end time is less than or equal to start time', () => {
        const manager = createVideoLoopManager(
          mockVideoService,
          mockTimerService,
        )
        manager.findVideoElement()

        manager.startLoopCheck({ enabled: true, startTime: 30, endTime: 20 })
        mockVideoElement.currentTime = 25

        triggerIntervalCallback(1)

        expect(mockVideoElement.currentTime).toBe(25)
      })
    })
  })

  describe('stopLoopCheck', () => {
    it('clears the interval', () => {
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)
      manager.findVideoElement()

      manager.startLoopCheck({ enabled: true, startTime: 10, endTime: 30 })
      manager.stopLoopCheck()

      expect(mockTimerService.clearInterval).toHaveBeenCalledWith(1)
    })

    it('does nothing when no interval exists', () => {
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)

      manager.stopLoopCheck()

      expect(mockTimerService.clearInterval).not.toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('cleans up resources', () => {
      const manager = createVideoLoopManager(mockVideoService, mockTimerService)
      manager.findVideoElement()
      manager.startLoopCheck({ enabled: true, startTime: 10, endTime: 30 })

      manager.cleanup()

      expect(mockTimerService.clearInterval).toHaveBeenCalledWith(1)
      // video element reference is also cleared (verified by getCurrentTime)
      expect(manager.getCurrentTime()).toBe(0)
    })
  })
})
