import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import { salesforceClient } from './utils/salesforce-client'

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

    // This is a placeholder implementation
    // When Salesforce credentials are available, this will:
    // 1. Fetch the record from Supabase
    // 2. Authenticate with Salesforce
    // 3. Create/update the record in Salesforce
    // 4. Update the sync status in Supabase

    if (type === 'form') {
      // Get form submission
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

      // TODO: Sync to Salesforce as Lead
      // const salesforceId = await salesforceClient.createLead(submission.form_data)

      // Update sync status
      await supabaseAdmin
        .from('form_submissions')
        .update({
          salesforce_synced: false, // Will be true when implemented
          last_sync_attempt_at: new Date().toISOString(),
          sync_error: 'Salesforce integration not yet configured',
        })
        .eq('id', id)

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Sync attempted (Salesforce not yet configured)',
          id,
        }),
      }
    }

    if (type === 'property') {
      // Get property
      const { data: property, error } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !property) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Property not found' }),
        }
      }

      // TODO: Sync to Salesforce
      // const salesforceId = await salesforceClient.createProperty(property)

      // Update sync status
      await supabaseAdmin
        .from('properties')
        .update({
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', id)

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Sync attempted (Salesforce not yet configured)',
          id,
        }),
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
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
})

export { handler }
