import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { submissionId, notes } = JSON.parse(event.body || '{}')

    const { error } = await supabase
      .from('property_submissions')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
      })
      .eq('id', submissionId)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
