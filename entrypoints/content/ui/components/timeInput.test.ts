/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTimeInput } from './timeInput'

describe('TimeInput scroll functionality', () => {
  // Mock for DOM environment
  beforeEach(() => {
    document.body.innerHTML = ''
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('wheel event handling', () => {
    it('should decrease time when scrolling up', () => {
      const onChange = vi.fn()
      const mockGetVideoDuration = vi.fn(() => 120) // 2 minutes max
      const timeInput = createTimeInput({
        label: 'A',
        value: 30, // 00:00:30
        onChange,
        onDoubleClick: () => 0,
        getVideoDuration: mockGetVideoDuration,
      })

      const input = timeInput.querySelector('input')
      expect(input).toBeTruthy()
      if (!input) return

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100, // negative is scroll up
        bubbles: true,
      })

      input.dispatchEvent(wheelEvent)

      expect(onChange).toHaveBeenCalledWith(29)
    })

    it('should increase time when scrolling down', () => {
      const onChange = vi.fn()
      const mockGetVideoDuration = vi.fn(() => 120)
      const timeInput = createTimeInput({
        label: 'A',
        value: 30, // 00:00:30
        onChange,
        onDoubleClick: () => 0,
        getVideoDuration: mockGetVideoDuration,
      })

      const input = timeInput.querySelector('input')
      expect(input).toBeTruthy()
      if (!input) return

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // positive is scroll down
        bubbles: true,
      })

      input.dispatchEvent(wheelEvent)

      expect(onChange).toHaveBeenCalledWith(31)
    })

    it('should not go below 0', () => {
      const onChange = vi.fn()
      const mockGetVideoDuration = vi.fn(() => 120)
      const timeInput = createTimeInput({
        label: 'A',
        value: 0,
        onChange,
        onDoubleClick: () => 0,
        getVideoDuration: mockGetVideoDuration,
      })

      const input = timeInput.querySelector('input')
      expect(input).toBeTruthy()
      if (!input) return

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100, // scroll up
        bubbles: true,
      })

      input.dispatchEvent(wheelEvent)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should not exceed video duration', () => {
      const onChange = vi.fn()
      const mockGetVideoDuration = vi.fn(() => 120)
      const timeInput = createTimeInput({
        label: 'A',
        value: 120, // at max
        onChange,
        onDoubleClick: () => 0,
        getVideoDuration: mockGetVideoDuration,
      })

      const input = timeInput.querySelector('input')
      expect(input).toBeTruthy()
      if (!input) return

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // scroll down
        bubbles: true,
      })

      input.dispatchEvent(wheelEvent)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should handle null value by treating it as 0', () => {
      const onChange = vi.fn()
      const mockGetVideoDuration = vi.fn(() => 120)
      const timeInput = createTimeInput({
        label: 'A',
        value: null,
        onChange,
        onDoubleClick: () => 0,
        getVideoDuration: mockGetVideoDuration,
      })

      const input = timeInput.querySelector('input')
      expect(input).toBeTruthy()
      if (!input) return

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // scroll down
        bubbles: true,
      })

      input.dispatchEvent(wheelEvent)

      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('should increment/decrement by larger steps with shift key', () => {
      const onChange = vi.fn()
      const mockGetVideoDuration = vi.fn(() => 120)
      const timeInput = createTimeInput({
        label: 'A',
        value: 30,
        onChange,
        onDoubleClick: () => 0,
        getVideoDuration: mockGetVideoDuration,
      })

      const input = timeInput.querySelector('input')
      expect(input).toBeTruthy()
      if (!input) return

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // scroll down
        shiftKey: true,
        bubbles: true,
      })

      input.dispatchEvent(wheelEvent)

      expect(onChange).toHaveBeenCalledWith(40) // +10 with shift
    })

    it('should increment/decrement by minute steps with ctrl key', () => {
      const onChange = vi.fn()
      const mockGetVideoDuration = vi.fn(() => 300)
      const timeInput = createTimeInput({
        label: 'A',
        value: 30,
        onChange,
        onDoubleClick: () => 0,
        getVideoDuration: mockGetVideoDuration,
      })

      const input = timeInput.querySelector('input')
      expect(input).toBeTruthy()
      if (!input) return

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // scroll down
        ctrlKey: true,
        bubbles: true,
      })

      input.dispatchEvent(wheelEvent)

      expect(onChange).toHaveBeenCalledWith(90) // +60 seconds with ctrl
    })

    it('should prevent default scroll behavior', () => {
      const onChange = vi.fn()
      const mockGetVideoDuration = vi.fn(() => 120)
      const timeInput = createTimeInput({
        label: 'A',
        value: 30,
        onChange,
        onDoubleClick: () => 0,
        getVideoDuration: mockGetVideoDuration,
      })

      const input = timeInput.querySelector('input')
      expect(input).toBeTruthy()
      if (!input) return

      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        bubbles: true,
      })

      const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault')
      input.dispatchEvent(wheelEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })
})
