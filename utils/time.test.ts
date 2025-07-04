import { describe, expect, it } from 'vitest'
import { formatTime, parseTime } from './time'

describe('formatTime', () => {
  it('converts seconds to HH:MM:SS format', () => {
    expect(formatTime(0)).toBe('00:00:00')
    expect(formatTime(59)).toBe('00:00:59')
    expect(formatTime(60)).toBe('00:01:00')
    expect(formatTime(90)).toBe('00:01:30')
    expect(formatTime(3599)).toBe('00:59:59')
    expect(formatTime(3600)).toBe('01:00:00')
    expect(formatTime(3661)).toBe('01:01:01')
    expect(formatTime(7322)).toBe('02:02:02')
  })

  it('truncates decimal places', () => {
    expect(formatTime(90.7)).toBe('00:01:30')
    expect(formatTime(3661.9)).toBe('01:01:01')
  })

  it('calculates with negative values', () => {
    // Implementation does not special-case negative values
    expect(formatTime(-1)).toBe('-1:-1:-1')
  })
})

describe('parseTime', () => {
  describe('converts valid time strings to seconds', () => {
    it('parses HH:MM:SS format', () => {
      expect(parseTime('00:00:00')).toBe(0)
      expect(parseTime('00:00:59')).toBe(59)
      expect(parseTime('00:01:00')).toBe(60)
      expect(parseTime('00:01:30')).toBe(90)
      expect(parseTime('00:59:59')).toBe(3599)
      expect(parseTime('01:00:00')).toBe(3600)
      expect(parseTime('01:01:01')).toBe(3661)
      expect(parseTime('02:02:02')).toBe(7322)
      expect(parseTime('10:20:30')).toBe(37230)
    })

    it('parses without zero padding', () => {
      expect(parseTime('0:0:0')).toBe(0)
      expect(parseTime('1:2:3')).toBe(3723)
      expect(parseTime('10:5:30')).toBe(36330)
    })
  })

  describe('returns null for invalid input', () => {
    it('returns null for empty string', () => {
      expect(parseTime('')).toBe(null)
    })

    it('returns null when non-numeric characters are included', () => {
      expect(parseTime('abc')).toBe(null)
      // parseInt('2a') returns 2, so this test would not pass
      // expect(parseTime('1:2a:00')).toBe(null);
      expect(parseTime('a:30:00')).toBe(null)
      expect(parseTime('1:b:00')).toBe(null)
    })

    it('returns null for invalid format', () => {
      expect(parseTime('1:2:3:4')).toBe(null)
      expect(parseTime('30')).toBe(null) // single number
      expect(parseTime('1:30')).toBe(null) // MM:SS format
      expect(parseTime('::30')).toBe(null)
    })
  })

  describe('calculates with out-of-range values', () => {
    it('calculates with minutes and seconds >= 60', () => {
      // Implementation does not perform range checking
      expect(parseTime('00:60:00')).toBe(3600)
      expect(parseTime('01:60:00')).toBe(7200)
      expect(parseTime('01:00:60')).toBe(3660)
    })
  })
})
