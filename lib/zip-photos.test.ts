import { describe, it, expect } from 'vitest'
import { normalizeFolderKey, summarizeMatches, type PhotoArchive } from './zip-photos'

// Build a fake archive without unzipping anything — summarizeMatches only reads
// folder presence and entry counts, so dummy entries suffice.
function fakeArchive(folders: Record<string, number>): PhotoArchive {
  const map = new Map<string, { name: string; entry: any }[]>()
  let totalImages = 0
  for (const [key, count] of Object.entries(folders)) {
    map.set(
      key,
      Array.from({ length: count }, (_, i) => ({ name: `${i}.jpg`, entry: {} }))
    )
    totalImages += count
  }
  return { fileName: 'x.zip', folders: map, totalImages, skippedCount: 0, skippedExtensions: [] }
}

describe('normalizeFolderKey', () => {
  it('lowercases, trims, and collapses internal whitespace', () => {
    expect(normalizeFolderKey('  123   Main  St ')).toBe('123 main st')
    expect(normalizeFolderKey('88 OAK AVE')).toBe('88 oak ave')
  })
})

describe('summarizeMatches', () => {
  const archive = fakeArchive({ '123 main st': 3, '88 oak ave': 5 })

  it('matches case- and whitespace-insensitively and counts images', () => {
    const s = summarizeMatches(['123 Main St', '88  oak ave'], archive)
    expect(s.matchedRows).toBe(2)
    expect(s.matchedImages).toBe(8)
    expect(s.unmatchedRows).toHaveLength(0)
    expect(s.unusedFolders).toHaveLength(0)
  })

  it('reports unmatched rows and unused folders', () => {
    const s = summarizeMatches(['123 Main St', '999 Nowhere Rd'], archive)
    expect(s.matchedRows).toBe(1)
    expect(s.unmatchedRows).toEqual(['999 Nowhere Rd'])
    expect(s.unusedFolders).toEqual(['88 oak ave'])
  })

  it('ignores blank photo_folder values', () => {
    const s = summarizeMatches(['', '   ', '123 Main St'], archive)
    expect(s.matchedRows).toBe(1)
    expect(s.unmatchedRows).toHaveLength(0)
  })
})
