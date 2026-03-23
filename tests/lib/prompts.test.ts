import { describe, it, expect } from 'vitest'
import { getDailyPrompt, PROMPTS } from '@/lib/prompts'

describe('getDailyPrompt', () => {
  it('returns a string', () => {
    expect(typeof getDailyPrompt('2026-03-23')).toBe('string')
  })
  it('returns the same prompt for the same date', () => {
    expect(getDailyPrompt('2026-03-23')).toBe(getDailyPrompt('2026-03-23'))
  })
  it('returns different prompts for different dates (most of the time)', () => {
    const results = new Set(
      ['2026-03-23', '2026-03-24', '2026-03-25', '2026-03-26'].map(getDailyPrompt)
    )
    expect(results.size).toBeGreaterThan(1)
  })
  it('prompt list has at least 20 entries', () => {
    expect(PROMPTS.length).toBeGreaterThanOrEqual(20)
  })
})
