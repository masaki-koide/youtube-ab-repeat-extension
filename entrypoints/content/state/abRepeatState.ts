import type { ABRepeatState, StateManager, StateUpdateCallback } from '../types'

export function createStateManager(): StateManager {
  let state: ABRepeatState = {
    enabled: false,
    startTime: null,
    endTime: null,
  }

  const callbacks: Set<StateUpdateCallback> = new Set()

  function notifySubscribers(): void {
    callbacks.forEach((callback) => callback())
  }

  return {
    getState(): ABRepeatState {
      return { ...state }
    },

    setState(updates: Partial<ABRepeatState>): void {
      state = { ...state, ...updates }
      notifySubscribers()
    },

    toggleRepeat(): void {
      this.setState({ enabled: !state.enabled })
    },

    setStartTime(time: number | null): void {
      this.setState({ startTime: time })
    },

    setEndTime(time: number | null): void {
      this.setState({ endTime: time })
    },

    subscribe(callback: StateUpdateCallback): void {
      callbacks.add(callback)
    },

    unsubscribe(callback: StateUpdateCallback): void {
      callbacks.delete(callback)
    },
  }
}
