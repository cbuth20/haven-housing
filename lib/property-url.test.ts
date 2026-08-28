import { describe, it, expect } from 'vitest'
import { getPropertyPath, getPropertyUrl } from './property-url'

describe('property-url', () => {
  it('builds the path from the id', () => {
    expect(getPropertyPath('abc')).toBe('/properties/abc')
  })

  it('prefixes the origin', () => {
    expect(getPropertyUrl('abc', 'https://havenhousingsolutions.com')).toBe(
      'https://havenhousingsolutions.com/properties/abc'
    )
  })
})
