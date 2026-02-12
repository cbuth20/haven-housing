import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { ContactFormSchema } from './utils/validation'
import { createSalesforceClient } from './utils/salesforce-client'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')

    // Support both "name" (legacy frontend) and "fullName" field names
    if (body.name && !body.fullName) {
      body.fullName = body.name
    }

    // Validate form data
    const validatedData = ContactFormSchema.parse(body)

    // Get submitter IP
    const submitterIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || null

    // Insert form submission
    const { data, error } = await supabaseAdmin
      .from('form_submissions')
      .insert({
        form_type: 'contact',
        form_data: validatedData,
        submitter_email: validatedData.email,
        submitter_ip: submitterIp,
        salesforce_synced: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to submit form', error: error.message }),
      }
    }

    // Sync to Salesforce (non-blocking — don't fail the request if SF is down)
    const sfClient = createSalesforceClient()
    if (sfClient) {
      try {
        const salesforceId = await sfClient.createLead({
          fullName: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone,
          subject: validatedData.subject,
          message: validatedData.message,
          source: 'Website - Contact Form',
        })

        // Update Supabase with sync status
        await supabaseAdmin
          .from('form_submissions')
          .update({
            salesforce_id: salesforceId,
            salesforce_synced: true,
            last_sync_attempt_at: new Date().toISOString(),
            sync_error: null,
          })
          .eq('id', data.id)

        console.log('Salesforce lead created:', salesforceId)
      } catch (sfError: any) {
        console.error('Salesforce sync error:', sfError.message)

        // Record the error but don't fail the form submission
        await supabaseAdmin
          .from('form_submissions')
          .update({
            salesforce_synced: false,
            last_sync_attempt_at: new Date().toISOString(),
            sync_error: sfError.message,
          })
          .eq('id', data.id)
      }
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Form submitted successfully',
        id: data.id,
      }),
    }
  } catch (error: any) {
    console.error('Error submitting form:', error)

    if (error.name === 'ZodError') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation error',
          errors: error.errors,
        }),
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}

export { handler }
