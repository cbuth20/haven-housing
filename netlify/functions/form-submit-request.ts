import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
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
    const submitterIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || null

    // Store in Supabase as backup/record
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('form_submissions')
      .insert({
        form_type: 'corporate_government_request',
        form_data: body,
        submitter_email: body.email,
        submitter_ip: submitterIp,
        salesforce_synced: false,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // Sync to Salesforce
    const sfClient = createSalesforceClient()
    let salesforceId: string | null = null

    if (sfClient) {
      try {
        const fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim()

        const descriptionParts = [
          `Company/Agency: ${body.companyOrAgency || 'N/A'}`,
          `On Behalf of Other: ${body.onBehalfOfOther || 'No'}`,
        ]

        if (body.onBehalfOfOther === 'Yes') {
          descriptionParts.push(
            `Guest: ${body.otherFirstName || ''} ${body.otherLastName || ''}`,
            `Guest Phone: ${body.otherMainPhone || 'N/A'}`,
            `Guest Email: ${body.otherEmail || 'N/A'}`,
          )
        }

        descriptionParts.push(
          '',
          `--- Location ---`,
          `Address: ${body.streetAddress || ''}, ${body.city || ''}, ${body.state || ''} ${body.zip || ''}`,
          `Country: ${body.country || 'N/A'}`,
          `Search Radius: ${body.searchRadius || 'N/A'} miles`,
          '',
          `--- Request Details ---`,
          `Move-In: ${body.moveInDate || 'N/A'}`,
          `Move-Out: ${body.moveOutDate || 'N/A'}`,
          `Need Extension: ${body.needExtension || 'N/A'}`,
          `Units: ${body.numberOfUnits || 'N/A'}`,
          `Adults: ${body.numberOfAdults || 'N/A'}`,
          `Kids: ${body.numberOfKids || 'N/A'}`,
          `Bedrooms: ${body.numberOfBedrooms || 'N/A'}`,
          `Bathrooms: ${body.numberOfBathrooms || 'N/A'}`,
          `Pets: ${body.hasPets || 'N/A'}${body.petDescription ? ` - ${body.petDescription}` : ''}`,
          `Nightly Budget: $${body.nightlyBudget || 'N/A'}`,
          `Parking: ${body.parking || 'N/A'}`,
          `Housekeeping: ${body.housekeeping || 'N/A'}`,
        )

        if (body.specialRequests) {
          descriptionParts.push('', `--- Special Requests ---`, body.specialRequests)
        }

        salesforceId = await sfClient.createLead({
          fullName: fullName || 'Unknown',
          email: body.email || '',
          phone: body.mainPhone,
          subject: `Corporate/Government Request - ${body.companyOrAgency || 'General'}`,
          message: descriptionParts.join('\n'),
          source: 'Website - Corporate/Government Request',
        })

        // Update Supabase with Salesforce ID
        if (submission?.id && salesforceId) {
          await supabaseAdmin
            .from('form_submissions')
            .update({
              salesforce_id: salesforceId,
              salesforce_synced: true,
              last_sync_attempt_at: new Date().toISOString(),
              sync_error: null,
            })
            .eq('id', submission.id)
        }
      } catch (sfError: any) {
        console.error('Salesforce sync error:', sfError.message)
        if (submission?.id) {
          await supabaseAdmin
            .from('form_submissions')
            .update({
              last_sync_attempt_at: new Date().toISOString(),
              sync_error: sfError.message,
            })
            .eq('id', submission.id)
        }
      }
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Form submitted successfully',
        id: submission?.id,
        salesforceId,
      }),
    }
  } catch (error: any) {
    console.error('Error submitting form:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    }
  }
}

export { handler }
