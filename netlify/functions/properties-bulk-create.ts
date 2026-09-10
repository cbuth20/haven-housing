import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import { PropertySchema } from './utils/validation'
import { buildPropertyUpdate } from './utils/property-update'

interface ImportRow {
  action: 'create' | 'update' | 'skip'
  existingId?: string
  data: Record<string, any>
}

interface BulkCreateRequest {
  rows: ImportRow[]
}

/** Per-row outcome so the client can hand the database-assigned IDs back to the user. */
interface ImportRowResult {
  index: number
  id: string
  action: 'created' | 'updated'
}

interface ImportSummary {
  created: number
  updated: number
  skipped: number
  errors: { index: number; message: string }[]
  results: ImportRowResult[]
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

    const summary: ImportSummary = { created: 0, updated: 0, skipped: 0, errors: [], results: [] }

    const toCreate: { index: number; data: Record<string, any> }[] = []
    const toUpdate: { index: number; id: string; provided: Record<string, any>; data: Record<string, any> }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      if (row.action === 'skip') {
        summary.skipped++
        continue
      }

      const parseResult = PropertySchema.safeParse(row.data)
      if (!parseResult.success) {
        summary.errors.push({
          index: i,
          message: parseResult.error.issues.map((e: { message: string }) => e.message).join(', '),
        })
        continue
      }

      if (row.action === 'create') {
        toCreate.push({ index: i, data: parseResult.data })
      } else if (row.action === 'update' && row.existingId) {
        // Keep the original provided keys so the update only touches fields the
        // CSV actually supplied — not schema-default fields the parser injects.
        toUpdate.push({ index: i, id: row.existingId, provided: row.data, data: parseResult.data })
      } else if (row.action === 'update') {
        // Update requested but no target id — surface it instead of silently
        // dropping the row from every summary count.
        summary.errors.push({ index: i, message: 'Could not update: existing property id missing' })
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
          const { data: single, error: singleError } = await supabaseAdmin
            .from('properties')
            .insert({
              ...item.data,
              status: 'draft',
              created_by: event.userId,
              owner_id: event.userId,
            })
            .select('id')
            .single()

          if (singleError) {
            summary.errors.push({ index: item.index, message: singleError.message })
          } else {
            summary.created++
            if (single?.id) summary.results.push({ index: item.index, id: single.id, action: 'created' })
          }
        }
      } else {
        summary.created = toCreate.length
        // A single multi-row INSERT ... RETURNING yields rows in VALUES order, so
        // position i corresponds to toCreate[i]. Only report IDs when the count
        // lines up; a short/long result would mis-assign IDs.
        if (Array.isArray(data) && data.length === toCreate.length) {
          data.forEach((row, i) => {
            if (row?.id) summary.results.push({ index: toCreate[i].index, id: row.id, action: 'created' })
          })
        }
      }
    }

    // Update existing properties one at a time. buildPropertyUpdate enforces the
    // import-update safety rules (preserve status/featured/ownership, only write
    // provided non-blank fields) — see netlify/functions/utils/property-update.ts.
    for (const item of toUpdate) {
      const updateData = buildPropertyUpdate(item.provided, item.data)

      // Nothing updatable (only protected or blank fields supplied) — no-op.
      if (Object.keys(updateData).length === 0) continue

      // .select() so a stale ID (property deleted since the review step) is
      // detected: PostgREST returns no error for an UPDATE that hits 0 rows.
      const { data: updatedRows, error } = await supabaseAdmin
        .from('properties')
        .update(updateData)
        .eq('id', item.id)
        .select('id')

      if (error) {
        summary.errors.push({ index: item.index, message: error.message })
      } else if (!updatedRows || updatedRows.length === 0) {
        summary.errors.push({ index: item.index, message: `Property ${item.id} no longer exists — it may have been deleted since the review step` })
      } else {
        summary.updated++
        summary.results.push({ index: item.index, id: item.id, action: 'updated' })
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
