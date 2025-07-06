import type { ABRepeatState } from '../types'

const URL_PARAMS = {
  ENABLED: 'ab_repeat',
  START: 'ab_start',
  END: 'ab_end',
} as const

type URLParamKey = (typeof URL_PARAMS)[keyof typeof URL_PARAMS]

interface URLManager {
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
const defaultLocationService: LocationService = {
  getSearch: () => window.location.search,
  getHash: () => window.location.hash,
  getPathname: () => window.location.pathname,
  getHref: () => window.location.href,
  replaceState: (url: string) => window.history.replaceState(null, '', url),
}

export function createURLManager(
  locationService: LocationService = defaultLocationService,
): URLManager {
  function parseHashParams(hash: string): Map<URLParamKey, string> {
    const hashContent = hash.slice(1)
    const params = new Map<URLParamKey, string>()

    const abRepeatMatch = hashContent.match(
      new RegExp(`${URL_PARAMS.ENABLED}=([^&]*)`),
    )
    const abStartMatch = hashContent.match(
      new RegExp(`${URL_PARAMS.START}=([^&]*)`),
    )
    const abEndMatch = hashContent.match(
      new RegExp(`${URL_PARAMS.END}=([^&]*)`),
    )

    if (abRepeatMatch) params.set(URL_PARAMS.ENABLED, abRepeatMatch[1])
    if (abStartMatch) params.set(URL_PARAMS.START, abStartMatch[1])
    if (abEndMatch) params.set(URL_PARAMS.END, abEndMatch[1])

    return params
  }

  return {
    loadStateFromURL(): Partial<ABRepeatState> | null {
      // Load from hash params
      const hashParams = parseHashParams(locationService.getHash())
      const abRepeat = hashParams.get(URL_PARAMS.ENABLED)
      const abStart = hashParams.get(URL_PARAMS.START)
      const abEnd = hashParams.get(URL_PARAMS.END)

      if (abRepeat === '1') {
        return {
          enabled: true,
          startTime: abStart ? Number.parseInt(abStart, 10) : null,
          endTime: abEnd ? Number.parseInt(abEnd, 10) : null,
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
        abParams.set(URL_PARAMS.ENABLED, '1')
        if (state.startTime !== null) {
          // Store as integer seconds for cleaner URLs
          abParams.set(URL_PARAMS.START, Math.floor(state.startTime).toString())
        }
        if (state.endTime !== null) {
          // Store as integer seconds for cleaner URLs
          abParams.set(URL_PARAMS.END, Math.floor(state.endTime).toString())
        }
      }

      // Get current hash and remove any existing AB repeat params
      let currentHash = locationService.getHash().slice(1)
      currentHash = currentHash
        .replace(new RegExp(`${URL_PARAMS.ENABLED}=[^&]*`, 'g'), '')
        .replace(new RegExp(`${URL_PARAMS.START}=[^&]*`, 'g'), '')
        .replace(new RegExp(`${URL_PARAMS.END}=[^&]*`, 'g'), '')
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
