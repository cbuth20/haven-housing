import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { createSalesforceClient } from './utils/salesforce-client'
import { sendFormNotification } from './utils/notification-service'

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
        form_type: 'housing_request',
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

        // Build a detailed description from the form data
        const descriptionParts = [
          `Service Type: ${body.serviceType || 'N/A'}`,
          `Policy Type: ${body.policyType || 'N/A'}`,
          `Claim Number: ${body.claimNumber || 'N/A'}`,
          `Type of Loss: ${body.typeOfLoss || 'N/A'}`,
          `Date of Loss: ${body.dateOfLoss || 'N/A'}`,
          '',
          `--- Policyholder ---`,
          `Name: ${body.phFirstName || ''} ${body.phLastName || ''}`,
          `Phone: ${body.phCellPhone || 'N/A'}`,
          `Address: ${body.phStreetAddress || ''}, ${body.phCity || ''}, ${body.phState || ''} ${body.phZip || ''}`,
          '',
          `--- Family ---`,
          `Adults: ${body.numberOfAdults || 'N/A'}`,
          `Kids: ${body.numberOfKids || 'N/A'}`,
          `Pets: ${body.hasPets || 'N/A'}${body.petDescription ? ` - ${body.petDescription}` : ''}`,
        ]

        if (body.serviceType === 'Hotel' || body.serviceType === 'Hotel w/ Housing') {
          descriptionParts.push('', `--- Hotel ---`)
          descriptionParts.push(`Nights Approved: ${body.nightsApproved || 'N/A'}`)
          descriptionParts.push(`Check-In: ${body.checkInDate || 'N/A'}`)
          descriptionParts.push(`Check-Out: ${body.checkOutDate || 'N/A'}`)
        }

        if (body.serviceType === 'Housing' || body.serviceType === 'Hotel w/ Housing') {
          descriptionParts.push('', `--- Housing ---`)
          descriptionParts.push(`Monthly Budget: ${body.monthlyBudget || 'N/A'}`)
          descriptionParts.push(`Lease Length: ${body.leaseLength || 'N/A'}`)
        }

        if (body.notes) {
          descriptionParts.push('', `--- Notes ---`, body.notes)
        }

        salesforceId = await sfClient.createLead({
          fullName: fullName || 'Unknown',
          email: body.email || '',
          phone: body.mainPhone,
          subject: `Housing Request - ${body.serviceType || 'General'}`,
          message: descriptionParts.join('\n'),
          source: 'Website - Housing Request',
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
        // Update with error but don't fail the submission
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

    // Send notification email (non-blocking)
    sendFormNotification(
      'claims',
      'Insurance Claim Request',
      `New Insurance Claim from ${body.firstName || ''} ${body.lastName || ''} — ${body.serviceType || 'General'}`,
      body,
      '/admin'
    )

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
