import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import { PropertySchema } from './utils/validation'

interface ImportRow {
  action: 'create' | 'update' | 'skip'
  existingId?: string
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

    const toCreate: { index: number; data: Record<string, any> }[] = []
    const toUpdate: { index: number; id: string; data: Record<string, any> }[] = []

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

    // Update existing properties one at a time
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
