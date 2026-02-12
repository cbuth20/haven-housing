import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import { createSalesforceClient } from './utils/salesforce-client'

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { type, id } = body // type: 'form' | 'property', id: UUID

    if (!type || !id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Type and ID are required' }),
      }
    }

    const sfClient = createSalesforceClient()
    if (!sfClient) {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: 'Salesforce credentials not configured' }),
      }
    }

    if (type === 'form') {
      const { data: submission, error } = await supabaseAdmin
        .from('form_submissions')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !submission) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Form submission not found' }),
        }
      }

      const formData = submission.form_data as Record<string, any>

      const salesforceId = await sfClient.createLead({
        fullName: formData.fullName || formData.name || 'Unknown',
        email: formData.email || '',
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        source: `Website - ${submission.form_type}`,
      })

      await supabaseAdmin
        .from('form_submissions')
        .update({
          salesforce_id: salesforceId,
          salesforce_synced: true,
          last_sync_attempt_at: new Date().toISOString(),
          sync_error: null,
        })
        .eq('id', id)

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Synced to Salesforce', salesforceId, id }),
      }
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid type' }),
    }
  } catch (error: any) {
    console.error('Error syncing to Salesforce:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Internal server error' }),
    }
  }
})

export { handler }
