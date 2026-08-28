import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAllProperties } from './fetch-all-properties'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'tok' } } }),
    },
  },
}))

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response
}

const row = (id: string) => ({ id })

describe('fetchAllProperties', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  it('pages with increasing offsets until count is reached', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ properties: [row('1'), row('2')], count: 5 }))
      .mockResolvedValueOnce(jsonResponse({ properties: [row('3'), row('4')], count: 5 }))
      .mockResolvedValueOnce(jsonResponse({ properties: [row('5')], count: 5 }))

    const result = await fetchAllProperties({ status: 'all' }, { pageSize: 2 })

    expect(result.properties.map((p) => p.id)).toEqual(['1', '2', '3', '4', '5'])
    expect(result.expectedCount).toBe(5)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    const offsets = fetchMock.mock.calls.map((c) => JSON.parse(c[1].body).offset)
    expect(offsets).toEqual([0, 2, 4])
  })

  it('sends filters, limit and bearer token', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ properties: [row('1')], count: 1 }))

    await fetchAllProperties({ search: 'loft', status: 'draft', sortBy: 'title', sortDirection: 'asc' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/.netlify/functions/properties-search')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(JSON.parse(init.body)).toMatchObject({
      search: 'loft', status: 'draft', sortBy: 'title', sortDirection: 'asc', limit: 500, offset: 0,
    })
  })

  it('dedupes rows that appear on more than one page', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ properties: [row('1'), row('2')], count: 3 }))
      .mockResolvedValueOnce(jsonResponse({ properties: [row('2'), row('3')], count: 3 }))

    const result = await fetchAllProperties({}, { pageSize: 2 })
    expect(result.properties.map((p) => p.id)).toEqual(['1', '2', '3'])
  })

  it('stops on an empty page even if count is not reached', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ properties: [row('1')], count: 10 }))
      .mockResolvedValueOnce(jsonResponse({ properties: [], count: 10 }))

    const result = await fetchAllProperties({}, { pageSize: 1 })
    expect(result.properties).toHaveLength(1)
    expect(result.expectedCount).toBe(10)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('throws on a non-OK response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500))
    await expect(fetchAllProperties({})).rejects.toThrow('HTTP 500')
  })
})
