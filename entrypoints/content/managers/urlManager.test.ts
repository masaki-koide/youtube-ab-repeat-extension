import { describe, expect, it, vi } from 'vitest'
import { createURLManager, type LocationService } from './urlManager'

describe('URLManager', () => {
  function createMockLocationService(
    overrides: Partial<LocationService> = {},
  ): LocationService {
    return {
      getSearch: vi.fn(() => ''),
      getHash: vi.fn(() => ''),
      getPathname: vi.fn(() => '/watch'),
      getHref: vi.fn(() => 'https://www.youtube.com/watch'),
      replaceState: vi.fn(),
      ...overrides,
    }
  }

  describe('loadStateFromURL', () => {
    describe('loading from query parameters', () => {
      it('loads AB repeat enabled state', () => {
        const locationService = createMockLocationService({
          getSearch: () => '?v=abc123&ab_repeat=1&ab_start=10&ab_end=30',
        })
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toEqual({
          enabled: true,
          startTime: 10,
          endTime: 30,
        })
      })

      it('loads state with only start time set', () => {
        const locationService = createMockLocationService({
          getSearch: () => '?ab_repeat=1&ab_start=20',
        })
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toEqual({
          enabled: true,
          startTime: 20,
          endTime: null,
        })
      })

      it('loads state with only end time set', () => {
        const locationService = createMockLocationService({
          getSearch: () => '?ab_repeat=1&ab_end=40',
        })
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toEqual({
          enabled: true,
          startTime: null,
          endTime: 40,
        })
      })
    })

    describe('loading from hash parameters', () => {
      it('loads AB repeat state from hash', () => {
        const locationService = createMockLocationService({
          getHash: () => '#ab_repeat=1&ab_start=15&ab_end=45',
        })
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toEqual({
          enabled: true,
          startTime: 15,
          endTime: 45,
        })
      })

      it('loads correctly when mixed with other hash parameters', () => {
        const locationService = createMockLocationService({
          getHash: () => '#t=5&ab_repeat=1&ab_start=10&ab_end=20&foo=bar',
        })
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toEqual({
          enabled: true,
          startTime: 10,
          endTime: 20,
        })
      })
    })

    describe('priority', () => {
      it('query parameters take precedence', () => {
        const locationService = createMockLocationService({
          getSearch: () => '?ab_repeat=1&ab_start=5&ab_end=10',
          getHash: () => '#ab_repeat=1&ab_start=15&ab_end=25',
        })
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toEqual({
          enabled: true,
          startTime: 5,
          endTime: 10,
        })
      })
    })

    describe('invalid state', () => {
      it('returns null when ab_repeat is not 1', () => {
        const locationService = createMockLocationService({
          getSearch: () => '?ab_repeat=0&ab_start=10&ab_end=20',
        })
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toBe(null)
      })

      it('returns null when ab_repeat is missing', () => {
        const locationService = createMockLocationService({
          getSearch: () => '?ab_start=10&ab_end=20',
        })
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toBe(null)
      })

      it('returns null when no parameters exist', () => {
        const locationService = createMockLocationService()
        const urlManager = createURLManager(locationService)

        const state = urlManager.loadStateFromURL()

        expect(state).toBe(null)
      })
    })
  })

  describe('updateURL', () => {
    describe('URL updates', () => {
      it('reflects AB repeat enabled state in URL', () => {
        const locationService = createMockLocationService({
          getPathname: () => '/watch',
          getSearch: () => '?v=abc123',
          getHash: () => '',
          getHref: () => 'https://www.youtube.com/watch?v=abc123',
        })
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: true,
            startTime: 10,
            endTime: 30,
          },
          { isInitialLoad: false, setupInProgress: false },
        )

        expect(locationService.replaceState).toHaveBeenCalledWith(
          '/watch?v=abc123#ab_repeat=1&ab_start=10&ab_end=30',
        )
      })

      it('adds AB parameters while preserving existing hash', () => {
        const locationService = createMockLocationService({
          getPathname: () => '/watch',
          getSearch: () => '?v=abc123',
          getHash: () => '#t=5',
          getHref: () => 'https://www.youtube.com/watch?v=abc123#t=5',
        })
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: true,
            startTime: 20,
            endTime: 40,
          },
          { isInitialLoad: false, setupInProgress: false },
        )

        expect(locationService.replaceState).toHaveBeenCalledWith(
          '/watch?v=abc123#t=5&ab_repeat=1&ab_start=20&ab_end=40',
        )
      })

      it('replaces existing AB parameters', () => {
        const locationService = createMockLocationService({
          getPathname: () => '/watch',
          getSearch: () => '?v=abc123',
          getHash: () => '#ab_repeat=1&ab_start=5&ab_end=15',
          getHref: () =>
            'https://www.youtube.com/watch?v=abc123#ab_repeat=1&ab_start=5&ab_end=15',
        })
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: true,
            startTime: 25,
            endTime: 50,
          },
          { isInitialLoad: false, setupInProgress: false },
        )

        expect(locationService.replaceState).toHaveBeenCalledWith(
          '/watch?v=abc123#ab_repeat=1&ab_start=25&ab_end=50',
        )
      })

      it('removes AB parameters when disabled', () => {
        const locationService = createMockLocationService({
          getPathname: () => '/watch',
          getSearch: () => '?v=abc123',
          getHash: () => '#ab_repeat=1&ab_start=10&ab_end=30',
          getHref: () =>
            'https://www.youtube.com/watch?v=abc123#ab_repeat=1&ab_start=10&ab_end=30',
        })
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: false,
            startTime: 10,
            endTime: 30,
          },
          { isInitialLoad: false, setupInProgress: false },
        )

        expect(locationService.replaceState).toHaveBeenCalledWith(
          '/watch?v=abc123',
        )
      })

      it('converts time to integers', () => {
        const locationService = createMockLocationService({
          getPathname: () => '/watch',
          getSearch: () => '?v=abc123',
          getHash: () => '',
          getHref: () => 'https://www.youtube.com/watch?v=abc123',
        })
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: true,
            startTime: 10.7,
            endTime: 30.9,
          },
          { isInitialLoad: false, setupInProgress: false },
        )

        expect(locationService.replaceState).toHaveBeenCalledWith(
          '/watch?v=abc123#ab_repeat=1&ab_start=10&ab_end=30',
        )
      })

      it('does not include null times in URL', () => {
        const locationService = createMockLocationService({
          getPathname: () => '/watch',
          getSearch: () => '?v=abc123',
          getHash: () => '',
          getHref: () => 'https://www.youtube.com/watch?v=abc123',
        })
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: true,
            startTime: null,
            endTime: 40,
          },
          { isInitialLoad: false, setupInProgress: false },
        )

        expect(locationService.replaceState).toHaveBeenCalledWith(
          '/watch?v=abc123#ab_repeat=1&ab_end=40',
        )
      })
    })

    describe('flag-based control', () => {
      it('does not update when isInitialLoad is true', () => {
        const locationService = createMockLocationService()
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: true,
            startTime: 10,
            endTime: 30,
          },
          { isInitialLoad: true, setupInProgress: false },
        )

        expect(locationService.replaceState).not.toHaveBeenCalled()
      })

      it('does not update when setupInProgress is true', () => {
        const locationService = createMockLocationService()
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: true,
            startTime: 10,
            endTime: 30,
          },
          { isInitialLoad: false, setupInProgress: true },
        )

        expect(locationService.replaceState).not.toHaveBeenCalled()
      })
    })

    describe('when URL remains unchanged', () => {
      it('does not call replaceState when URL is the same', () => {
        const locationService = createMockLocationService({
          getPathname: () => '/watch',
          getSearch: () => '?v=abc123',
          getHash: () => '#ab_repeat=1&ab_start=10&ab_end=30',
          getHref: () => '/watch?v=abc123#ab_repeat=1&ab_start=10&ab_end=30',
        })
        const urlManager = createURLManager(locationService)

        urlManager.updateURL(
          {
            enabled: true,
            startTime: 10,
            endTime: 30,
          },
          { isInitialLoad: false, setupInProgress: false },
        )

        expect(locationService.replaceState).not.toHaveBeenCalled()
      })
    })
  })
})
