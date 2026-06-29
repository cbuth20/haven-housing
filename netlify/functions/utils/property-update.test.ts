import { describe, it, expect } from 'vitest'
import { buildPropertyUpdate, PROTECTED_ON_UPDATE } from './property-update'

describe('buildPropertyUpdate', () => {
  it('never writes status or featured — a refresh must not unpublish/un-feature a live listing', () => {
    const provided = { status: 'draft', featured: false, monthly_rent: 2000 }
    const parsed = { status: 'draft', featured: false, monthly_rent: 2000 }
    const out = buildPropertyUpdate(provided, parsed)
    expect('status' in out).toBe(false)
    expect('featured' in out).toBe(false)
    expect(out.monthly_rent).toBe(2000)
  })

  it('excludes schema-default fields the CSV did not provide (e.g. country)', () => {
    // country defaulted by the schema into parsed, but never in the CSV row
    const provided = { monthly_rent: 1800 }
    const parsed = { monthly_rent: 1800, country: 'USA' }
    const out = buildPropertyUpdate(provided, parsed)
    expect('country' in out).toBe(false)
    expect(out.monthly_rent).toBe(1800)
  })

  it('skips blank (null/undefined) cells so an empty column never wipes existing data', () => {
    const provided = { description: null, beds: undefined, monthly_rent: 2500 }
    const parsed = { description: null, beds: undefined, monthly_rent: 2500 }
    const out = buildPropertyUpdate(provided, parsed)
    expect('description' in out).toBe(false)
    expect('beds' in out).toBe(false)
    expect(out.monthly_rent).toBe(2500)
  })

  it('writes re-hosted photo fields on update', () => {
    const provided = {
      cover_photo_url: 'https://x.supabase.co/a.jpg',
      media_gallery_urls: ['https://x.supabase.co/a.jpg', 'https://x.supabase.co/b.jpg'],
    }
    const out = buildPropertyUpdate(provided, { ...provided })
    expect(out.cover_photo_url).toBe('https://x.supabase.co/a.jpg')
    expect(out.media_gallery_urls).toHaveLength(2)
  })

  it('protects ownership fields but writes other provided data', () => {
    const provided = { created_by: 'x', owner_id: 'y', title: 'Updated Title' }
    const out = buildPropertyUpdate(provided, { ...provided })
    expect('created_by' in out).toBe(false)
    expect('owner_id' in out).toBe(false)
    expect(out.title).toBe('Updated Title')
  })

  it('returns an empty object when only protected/blank fields are supplied', () => {
    const provided = { status: 'draft', featured: false, description: null }
    const out = buildPropertyUpdate(provided, { ...provided })
    expect(Object.keys(out)).toHaveLength(0)
  })

  it('PROTECTED_ON_UPDATE covers the publish/ownership fields', () => {
    for (const f of ['status', 'featured', 'created_by', 'owner_id']) {
      expect(PROTECTED_ON_UPDATE.has(f)).toBe(true)
    }
  })
})
