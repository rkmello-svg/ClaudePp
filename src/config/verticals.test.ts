import { describe, it, expect } from 'vitest'
import { getVertical, VERTICALS } from './verticals'
import { BusinessSegment } from '@/types'

describe('getVertical', () => {
  it('returns the matching vertical for a known segment', () => {
    const v = getVertical(BusinessSegment.PADARIA)
    expect(v.segment).toBe(BusinessSegment.PADARIA)
    expect(v.name).toBe('Padaria')
  })

  it('falls back to OUTROS for an unknown segment', () => {
    const v = getVertical('segmento-inexistente')
    expect(v.segment).toBe(BusinessSegment.OUTROS)
  })

  it('falls back to OUTROS when segment is undefined', () => {
    expect(getVertical(undefined).segment).toBe(BusinessSegment.OUTROS)
  })
})

describe('VERTICALS configuration', () => {
  it('every vertical defines exactly four KPIs', () => {
    for (const config of Object.values(VERTICALS)) {
      expect(config.kpis).toHaveLength(4)
    }
  })

  it('every vertical has at least one quick action', () => {
    for (const config of Object.values(VERTICALS)) {
      expect(config.quickActions.length).toBeGreaterThan(0)
    }
  })
})
