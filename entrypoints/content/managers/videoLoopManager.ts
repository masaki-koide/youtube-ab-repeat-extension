import type { ABRepeatState } from '../types'

export interface VideoLoopManager {
  findVideoElement(): HTMLVideoElement | null
  startLoopCheck(state: ABRepeatState): void
  stopLoopCheck(): void
  getCurrentTime(): number
  cleanup(): void
}

export interface VideoService {
  querySelector(selector: string): HTMLVideoElement | null
}

export interface TimerService {
  setInterval(callback: () => void, delay: number): number
  clearInterval(id: number): void
}

// デフォルトの実装（ブラウザ環境用）
export const defaultVideoService: VideoService = {
  querySelector: (selector: string) =>
    document.querySelector(selector) as HTMLVideoElement | null,
}

export const defaultTimerService: TimerService = {
  setInterval: (callback: () => void, delay: number) =>
    window.setInterval(callback, delay),
  clearInterval: (id: number) => window.clearInterval(id),
}

export function createVideoLoopManager(
  videoService: VideoService = defaultVideoService,
  timerService: TimerService = defaultTimerService,
): VideoLoopManager {
  let videoElement: HTMLVideoElement | null = null
  let loopCheckInterval: number | null = null

  return {
    findVideoElement(): HTMLVideoElement | null {
      videoElement = videoService.querySelector('video')
      return videoElement
    },

    startLoopCheck(state: ABRepeatState): void {
      if (loopCheckInterval !== null) {
        timerService.clearInterval(loopCheckInterval)
      }

      loopCheckInterval = timerService.setInterval(() => {
        if (!videoElement || !state.enabled) {
          return
        }

        // Use default values if not set
        const startTime = state.startTime !== null ? state.startTime : 0
        const endTime =
          state.endTime !== null ? state.endTime : videoElement.duration

        // Skip if endTime is still not valid (e.g., video not loaded)
        if (!endTime || endTime <= startTime) {
          return
        }

        const currentTime = videoElement.currentTime
        // Check if we've reached or passed the end time
        if (currentTime >= endTime) {
          videoElement.currentTime = startTime
        }
      }, 100)
    },

    stopLoopCheck(): void {
      if (loopCheckInterval !== null) {
        timerService.clearInterval(loopCheckInterval)
        loopCheckInterval = null
      }
    },

    getCurrentTime(): number {
      return Math.floor(videoElement?.currentTime || 0)
    },

    cleanup(): void {
      this.stopLoopCheck()
      videoElement = null
    },
  }
}
