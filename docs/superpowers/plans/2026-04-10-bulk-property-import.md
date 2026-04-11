# Bulk Property Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-service CSV import wizard to the admin dashboard so the client can bulk-upload properties from spreadsheets.

**Architecture:** Three-step client-side wizard (Upload → Map Columns → Review & Import) backed by two new Netlify functions for duplicate validation and batch creation. CSV parsing and column mapping happen in the browser; only transformed property objects hit the server.

**Tech Stack:** Next.js 16, Papa Parse (new dependency), Zod validation, Netlify Functions, Supabase, Tailwind CSS, existing component library (Button, Modal, DataTable, LoadingSpinner).

**Spec:** `docs/superpowers/specs/2026-04-10-bulk-property-import-design.md`

---

## File Structure

### New files

| File | Responsibility |
|---|---|
| `lib/csv-import.ts` | Column alias dictionary, auto-mapper, data normalizers, client-side validation |
| `lib/csv-import.test.ts` | Tests for csv-import utilities |
| `vitest.config.ts` | Test runner configuration |
| `netlify/functions/properties-bulk-validate.ts` | Accepts transformed rows, checks for duplicates in DB, returns per-row status |
| `netlify/functions/properties-bulk-create.ts` | Accepts rows with actions (create/update/skip), batch inserts/updates |
| `components/import/UploadStep.tsx` | Drag-and-drop CSV file picker with Papa Parse |
| `components/import/MappingStep.tsx` | Column mapping UI with auto-detection and manual override |
| `components/import/ReviewStep.tsx` | Preview table with validation badges, duplicate resolution, row selection |
| `app/admin/properties/import/page.tsx` | Wizard page with step navigation, ties all steps together |

### Modified files

| File | Change |
|---|---|
| `package.json` | Add `papaparse`, `@types/papaparse`, `vitest` |
| `app/admin/properties/page.tsx` | Add "Import CSV" link/button in header |
| `hooks/useProperties.ts` | Add `bulkValidate` and `bulkCreate` functions |

---

## Task 1: Add Dependencies

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install papaparse for client-side CSV parsing**

```bash
npm install papaparse
npm install -D @types/papaparse vitest
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 3: Add test script to package.json**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify setup**

```bash
npx vitest run
```

Expected: "No test files found" (no error — just no tests yet).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add papaparse and vitest dependencies"
```

---

## Task 2: CSV Import Utility Library

**Files:**
- Create: `lib/csv-import.ts`
- Create: `lib/csv-import.test.ts`

This is the core logic: column alias matching, data normalization, and client-side validation. All pure functions, no React or DOM dependencies.

- [ ] **Step 1: Write failing tests for column auto-mapping**

Create `lib/csv-import.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { autoMapColumns, COLUMN_ALIASES } from './csv-import'

describe('autoMapColumns', () => {
  it('maps exact alias matches (case-insensitive)', () => {
    const headers = ['Street Address', 'City', 'State', 'Zip Code', 'Beds', 'Baths']
    const result = autoMapColumns(headers)
    expect(result).toEqual({
      'Street Address': 'street_address',
      'City': 'city',
      'State': 'state',
      'Zip Code': 'zip_code',
      'Beds': 'beds',
      'Baths': 'baths',
    })
  })

  it('maps aliases with different casing', () => {
    const headers = ['STREET ADDRESS', 'bedrooms', 'Sq Ft']
    const result = autoMapColumns(headers)
    expect(result).toEqual({
      'STREET ADDRESS': 'street_address',
      'bedrooms': 'beds',
      'Sq Ft': 'square_footage',
    })
  })

  it('maps trimmed headers', () => {
    const headers = ['  Street Address  ', ' City ']
    const result = autoMapColumns(headers)
    expect(result).toEqual({
      '  Street Address  ': 'street_address',
      ' City ': 'city',
    })
  })

  it('leaves unknown headers unmapped', () => {
    const headers = ['Street Address', 'Random Column', 'Notes']
    const result = autoMapColumns(headers)
    expect(result).toEqual({
      'Street Address': 'street_address',
    })
  })

  it('handles the Wix CSV header names', () => {
    const headers = [
      'Title', 'Landlord', 'Landlord Phone Number', 'Landlord Email',
      'Listing Link', 'Other Ammenities', 'Furnish Level', 'Pet Policy',
    ]
    const result = autoMapColumns(headers)
    expect(result).toEqual({
      'Title': 'title',
      'Landlord': 'landlord_name',
      'Landlord Phone Number': 'landlord_phone',
      'Landlord Email': 'landlord_email',
      'Listing Link': 'listing_link',
      'Other Ammenities': 'other_amenities',
      'Furnish Level': 'furnish_level',
      'Pet Policy': 'pet_policy',
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/csv-import.test.ts
```

Expected: FAIL — `Cannot find module './csv-import'`

- [ ] **Step 3: Implement column alias dictionary and autoMapColumns**

Create `lib/csv-import.ts`:

```ts
import { Property } from '@/types/property'

// --- Column Mapping ---

// Maps property field names to known CSV header aliases (all lowercase for matching)
export const COLUMN_ALIASES: Record<string, string[]> = {
  title: ['title', 'property name', 'name'],
  street_address: ['street address', 'address', 'property address'],
  city: ['city', 'city name'],
  state: ['state', 'state code'],
  zip_code: ['zip code', 'zipcode', 'postal code', 'zip'],
  description: ['description', 'property description'],
  square_footage: ['square footage', 'sq ft', 'sqft', 'square feet'],
  unit_type: ['unit type', 'property type', 'type'],
  beds: ['beds', 'bedrooms', 'bed count'],
  baths: ['baths', 'bathrooms', 'bath count'],
  monthly_rent: ['monthly rent', 'rent', 'price'],
  landlord_name: ['landlord', 'landlord name', 'owner name'],
  landlord_email: ['landlord email', 'owner email', 'email'],
  landlord_phone: ['landlord phone number', 'landlord phone', 'phone'],
  laundry: ['laundry', 'laundry type'],
  pet_policy: ['pet policy', 'pets', 'pet friendly'],
  parking: ['parking', 'parking type'],
  furnish_level: ['furnish level', 'furnished', 'furnishing'],
  other_amenities: ['other amenities', 'other ammenities', 'amenities'],
  listing_link: ['listing link', 'listing url', 'url'],
  cover_photo_url: ['cover photo', 'cover photo url', 'photo', 'photo url'],
  featured: ['featured'],
  latitude: ['latitude', 'lat'],
  longitude: ['longitude', 'lng', 'long'],
}

// Build a reverse lookup: lowercase alias → field name
const aliasToField: Map<string, string> = new Map()
for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
  for (const alias of aliases) {
    aliasToField.set(alias, field)
  }
}

/**
 * Auto-map CSV headers to property field names using the alias dictionary.
 * Returns a mapping of original header → property field name (only for matched headers).
 */
export function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  const usedFields = new Set<string>()

  for (const header of headers) {
    const normalized = header.trim().toLowerCase()
    const field = aliasToField.get(normalized)
    if (field && !usedFields.has(field)) {
      mapping[header] = field
      usedFields.add(field)
    }
  }

  return mapping
}

/**
 * Returns the list of property fields available for mapping.
 */
export function getPropertyFields(): { value: string; label: string }[] {
  return Object.keys(COLUMN_ALIASES).map((field) => ({
    value: field,
    label: field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/csv-import.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Write failing tests for data normalizers**

Append to `lib/csv-import.test.ts`:

```ts
import { normalizeValue } from './csv-import'

describe('normalizeValue', () => {
  it('strips array wrappers from single values', () => {
    expect(normalizeValue('["Single Family"]', 'unit_type')).toBe('Single Family')
    expect(normalizeValue('["Furnished"]', 'furnish_level')).toBe('Furnished')
  })

  it('passes through plain strings', () => {
    expect(normalizeValue('Single Family', 'unit_type')).toBe('Single Family')
  })

  it('parses square footage with units', () => {
    expect(normalizeValue('888 SF', 'square_footage')).toBe(888)
    expect(normalizeValue('1,590 sq ft', 'square_footage')).toBe(1590)
    expect(normalizeValue('2238 FS', 'square_footage')).toBe(2238)
    expect(normalizeValue('1200', 'square_footage')).toBe(1200)
  })

  it('parses numeric fields', () => {
    expect(normalizeValue('3', 'beds')).toBe(3)
    expect(normalizeValue('2.5', 'baths')).toBe(2.5)
    expect(normalizeValue('1500', 'monthly_rent')).toBe(1500)
  })

  it('returns null for empty values on optional fields', () => {
    expect(normalizeValue('', 'description')).toBeNull()
    expect(normalizeValue('  ', 'landlord_email')).toBeNull()
  })

  it('parses boolean-like values for featured', () => {
    expect(normalizeValue('true', 'featured')).toBe(true)
    expect(normalizeValue('false', 'featured')).toBe(false)
    expect(normalizeValue('yes', 'featured')).toBe(true)
    expect(normalizeValue('1', 'featured')).toBe(true)
    expect(normalizeValue('', 'featured')).toBe(false)
  })

  it('splits amenities into arrays', () => {
    expect(normalizeValue('Fenced Backyard, Outdoor Patio, Bathtub', 'other_amenities'))
      .toEqual(['Fenced Backyard', 'Outdoor Patio', 'Bathtub'])
  })

  it('trims email whitespace', () => {
    expect(normalizeValue('  sam@example.com  ', 'landlord_email')).toBe('sam@example.com')
  })

  it('returns null for invalid emails', () => {
    expect(normalizeValue('not-an-email', 'landlord_email')).toBeNull()
  })

  it('accepts valid listing URLs', () => {
    expect(normalizeValue('https://zillow.com/123', 'listing_link')).toBe('https://zillow.com/123')
  })

  it('returns null for non-URL listing links', () => {
    expect(normalizeValue('/some/path', 'listing_link')).toBeNull()
  })

  it('parses latitude and longitude', () => {
    expect(normalizeValue('38.6098', 'latitude')).toBe(38.6098)
    expect(normalizeValue('-90.498', 'longitude')).toBe(-90.498)
    expect(normalizeValue('', 'latitude')).toBeNull()
  })
})
```

- [ ] **Step 6: Run tests to verify they fail**

```bash
npx vitest run lib/csv-import.test.ts
```

Expected: New tests FAIL — `normalizeValue` not exported.

- [ ] **Step 7: Implement normalizeValue**

Append to `lib/csv-import.ts`:

```ts
// --- Data Normalization ---

const NUMERIC_FIELDS = new Set(['beds', 'baths', 'monthly_rent', 'latitude', 'longitude'])
const URL_FIELDS = new Set(['listing_link', 'cover_photo_url'])

/**
 * Normalize a raw CSV cell value for a given property field.
 * Handles array-unwrapping, type coercion, and format cleanup.
 */
export function normalizeValue(raw: string, field: string): any {
  const trimmed = raw.trim()

  // Empty → null for most fields, false for featured
  if (!trimmed) {
    if (field === 'featured') return false
    return null
  }

  // Square footage: strip units, parse number
  if (field === 'square_footage') {
    const match = trimmed.match(/(\d[\d,]*)\s*(?:sf|fs|sq|ft)?/i)
    if (match) {
      const num = parseInt(match[1].replace(/,/g, ''), 10)
      return isNaN(num) || num > 100000 ? null : num
    }
    return null
  }

  // Featured: boolean parsing
  if (field === 'featured') {
    const lower = trimmed.toLowerCase()
    return lower === 'true' || lower === 'yes' || lower === '1'
  }

  // Numeric fields
  if (NUMERIC_FIELDS.has(field)) {
    const num = Number(trimmed)
    return isNaN(num) ? null : num
  }

  // Other amenities: split comma-separated into array
  if (field === 'other_amenities') {
    // Try JSON array first
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.map((s: any) => String(s).trim()).filter(Boolean)
      } catch { /* fall through */ }
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
  }

  // Email validation
  if (field === 'landlord_email') {
    const cleaned = trimmed.replace(/[\s|]+/g, ' ').trim()
    return cleaned.includes('@') ? cleaned : null
  }

  // URL fields
  if (URL_FIELDS.has(field)) {
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : null
  }

  // Array-wrapped single values (Wix format): ["Value"] → "Value"
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed) && parsed.length > 0) return String(parsed[0])
    } catch { /* fall through */ }
  }

  return trimmed
}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
npx vitest run lib/csv-import.test.ts
```

Expected: All tests PASS.

- [ ] **Step 9: Write failing tests for transformRow and validateRow**

Append to `lib/csv-import.test.ts`:

```ts
import { transformRow, validateRow } from './csv-import'

describe('transformRow', () => {
  it('transforms a CSV row using the column mapping', () => {
    const row = { 'Street Address': '123 Main St', 'City': 'Springfield', 'State': 'MO', 'Zip Code': '65801', 'Beds': '3' }
    const mapping = {
      'Street Address': 'street_address',
      'City': 'city',
      'State': 'state',
      'Zip Code': 'zip_code',
      'Beds': 'beds',
    }
    const result = transformRow(row, mapping)
    expect(result).toEqual({
      street_address: '123 Main St',
      city: 'Springfield',
      state: 'MO',
      zip_code: '65801',
      beds: 3,
      status: 'draft',
      featured: false,
    })
  })

  it('auto-generates title from address when title is not mapped', () => {
    const row = { 'Address': '456 Oak Ave', 'City': 'Dallas', 'State': 'TX', 'ZIP': '75001' }
    const mapping = { 'Address': 'street_address', 'City': 'city', 'State': 'state', 'ZIP': 'zip_code' }
    const result = transformRow(row, mapping)
    expect(result.title).toBe('456 Oak Ave, Dallas, TX')
  })
})

describe('validateRow', () => {
  const validRow = {
    title: 'Test Property',
    street_address: '123 Main St',
    city: 'Springfield',
    state: 'MO',
    zip_code: '65801',
    status: 'draft' as const,
    featured: false,
  }

  it('returns valid for a complete row', () => {
    const result = validateRow(validRow)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('returns errors for missing required fields', () => {
    const result = validateRow({ ...validRow, street_address: '', city: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Street address is required')
    expect(result.errors).toContain('City is required')
  })

  it('returns errors for missing state and zip', () => {
    const result = validateRow({ ...validRow, state: '', zip_code: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('State is required')
    expect(result.errors).toContain('Zip code is required')
  })
})
```

- [ ] **Step 10: Run tests to verify they fail**

```bash
npx vitest run lib/csv-import.test.ts
```

Expected: FAIL — `transformRow` and `validateRow` not exported.

- [ ] **Step 11: Implement transformRow and validateRow**

Append to `lib/csv-import.ts`:

```ts
// --- Row Transformation ---

export interface TransformedRow {
  [key: string]: any
  title: string
  street_address: string
  city: string
  state: string
  zip_code: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
}

/**
 * Transform a raw CSV row into a property object using the column mapping.
 * Applies normalizeValue to each mapped field.
 */
export function transformRow(
  row: Record<string, string>,
  mapping: Record<string, string>
): TransformedRow {
  const result: Record<string, any> = {
    status: 'draft',
    featured: false,
  }

  for (const [csvHeader, propertyField] of Object.entries(mapping)) {
    const rawValue = row[csvHeader] ?? ''
    result[propertyField] = normalizeValue(rawValue, propertyField)
  }

  // Auto-generate title if not mapped or empty
  if (!result.title && result.street_address) {
    const parts = [result.street_address, result.city, result.state].filter(Boolean)
    result.title = parts.join(', ')
  }

  return result as TransformedRow
}

// --- Validation ---

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const REQUIRED_FIELDS: { field: string; label: string }[] = [
  { field: 'street_address', label: 'Street address' },
  { field: 'city', label: 'City' },
  { field: 'state', label: 'State' },
  { field: 'zip_code', label: 'Zip code' },
]

/**
 * Validate a transformed row. Checks required fields are present.
 */
export function validateRow(row: Record<string, any>): ValidationResult {
  const errors: string[] = []

  for (const { field, label } of REQUIRED_FIELDS) {
    if (!row[field] || (typeof row[field] === 'string' && !row[field].trim())) {
      errors.push(`${label} is required`)
    }
  }

  return { valid: errors.length === 0, errors }
}
```

- [ ] **Step 12: Run tests to verify they pass**

```bash
npx vitest run lib/csv-import.test.ts
```

Expected: All tests PASS.

- [ ] **Step 13: Commit**

```bash
git add lib/csv-import.ts lib/csv-import.test.ts
git commit -m "feat: add CSV import utility library with column mapping and normalizers"
```

---

## Task 3: Bulk Validate Netlify Function

**Files:**
- Create: `netlify/functions/properties-bulk-validate.ts`

This function accepts an array of transformed property objects, checks each against the database for duplicates, and returns per-row validation results.

- [ ] **Step 1: Create the bulk validate function**

Create `netlify/functions/properties-bulk-validate.ts`:

```ts
import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'

interface ValidateRequest {
  properties: Record<string, any>[]
}

interface DuplicateMatch {
  id: string
  title: string
  street_address: string
  city: string
  state: string
  zip_code: string
  status: string
  beds: number | null
  baths: number | null
  monthly_rent: number | null
  listing_link: string | null
}

interface RowValidationResult {
  index: number
  status: 'ready' | 'duplicate' | 'error'
  errors?: string[]
  match?: DuplicateMatch
}

// Normalize address for comparison
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .trim()
    .replace(/\bst\b\.?/g, 'street')
    .replace(/\bdr\b\.?/g, 'drive')
    .replace(/\bave\b\.?/g, 'avenue')
    .replace(/\bct\b\.?/g, 'court')
    .replace(/\bter\b\.?/g, 'terrace')
    .replace(/\bblvd\b\.?/g, 'boulevard')
    .replace(/\bln\b\.?/g, 'lane')
    .replace(/\brd\b\.?/g, 'road')
    .replace(/\bpl\b\.?/g, 'place')
    .replace(/\s+/g, ' ')
}

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { properties }: ValidateRequest = JSON.parse(event.body || '{}')

    if (!Array.isArray(properties) || properties.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Properties array is required' }) }
    }

    // Fetch all existing properties for duplicate checking
    // For hundreds of rows, it's more efficient to fetch all existing and compare in memory
    // than to query per-row
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('properties')
      .select('id, title, street_address, city, state, zip_code, status, beds, baths, monthly_rent, listing_link, wix_id')

    if (fetchError) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Failed to fetch existing properties', error: fetchError.message }) }
    }

    // Build lookup maps for duplicate detection
    const addressMap = new Map<string, DuplicateMatch>()
    const listingLinkMap = new Map<string, DuplicateMatch>()

    for (const prop of existing || []) {
      const normalizedAddr = normalizeAddress(prop.street_address)
      const zip = (prop.zip_code || '').trim().split('-')[0]
      const key = `${normalizedAddr}|${zip}`
      addressMap.set(key, prop)

      if (prop.listing_link) {
        listingLinkMap.set(prop.listing_link.trim().toLowerCase(), prop)
      }
    }

    // Validate each row
    const results: RowValidationResult[] = properties.map((row, index) => {
      // Check required fields
      const errors: string[] = []
      if (!row.street_address?.trim()) errors.push('Street address is required')
      if (!row.city?.trim()) errors.push('City is required')
      if (!row.state?.trim()) errors.push('State is required')
      if (!row.zip_code?.trim()) errors.push('Zip code is required')

      if (errors.length > 0) {
        return { index, status: 'error' as const, errors }
      }

      // Check for duplicates
      const normalizedAddr = normalizeAddress(row.street_address)
      const zip = (row.zip_code || '').trim().split('-')[0]
      const addrKey = `${normalizedAddr}|${zip}`

      const addrMatch = addressMap.get(addrKey)
      if (addrMatch) {
        return { index, status: 'duplicate' as const, match: addrMatch }
      }

      if (row.listing_link) {
        const linkMatch = listingLinkMap.get(row.listing_link.trim().toLowerCase())
        if (linkMatch) {
          return { index, status: 'duplicate' as const, match: linkMatch }
        }
      }

      return { index, status: 'ready' as const }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ results }),
    }
  } catch (error: any) {
    console.error('Bulk validate error:', error)
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) }
  }
})

export { handler }
```

- [ ] **Step 2: Verify the function compiles**

```bash
npx tsc --noEmit netlify/functions/properties-bulk-validate.ts 2>&1 || echo "Check for type errors"
```

If there are import path issues with `tsc`, this is OK — Netlify's bundler handles its own resolution. Just verify there are no syntax errors by reviewing the file.

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/properties-bulk-validate.ts
git commit -m "feat: add properties-bulk-validate Netlify function for duplicate detection"
```

---

## Task 4: Bulk Create Netlify Function

**Files:**
- Create: `netlify/functions/properties-bulk-create.ts`

Accepts rows with per-row actions (create, update, skip). Batch inserts new properties as drafts, batch updates where requested.

- [ ] **Step 1: Create the bulk create function**

Create `netlify/functions/properties-bulk-create.ts`:

```ts
import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import { PropertySchema } from './utils/validation'

interface ImportRow {
  action: 'create' | 'update' | 'skip'
  existingId?: string  // For updates — the ID of the existing property to overwrite
  data: Record<string, any>
}

interface BulkCreateRequest {
  rows: ImportRow[]
}

interface ImportSummary {
  created: number
  updated: number
  skipped: number
  errors: { index: number; message: string }[]
}

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) }
  }

  try {
    const { rows }: BulkCreateRequest = JSON.parse(event.body || '{}')

    if (!Array.isArray(rows) || rows.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Rows array is required' }) }
    }

    const summary: ImportSummary = { created: 0, updated: 0, skipped: 0, errors: [] }

    // Separate rows by action
    const toCreate: { index: number; data: Record<string, any> }[] = []
    const toUpdate: { index: number; id: string; data: Record<string, any> }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      if (row.action === 'skip') {
        summary.skipped++
        continue
      }

      // Validate with PropertySchema
      const parseResult = PropertySchema.safeParse(row.data)
      if (!parseResult.success) {
        summary.errors.push({
          index: i,
          message: parseResult.error.errors.map((e) => e.message).join(', '),
        })
        continue
      }

      if (row.action === 'create') {
        toCreate.push({ index: i, data: parseResult.data })
      } else if (row.action === 'update' && row.existingId) {
        toUpdate.push({ index: i, id: row.existingId, data: parseResult.data })
      }
    }

    // Batch insert new properties
    if (toCreate.length > 0) {
      const insertData = toCreate.map(({ data }) => ({
        ...data,
        status: 'draft',
        created_by: event.userId,
        owner_id: event.userId,
      }))

      const { data, error } = await supabaseAdmin
        .from('properties')
        .insert(insertData)
        .select('id')

      if (error) {
        // Fallback: insert one at a time to identify which rows failed
        for (const item of toCreate) {
          const { error: singleError } = await supabaseAdmin
            .from('properties')
            .insert({
              ...item.data,
              status: 'draft',
              created_by: event.userId,
              owner_id: event.userId,
            })

          if (singleError) {
            summary.errors.push({ index: item.index, message: singleError.message })
          } else {
            summary.created++
          }
        }
      } else {
        summary.created = toCreate.length
      }
    }

    // Update existing properties one at a time (each has a different ID)
    for (const item of toUpdate) {
      const { error } = await supabaseAdmin
        .from('properties')
        .update(item.data)
        .eq('id', item.id)

      if (error) {
        summary.errors.push({ index: item.index, message: error.message })
      } else {
        summary.updated++
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(summary),
    }
  } catch (error: any) {
    console.error('Bulk create error:', error)
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) }
  }
})

export { handler }
```

- [ ] **Step 2: Commit**

```bash
git add netlify/functions/properties-bulk-create.ts
git commit -m "feat: add properties-bulk-create Netlify function for batch import"
```

---

## Task 5: Add Bulk API Functions to useProperties Hook

**Files:**
- Modify: `hooks/useProperties.ts`

Add `bulkValidate` and `bulkCreate` functions following the exact same fetch/auth pattern as the existing `createProperty`.

- [ ] **Step 1: Add bulkValidate and bulkCreate to the hook**

In `hooks/useProperties.ts`, add these two functions inside the `useProperties` function, before the `return` statement. Also add them to the return object.

After the `deleteProperty` function (around line 143), add:

```ts
  const bulkValidate = async (properties: Partial<Property>[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/.netlify/functions/properties-bulk-validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ properties }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to validate properties'
        try {
          const text = await response.text()
          try {
            const error = JSON.parse(text)
            errorMessage = error.message || errorMessage
          } catch {
            errorMessage = text || errorMessage
          }
        } catch (readError) {
          console.error('Error reading response:', readError)
        }
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const bulkCreate = async (rows: { action: string; existingId?: string; data: Partial<Property> }[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/.netlify/functions/properties-bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rows }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to import properties'
        try {
          const text = await response.text()
          try {
            const error = JSON.parse(text)
            errorMessage = error.message || errorMessage
          } catch {
            errorMessage = text || errorMessage
          }
        } catch (readError) {
          console.error('Error reading response:', readError)
        }
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }
```

Update the return statement to include the new functions:

```ts
  return {
    isLoading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    bulkValidate,
    bulkCreate,
  }
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useProperties.ts
git commit -m "feat: add bulkValidate and bulkCreate to useProperties hook"
```

---

## Task 6: Upload Step Component

**Files:**
- Create: `components/import/UploadStep.tsx`

Drag-and-drop CSV file picker. Parses the CSV client-side with Papa Parse and passes headers + rows to the parent wizard.

- [ ] **Step 1: Create UploadStep component**

Create `components/import/UploadStep.tsx`:

```tsx
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/common/Button'

interface UploadStepProps {
  onParsed: (headers: string[], rows: Record<string, string>[]) => void
}

export function UploadStep({ onParsed }: UploadStepProps) {
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [colCount, setColCount] = useState<number | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    setIsParsing(true)
    setFileName(file.name)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false)

        if (results.errors.length > 0 && results.data.length === 0) {
          setError(`Failed to parse CSV: ${results.errors[0].message}`)
          return
        }

        const headers = results.meta.fields || []
        if (headers.length === 0) {
          setError('No column headers found in the CSV file.')
          return
        }

        if (results.data.length === 0) {
          setError('CSV file has headers but no data rows.')
          return
        }

        setRowCount(results.data.length)
        setColCount(headers.length)
        setParsedData({ headers, rows: results.data })
      },
      error: (err) => {
        setIsParsing(false)
        setError(`Failed to read file: ${err.message}`)
      },
    })
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }
    handleFile(file)
  }, [handleFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  })

  const handleContinue = () => {
    if (parsedData) {
      onParsed(parsedData.headers, parsedData.rows)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-semibold text-navy">Upload CSV File</h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload a CSV file containing property data. The first row should be column headers.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-navy bg-navy/5'
            : error
              ? 'border-red-300 bg-red-50'
              : parsedData
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-navy hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {isParsing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-2 border-navy border-t-transparent rounded-full" />
            <p className="text-sm text-gray-600">Parsing CSV...</p>
          </div>
        ) : parsedData ? (
          <div className="flex flex-col items-center gap-2">
            <DocumentTextIcon className="h-10 w-10 text-green-600" />
            <p className="font-medium text-green-800">{fileName}</p>
            <p className="text-sm text-green-700">
              Found <span className="font-semibold">{rowCount?.toLocaleString()}</span> rows and{' '}
              <span className="font-semibold">{colCount}</span> columns
            </p>
            <p className="text-xs text-gray-500 mt-1">Drop a different file to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Drop the CSV file here' : 'Drag and drop a CSV file, or click to browse'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {parsedData && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleContinue}>
            Continue to Column Mapping
          </Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/import/UploadStep.tsx
git commit -m "feat: add UploadStep component for CSV file upload"
```

---

## Task 7: Column Mapping Step Component

**Files:**
- Create: `components/import/MappingStep.tsx`

Two-column layout showing CSV headers mapped to property fields. Auto-maps on mount, allows manual override via dropdowns.

- [ ] **Step 1: Create MappingStep component**

Create `components/import/MappingStep.tsx`:

```tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { autoMapColumns, getPropertyFields, COLUMN_ALIASES } from '@/lib/csv-import'
import { Button } from '@/components/common/Button'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface MappingStepProps {
  headers: string[]
  sampleRows: Record<string, string>[]  // First 3 rows for preview
  onMapped: (mapping: Record<string, string>) => void
  onBack: () => void
}

const REQUIRED_FIELDS = ['street_address', 'city', 'state', 'zip_code']
const SKIP_VALUE = '__skip__'

export function MappingStep({ headers, sampleRows, onMapped, onBack }: MappingStepProps) {
  const propertyFields = useMemo(() => getPropertyFields(), [])
  const [mapping, setMapping] = useState<Record<string, string>>(() => autoMapColumns(headers))

  // Track which property fields are already used
  const usedFields = useMemo(() => {
    return new Set(Object.values(mapping))
  }, [mapping])

  // Check if all required fields are mapped
  const missingRequired = useMemo(() => {
    const mappedFields = new Set(Object.values(mapping))
    return REQUIRED_FIELDS.filter((f) => !mappedFields.has(f))
  }, [mapping])

  const handleFieldChange = (header: string, value: string) => {
    setMapping((prev) => {
      const next = { ...prev }
      if (value === SKIP_VALUE || value === '') {
        delete next[header]
      } else {
        next[header] = value
      }
      return next
    })
  }

  const mappedCount = Object.keys(mapping).length
  const unmappedCount = headers.length - mappedCount

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-semibold text-navy">Map Columns</h2>
        <p className="text-sm text-gray-600 mt-1">
          Match your CSV columns to property fields.{' '}
          <span className="font-medium text-navy">{mappedCount}</span> mapped,{' '}
          <span className={unmappedCount > 0 ? 'text-yellow-600 font-medium' : 'text-gray-500'}>{unmappedCount} unmapped</span>.
        </p>
      </div>

      {missingRequired.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Required fields not mapped:</p>
            <p className="text-sm text-yellow-700">
              {missingRequired.map((f) => f.replace(/_/g, ' ')).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-1/4">CSV Column</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3 w-1/4">Maps To</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Sample Data (first 3 rows)</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((header) => {
              const mappedField = mapping[header]
              const isMapped = !!mappedField

              return (
                <tr key={header} className={`border-b last:border-0 ${isMapped ? '' : 'bg-yellow-50/50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isMapped ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">{header}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={mappedField || SKIP_VALUE}
                      onChange={(e) => handleFieldChange(header, e.target.value)}
                      className={`w-full text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy ${
                        isMapped ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <option value={SKIP_VALUE}>— Skip this column —</option>
                      {propertyFields.map(({ value, label }) => (
                        <option
                          key={value}
                          value={value}
                          disabled={usedFields.has(value) && mapping[header] !== value}
                        >
                          {label}{REQUIRED_FIELDS.includes(value) ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {sampleRows.slice(0, 3).map((row, i) => (
                        <span key={i} className="text-xs text-gray-500 truncate max-w-xs block">
                          {row[header] ? (row[header].length > 80 ? row[header].substring(0, 80) + '...' : row[header]) : '(empty)'}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => onMapped(mapping)}
          disabled={missingRequired.length > 0}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/import/MappingStep.tsx
git commit -m "feat: add MappingStep component for CSV column mapping"
```

---

## Task 8: Review Step Component

**Files:**
- Create: `components/import/ReviewStep.tsx`

Displays all transformed rows in a table with status badges. Handles duplicate resolution and row selection. Calls the bulk validate endpoint on mount to get duplicate status.

- [ ] **Step 1: Create ReviewStep component**

Create `components/import/ReviewStep.tsx`:

```tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { transformRow, validateRow } from '@/lib/csv-import'
import { useProperties } from '@/hooks/useProperties'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { Property } from '@/types/property'

type DuplicateAction = 'skip' | 'update' | 'create'

interface RowState {
  data: Record<string, any>
  clientValidation: { valid: boolean; errors: string[] }
  serverStatus: 'ready' | 'duplicate' | 'error' | 'pending'
  serverErrors?: string[]
  match?: { id: string; title: string; street_address: string; city: string; state: string; zip_code: string; status: string }
  duplicateAction: DuplicateAction
  selected: boolean
  expanded: boolean
}

interface ReviewStepProps {
  headers: string[]
  rows: Record<string, string>[]
  mapping: Record<string, string>
  onBack: () => void
  onImportComplete: (summary: { created: number; updated: number; skipped: number; errors: { index: number; message: string }[] }) => void
}

const BATCH_SIZE = 50

export function ReviewStep({ headers, rows, mapping, onBack, onImportComplete }: ReviewStepProps) {
  const { bulkValidate, bulkCreate, isLoading } = useProperties()
  const [rowStates, setRowStates] = useState<RowState[]>([])
  const [isValidating, setIsValidating] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Transform all rows and run client-side validation
  useEffect(() => {
    const transformed = rows.map((row) => {
      const data = transformRow(row, mapping)
      const validation = validateRow(data)
      return {
        data,
        clientValidation: validation,
        serverStatus: validation.valid ? ('pending' as const) : ('error' as const),
        serverErrors: validation.valid ? undefined : validation.errors,
        duplicateAction: 'skip' as DuplicateAction,
        selected: validation.valid,
        expanded: false,
      }
    })
    setRowStates(transformed)

    // Run server-side duplicate check for valid rows
    const validRows = transformed.filter((r) => r.clientValidation.valid).map((r) => r.data)
    if (validRows.length === 0) {
      setIsValidating(false)
      return
    }

    bulkValidate(validRows as Partial<Property>[])
      .then((response: { results: { index: number; status: string; errors?: string[]; match?: any }[] }) => {
        setRowStates((prev) => {
          const next = [...prev]
          let validIndex = 0
          for (let i = 0; i < next.length; i++) {
            if (!next[i].clientValidation.valid) continue
            const serverResult = response.results[validIndex]
            if (serverResult) {
              next[i] = {
                ...next[i],
                serverStatus: serverResult.status as any,
                serverErrors: serverResult.errors,
                match: serverResult.match,
                selected: serverResult.status === 'ready',
              }
            }
            validIndex++
          }
          return next
        })
      })
      .catch((err: Error) => {
        setError(`Failed to check for duplicates: ${err.message}`)
        // Mark all pending as ready (skip duplicate check)
        setRowStates((prev) =>
          prev.map((r) => r.serverStatus === 'pending' ? { ...r, serverStatus: 'ready' } : r)
        )
      })
      .finally(() => setIsValidating(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Stats
  const stats = useMemo(() => {
    const ready = rowStates.filter((r) => r.serverStatus === 'ready' && r.selected).length
    const duplicates = rowStates.filter((r) => r.serverStatus === 'duplicate').length
    const errors = rowStates.filter((r) => r.serverStatus === 'error').length
    const selectedDuplicates = rowStates.filter((r) => r.serverStatus === 'duplicate' && r.selected).length
    const total = ready + selectedDuplicates
    return { ready, duplicates, errors, selectedDuplicates, total }
  }, [rowStates])

  const toggleRow = useCallback((index: number) => {
    setRowStates((prev) => {
      const next = [...prev]
      if (next[index].serverStatus !== 'error') {
        next[index] = { ...next[index], selected: !next[index].selected }
      }
      return next
    })
  }, [])

  const toggleExpand = useCallback((index: number) => {
    setRowStates((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], expanded: !next[index].expanded }
      return next
    })
  }, [])

  const setDuplicateAction = useCallback((index: number, action: DuplicateAction) => {
    setRowStates((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        duplicateAction: action,
        selected: action !== 'skip',
      }
      return next
    })
  }, [])

  const setAllDuplicateAction = useCallback((action: DuplicateAction) => {
    setRowStates((prev) =>
      prev.map((r) =>
        r.serverStatus === 'duplicate'
          ? { ...r, duplicateAction: action, selected: action !== 'skip' }
          : r
      )
    )
  }, [])

  const handleImport = async () => {
    setIsImporting(true)
    setError(null)

    try {
      // Build the import request
      const importRows = rowStates
        .filter((r) => r.selected && r.serverStatus !== 'error')
        .map((r) => {
          if (r.serverStatus === 'duplicate') {
            return {
              action: r.duplicateAction === 'update' ? 'update' : 'create',
              existingId: r.duplicateAction === 'update' ? r.match?.id : undefined,
              data: r.data,
            }
          }
          return { action: 'create' as const, data: r.data }
        })

      if (importRows.length === 0) {
        setError('No rows selected for import.')
        setIsImporting(false)
        return
      }

      // Send in batches
      const aggregatedSummary = { created: 0, updated: 0, skipped: 0, errors: [] as { index: number; message: string }[] }
      const totalBatches = Math.ceil(importRows.length / BATCH_SIZE)

      for (let i = 0; i < totalBatches; i++) {
        const batch = importRows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
        setImportProgress(`Importing batch ${i + 1} of ${totalBatches}...`)

        const result = await bulkCreate(batch)
        aggregatedSummary.created += result.created
        aggregatedSummary.updated += result.updated
        aggregatedSummary.skipped += result.skipped
        aggregatedSummary.errors.push(...(result.errors || []))
      }

      // Add skipped rows from UI
      aggregatedSummary.skipped += rowStates.filter((r) => !r.selected || r.serverStatus === 'error').length

      onImportComplete(aggregatedSummary)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsImporting(false)
      setImportProgress(null)
    }
  }

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">Checking for duplicates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-semibold text-navy">Review & Import</h2>
        <p className="text-sm text-gray-600 mt-1">
          Review the data below before importing. All new properties will be created as <span className="font-medium">drafts</span>.
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.ready}</p>
          <p className="text-xs text-green-600">Ready</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.duplicates}</p>
          <p className="text-xs text-yellow-600">Duplicates</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.errors}</p>
          <p className="text-xs text-red-600">Errors</p>
        </div>
      </div>

      {/* Batch duplicate actions */}
      {stats.duplicates > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">All duplicates:</span>
          <button onClick={() => setAllDuplicateAction('skip')} className="px-2 py-1 rounded text-xs font-medium border border-gray-300 hover:bg-gray-100">
            Skip All
          </button>
          <button onClick={() => setAllDuplicateAction('update')} className="px-2 py-1 rounded text-xs font-medium border border-yellow-300 text-yellow-700 hover:bg-yellow-50">
            Update All
          </button>
          <button onClick={() => setAllDuplicateAction('create')} className="px-2 py-1 rounded text-xs font-medium border border-blue-300 text-blue-700 hover:bg-blue-50">
            Create All New
          </button>
        </div>
      )}

      {/* Row list */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b">
              <th className="w-8 px-3 py-2" />
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Address</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">City</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">State</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Beds</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Baths</th>
              <th className="w-8 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rowStates.map((row, index) => (
              <RowEntry
                key={index}
                index={index}
                row={row}
                onToggleSelect={toggleRow}
                onToggleExpand={toggleExpand}
                onDuplicateAction={setDuplicateAction}
              />
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} disabled={isImporting}>
          Back
        </Button>
        <div className="flex items-center gap-3">
          {importProgress && <span className="text-sm text-gray-600">{importProgress}</span>}
          <Button
            variant="primary"
            onClick={handleImport}
            isLoading={isImporting}
            disabled={stats.total === 0}
          >
            Import {stats.total} {stats.total === 1 ? 'Property' : 'Properties'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Row Entry sub-component ---

function RowEntry({
  index,
  row,
  onToggleSelect,
  onToggleExpand,
  onDuplicateAction,
}: {
  index: number
  row: RowState
  onToggleSelect: (i: number) => void
  onToggleExpand: (i: number) => void
  onDuplicateAction: (i: number, action: DuplicateAction) => void
}) {
  const statusBadge = {
    ready: { icon: CheckCircleIcon, color: 'text-green-600 bg-green-50', label: 'Ready' },
    duplicate: { icon: ExclamationTriangleIcon, color: 'text-yellow-600 bg-yellow-50', label: 'Duplicate' },
    error: { icon: XCircleIcon, color: 'text-red-600 bg-red-50', label: 'Error' },
    pending: { icon: CheckCircleIcon, color: 'text-gray-400 bg-gray-50', label: 'Checking...' },
  }[row.serverStatus]

  const Icon = statusBadge.icon

  return (
    <>
      <tr className={`border-b last:border-0 ${row.selected ? '' : 'opacity-50'}`}>
        <td className="px-3 py-2">
          <input
            type="checkbox"
            checked={row.selected}
            onChange={() => onToggleSelect(index)}
            disabled={row.serverStatus === 'error'}
            className="rounded border-gray-300 text-navy focus:ring-navy"
          />
        </td>
        <td className="px-3 py-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {statusBadge.label}
          </span>
        </td>
        <td className="px-3 py-2 text-sm text-gray-900 truncate max-w-[200px]">{row.data.street_address || '—'}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{row.data.city || '—'}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{row.data.state || '—'}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{row.data.beds ?? '—'}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{row.data.baths ?? '—'}</td>
        <td className="px-3 py-2">
          {(row.serverStatus === 'duplicate' || row.serverStatus === 'error') && (
            <button onClick={() => onToggleExpand(index)} className="p-1 hover:bg-gray-100 rounded">
              {row.expanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
          )}
        </td>
      </tr>
      {row.expanded && row.serverStatus === 'duplicate' && row.match && (
        <tr className="bg-yellow-50/50">
          <td colSpan={8} className="px-6 py-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-yellow-800">Existing property found:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase">CSV Data</p>
                  <p>{row.data.street_address}, {row.data.city}, {row.data.state} {row.data.zip_code}</p>
                  <p className="text-gray-500">{row.data.beds} beds / {row.data.baths} baths</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Existing Record</p>
                  <p>{row.match.street_address}, {row.match.city}, {row.match.state} {row.match.zip_code}</p>
                  <p className="text-gray-500">Status: {row.match.status}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(['skip', 'update', 'create'] as DuplicateAction[]).map((action) => (
                  <button
                    key={action}
                    onClick={() => onDuplicateAction(index, action)}
                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                      row.duplicateAction === action
                        ? 'bg-navy text-white border-navy'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {action === 'skip' ? 'Skip' : action === 'update' ? 'Update Existing' : 'Create New'}
                  </button>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
      {row.expanded && row.serverStatus === 'error' && (
        <tr className="bg-red-50/50">
          <td colSpan={8} className="px-6 py-3">
            <ul className="list-disc list-inside text-sm text-red-700">
              {(row.serverErrors || row.clientValidation.errors).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/import/ReviewStep.tsx
git commit -m "feat: add ReviewStep component with duplicate resolution and batch import"
```

---

## Task 9: Import Wizard Page

**Files:**
- Create: `app/admin/properties/import/page.tsx`

Three-step wizard tying Upload, Mapping, and Review together. Shows a success summary after import completes.

- [ ] **Step 1: Create the import wizard page**

Create `app/admin/properties/import/page.tsx`:

```tsx
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UploadStep } from '@/components/import/UploadStep'
import { MappingStep } from '@/components/import/MappingStep'
import { ReviewStep } from '@/components/import/ReviewStep'
import { Button } from '@/components/common/Button'
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type Step = 'upload' | 'mapping' | 'review' | 'complete'

interface ImportSummary {
  created: number
  updated: number
  skipped: number
  errors: { index: number; message: string }[]
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'upload', label: 'Upload CSV' },
  { key: 'mapping', label: 'Map Columns' },
  { key: 'review', label: 'Review & Import' },
]

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [summary, setSummary] = useState<ImportSummary | null>(null)

  const handleParsed = useCallback((h: string[], r: Record<string, string>[]) => {
    setHeaders(h)
    setRows(r)
    setStep('mapping')
  }, [])

  const handleMapped = useCallback((m: Record<string, string>) => {
    setMapping(m)
    setStep('review')
  }, [])

  const handleImportComplete = useCallback((s: ImportSummary) => {
    setSummary(s)
    setStep('complete')
  }, [])

  const currentStepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/properties" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-heading font-bold text-navy">Import Properties</h1>
          <p className="text-sm text-gray-600">Bulk upload properties from a CSV file</p>
        </div>
      </div>

      {/* Step indicator */}
      {step !== 'complete' && (
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                i === currentStepIndex
                  ? 'bg-navy text-white'
                  : i < currentStepIndex
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
              }`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                  i === currentStepIndex ? 'border-white/30' : 'border-current/30'
                }">
                  {i < currentStepIndex ? '✓' : i + 1}
                </span>
                {s.label}
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6">
        {step === 'upload' && (
          <UploadStep onParsed={handleParsed} />
        )}

        {step === 'mapping' && (
          <MappingStep
            headers={headers}
            sampleRows={rows.slice(0, 3)}
            onMapped={handleMapped}
            onBack={() => setStep('upload')}
          />
        )}

        {step === 'review' && (
          <ReviewStep
            headers={headers}
            rows={rows}
            mapping={mapping}
            onBack={() => setStep('mapping')}
            onImportComplete={handleImportComplete}
          />
        )}

        {step === 'complete' && summary && (
          <div className="text-center space-y-6 py-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-heading font-bold text-navy">Import Complete</h2>
              <p className="text-gray-600 mt-2">Your properties have been imported as drafts.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-700">{summary.created}</p>
                <p className="text-xs text-green-600">Created</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-700">{summary.updated}</p>
                <p className="text-xs text-blue-600">Updated</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-gray-700">{summary.skipped}</p>
                <p className="text-xs text-gray-600">Skipped</p>
              </div>
            </div>

            {summary.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm font-medium text-red-800 mb-2">{summary.errors.length} row(s) failed:</p>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {summary.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>Row {e.index + 1}: {e.message}</li>
                  ))}
                  {summary.errors.length > 10 && (
                    <li>...and {summary.errors.length - 10} more</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => {
                setStep('upload')
                setHeaders([])
                setRows([])
                setMapping({})
                setSummary(null)
              }}>
                Import More
              </Button>
              <Button variant="primary" onClick={() => router.push('/admin/properties')}>
                View Properties
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/properties/import/page.tsx
git commit -m "feat: add import wizard page with step navigation and success summary"
```

---

## Task 10: Wire Up Admin Properties Page

**Files:**
- Modify: `app/admin/properties/page.tsx`

Add an "Import CSV" button next to the existing "Add Property" button that links to the import page.

- [ ] **Step 1: Add the Import CSV link**

In `app/admin/properties/page.tsx`, add the `ArrowUpTrayIcon` import alongside the existing icon imports (around line 13):

```ts
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  StarIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'
```

Add `Link` import at the top:

```ts
import Link from 'next/link'
```

Then replace the header section's `<Button>` (around line 336) with a flex container holding both buttons:

Replace:
```tsx
        <Button variant="primary" size="sm" onClick={handleCreateNew}>
          Add Property
        </Button>
```

With:
```tsx
        <div className="flex items-center gap-2">
          <Link href="/admin/properties/import">
            <Button variant="outline" size="sm">
              <span className="flex items-center gap-1.5">
                <ArrowUpTrayIcon className="h-4 w-4" />
                Import CSV
              </span>
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={handleCreateNew}>
            Add Property
          </Button>
        </div>
```

- [ ] **Step 2: Verify the page renders**

Start the dev server and navigate to `/admin/properties`. Verify:
- "Import CSV" button appears to the left of "Add Property"
- Clicking "Import CSV" navigates to `/admin/properties/import`
- The import page loads with the Upload step

```bash
netlify dev
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/properties/page.tsx
git commit -m "feat: add Import CSV button to admin properties page"
```

---

## Task 11: End-to-End Manual Test

No new files. Verify the full flow works with the client's actual CSV.

- [ ] **Step 1: Start the dev server**

```bash
netlify dev
```

- [ ] **Step 2: Test the full import flow**

1. Navigate to `/admin/properties` — verify "Import CSV" button is visible
2. Click "Import CSV" — verify wizard loads at upload step
3. Upload a test CSV file (can use a small subset of the client's CSV)
4. Verify column auto-mapping detects known headers
5. Adjust any unmapped columns, verify required field warnings work
6. Click "Continue to Review" — verify rows are displayed with status badges
7. Verify duplicates are detected for any existing properties
8. Test duplicate resolution controls (skip/update/create)
9. Deselect some rows, verify count updates
10. Click Import — verify success summary shows

- [ ] **Step 3: Fix any issues found during testing**

Address any bugs or UX issues discovered.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during import flow testing"
```

---

## Post-Implementation Notes

**Geocoding:** The spec mentions geocoding properties without lat/lng after import. This is not included in this plan — it should be a separate task. The properties will work without coordinates; they just won't appear in geo-radius searches until coordinates are added (same as manually-created properties today).

**Photos:** The spec notes photos are optional in CSV import. This plan supports mapping a `cover_photo_url` column to store URLs as-is. Gallery photo upload remains a per-property operation through the existing admin UI.
