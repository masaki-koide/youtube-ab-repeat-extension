import { describe, expect, it, vi } from 'vitest'
import { createStateManager } from './abRepeatState'

describe('StateManager', () => {
  describe('initial state', () => {
    it('initial state is disabled with unset times', () => {
      const stateManager = createStateManager()
      const state = stateManager.getState()

      expect(state.enabled).toBe(false)
      expect(state.startTime).toBe(null)
      expect(state.endTime).toBe(null)
    })
  })

  describe('state updates', () => {
    it('can partially update state with setState', () => {
      const stateManager = createStateManager()

      stateManager.setState({ enabled: true })
      expect(stateManager.getState()).toEqual({
        enabled: true,
        startTime: null,
        endTime: null,
      })

      stateManager.setState({ startTime: 30 })
      expect(stateManager.getState()).toEqual({
        enabled: true,
        startTime: 30,
        endTime: null,
      })
    })

    it('can update multiple values simultaneously', () => {
      const stateManager = createStateManager()

      stateManager.setState({
        enabled: true,
        startTime: 10,
        endTime: 20,
      })

      expect(stateManager.getState()).toEqual({
        enabled: true,
        startTime: 10,
        endTime: 20,
      })
    })

    it('getState returns a copy of the state', () => {
      const stateManager = createStateManager()

      const state1 = stateManager.getState()
      const state2 = stateManager.getState()

      expect(state1).not.toBe(state2)
      expect(state1).toEqual(state2)
    })
  })

  describe('convenience methods', () => {
    it('toggleRepeat toggles enabled state', () => {
      const stateManager = createStateManager()

      expect(stateManager.getState().enabled).toBe(false)

      stateManager.toggleRepeat()
      expect(stateManager.getState().enabled).toBe(true)

      stateManager.toggleRepeat()
      expect(stateManager.getState().enabled).toBe(false)
    })

    it('setStartTime sets the start time', () => {
      const stateManager = createStateManager()

      stateManager.setStartTime(45)
      expect(stateManager.getState().startTime).toBe(45)

      stateManager.setStartTime(null)
      expect(stateManager.getState().startTime).toBe(null)
    })

    it('setEndTime sets the end time', () => {
      const stateManager = createStateManager()

      stateManager.setEndTime(90)
      expect(stateManager.getState().endTime).toBe(90)

      stateManager.setEndTime(null)
      expect(stateManager.getState().endTime).toBe(null)
    })
  })

  describe('subscription functionality', () => {
    it('notifies subscribers on state change', () => {
      const stateManager = createStateManager()
      const callback = vi.fn()

      stateManager.subscribe(callback)

      // setState
      stateManager.setState({ enabled: true })
      expect(callback).toHaveBeenCalledTimes(1)

      // toggleRepeat
      stateManager.toggleRepeat()
      expect(callback).toHaveBeenCalledTimes(2)

      // setStartTime
      stateManager.setStartTime(30)
      expect(callback).toHaveBeenCalledTimes(3)

      // setEndTime
      stateManager.setEndTime(60)
      expect(callback).toHaveBeenCalledTimes(4)
    })

    it('notifies multiple subscribers', () => {
      const stateManager = createStateManager()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      stateManager.subscribe(callback1)
      stateManager.subscribe(callback2)

      stateManager.setState({ enabled: true })

      expect(callback1).toHaveBeenCalledOnce()
      expect(callback2).toHaveBeenCalledOnce()
    })

    it('does not notify after unsubscribing', () => {
      const stateManager = createStateManager()
      const callback = vi.fn()

      stateManager.subscribe(callback)
      stateManager.setState({ enabled: true })
      expect(callback).toHaveBeenCalledTimes(1)

      stateManager.unsubscribe(callback)
      stateManager.setState({ enabled: false })
      expect(callback).toHaveBeenCalledTimes(1) // does not increase
    })

    it('notifies only once even if the same callback is subscribed multiple times', () => {
      const stateManager = createStateManager()
      const callback = vi.fn()

      stateManager.subscribe(callback)
      stateManager.subscribe(callback) // duplicate subscription

      stateManager.setState({ enabled: true })

      expect(callback).toHaveBeenCalledOnce()
    })
  })
})
