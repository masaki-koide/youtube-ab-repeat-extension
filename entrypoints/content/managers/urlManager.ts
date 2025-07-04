import type { ABRepeatState } from '../types'

export interface URLManager {
  loadStateFromURL(): Partial<ABRepeatState> | null
  updateURL(
    state: ABRepeatState,
    flags: { isInitialLoad: boolean; setupInProgress: boolean },
  ): void
}

export interface LocationService {
  getSearch(): string
  getHash(): string
  getPathname(): string
  getHref(): string
  replaceState(url: string): void
}

// デフォルトの実装（ブラウザ環境用）
export const defaultLocationService: LocationService = {
  getSearch: () => window.location.search,
  getHash: () => window.location.hash,
  getPathname: () => window.location.pathname,
  getHref: () => window.location.href,
  replaceState: (url: string) => window.history.replaceState(null, '', url),
}

export function createURLManager(
  locationService: LocationService = defaultLocationService,
): URLManager {
  function parseHashParams(hash: string): URLSearchParams {
    const hashContent = hash.slice(1)
    const params = new URLSearchParams()

    const abRepeatMatch = hashContent.match(/ab_repeat=([^&]*)/)
    const abStartMatch = hashContent.match(/ab_start=([^&]*)/)
    const abEndMatch = hashContent.match(/ab_end=([^&]*)/)

    if (abRepeatMatch) params.set('ab_repeat', abRepeatMatch[1])
    if (abStartMatch) params.set('ab_start', abStartMatch[1])
    if (abEndMatch) params.set('ab_end', abEndMatch[1])

    return params
  }

  return {
    loadStateFromURL(): Partial<ABRepeatState> | null {
      // First try to load from query params (for backward compatibility)
      const urlParams = new URLSearchParams(locationService.getSearch())
      let abRepeat = urlParams.get('ab_repeat')
      let abStart = urlParams.get('ab_start')
      let abEnd = urlParams.get('ab_end')

      // If not found in query params, try hash
      if (!abRepeat) {
        const hashParams = parseHashParams(locationService.getHash())
        abRepeat = hashParams.get('ab_repeat')
        abStart = hashParams.get('ab_start')
        abEnd = hashParams.get('ab_end')
      }

      if (abRepeat === '1') {
        return {
          enabled: true,
          startTime: abStart ? Number.parseFloat(abStart) : null,
          endTime: abEnd ? Number.parseFloat(abEnd) : null,
        }
      }

      return null
    },

    updateURL(
      state: ABRepeatState,
      flags: { isInitialLoad: boolean; setupInProgress: boolean },
    ): void {
      // Don't update URL if we're in initial load or setup
      if (flags.isInitialLoad || flags.setupInProgress) return

      // Build AB repeat parameters
      const abParams = new URLSearchParams()

      if (state.enabled) {
        abParams.set('ab_repeat', '1')
        if (state.startTime !== null) {
          abParams.set('ab_start', Math.floor(state.startTime).toString())
        }
        if (state.endTime !== null) {
          abParams.set('ab_end', Math.floor(state.endTime).toString())
        }
      }

      // Get current hash and remove any existing AB repeat params
      let currentHash = locationService.getHash().slice(1)
      currentHash = currentHash
        .replace(/ab_repeat=[^&]*/g, '')
        .replace(/ab_start=[^&]*/g, '')
        .replace(/ab_end=[^&]*/g, '')
      currentHash = currentHash.replace(/&+/g, '&').replace(/^&|&$/g, '')

      // Build new hash
      const abParamsString = abParams.toString()
      let newHash = ''

      if (currentHash && abParamsString) {
        newHash = `${currentHash}&${abParamsString}`
      } else if (currentHash) {
        newHash = currentHash
      } else if (abParamsString) {
        newHash = abParamsString
      }

      const newURL = `${locationService.getPathname()}${locationService.getSearch()}${newHash ? `#${newHash}` : ''}`

      if (locationService.getHref() !== newURL) {
        locationService.replaceState(newURL)
      }
    },
  }
}
