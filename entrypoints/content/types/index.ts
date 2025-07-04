export interface ABRepeatState {
  enabled: boolean
  startTime: number | null
  endTime: number | null
}

export type StateUpdateCallback = () => void

export interface StateManager {
  getState(): ABRepeatState
  setState(updates: Partial<ABRepeatState>): void
  toggleRepeat(): void
  setStartTime(time: number | null): void
  setEndTime(time: number | null): void
  subscribe(callback: StateUpdateCallback): void
  unsubscribe(callback: StateUpdateCallback): void
}
