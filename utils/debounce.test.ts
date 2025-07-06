import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should delay function execution', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 300)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(299)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous calls when called multiple times', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 300)

    debouncedFn('first')
    vi.advanceTimersByTime(100)
    debouncedFn('second')
    vi.advanceTimersByTime(100)
    debouncedFn('third')

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('third')
  })

  it('should preserve arguments', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 300)

    debouncedFn(1, 'test', { key: 'value' })
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledWith(1, 'test', { key: 'value' })
  })

  it('should handle multiple independent debounced functions', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const debouncedFn1 = debounce(fn1, 300)
    const debouncedFn2 = debounce(fn2, 400)

    debouncedFn1()
    debouncedFn2()

    vi.advanceTimersByTime(300)
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('should cancel pending execution when cancel is called', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 300)

    debouncedFn('test')
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()

    debouncedFn.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })

  it('should handle cancel when no pending execution', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 300)

    // Call cancel without any pending execution
    expect(() => debouncedFn.cancel()).not.toThrow()
    expect(fn).not.toHaveBeenCalled()
  })

  it('should work normally after cancel', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 300)

    // First call and cancel
    debouncedFn('first')
    vi.advanceTimersByTime(100)
    debouncedFn.cancel()

    // Verify first call was cancelled
    vi.advanceTimersByTime(300)
    expect(fn).not.toHaveBeenCalled()

    // Second call after cancel should work normally
    debouncedFn('second')
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('second')
  })
})
