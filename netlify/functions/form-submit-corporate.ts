import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { CorporateFormSchema } from './utils/validation'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')

    // Validate form data
    const validatedData = CorporateFormSchema.parse(body)

    // Get submitter IP
    const submitterIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || null

    // Insert form submission
    const { data, error } = await supabaseAdmin
      .from('form_submissions')
      .insert({
        form_type: 'corporate_relocation',
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

    // TODO: Trigger Salesforce sync (async)

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
