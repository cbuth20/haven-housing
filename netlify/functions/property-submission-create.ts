import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { createSalesforceClient } from './utils/salesforce-client'
import { sendFormNotification } from './utils/notification-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function formatPropertyDetails(data: Record<string, any>): string {
  const lines: string[] = []

  lines.push('--- Property Details ---')
  lines.push(`Address: ${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}`)
  lines.push(`Monthly Rent: $${data.monthlyRent}`)
  lines.push(`Beds: ${data.beds} | Baths: ${data.baths}`)
  if (data.squareFootage) lines.push(`Square Footage: ${data.squareFootage}`)
  lines.push(`Pet Policy: ${data.petPolicy}`)
  if (data.furnishLevel) lines.push(`Furnishing: ${data.furnishLevel}`)
  if (data.parking) lines.push(`Parking: ${data.parking}`)
  if (data.laundry) lines.push(`Laundry: ${data.laundry}`)
  if (Array.isArray(data.otherAmenities) && data.otherAmenities.length) {
    lines.push(`Other Amenities: ${data.otherAmenities.join(', ')}`)
  }
  if (data.listingLink) lines.push(`Listing Link: ${data.listingLink}`)
  lines.push('')
  lines.push('--- Description ---')
  lines.push(data.description)
  lines.push('')
  lines.push('--- Landlord/Property Manager ---')
  lines.push(`Name: ${data.landlordName}`)
  lines.push(`Email: ${data.landlordEmail}`)
  lines.push(`Phone: ${data.landlordPhone}`)

  return lines.join('\n')
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const data = JSON.parse(event.body || '{}')

    const { error } = await supabase.from('property_submissions').insert({
      submission_data: data,
      submitter_name: data.submitterName,
      submitter_email: data.submitterEmail,
      submitter_phone: data.submitterPhone,
      status: 'pending',
    })

    if (error) throw error

    // Also insert into form_submissions for Salesforce sync tracking
    const { data: formRecord, error: formError } = await supabase
      .from('form_submissions')
      .insert({
        form_type: 'property_submission',
        form_data: data,
        submitter_email: data.submitterEmail,
        salesforce_synced: false,
      })
      .select()
      .single()

    if (formError) {
      console.error('form_submissions insert error:', formError.message)
    }

    // Sync to Salesforce (non-blocking)
    const sfClient = createSalesforceClient()
    if (sfClient && formRecord) {
      try {
        const salesforceId = await sfClient.createLead({
          fullName: data.submitterName,
          email: data.submitterEmail,
          phone: data.submitterPhone,
          subject: `Property Submission: ${data.title}`,
          message: formatPropertyDetails(data),
          source: 'Website - Property Submission',
        })

        await supabase
          .from('form_submissions')
          .update({
            salesforce_id: salesforceId,
            salesforce_synced: true,
            last_sync_attempt_at: new Date().toISOString(),
            sync_error: null,
          })
          .eq('id', formRecord.id)

        console.log('Salesforce lead created for property submission:', salesforceId)
      } catch (sfError: any) {
        console.error('Salesforce sync error:', sfError.message)

        await supabase
          .from('form_submissions')
          .update({
            salesforce_synced: false,
            last_sync_attempt_at: new Date().toISOString(),
            sync_error: sfError.message,
          })
          .eq('id', formRecord.id)
      }
    }

    // Send notification email (non-blocking)
    sendFormNotification(
      'property',
      'Property Submission',
      `New Property Submission: ${data.title} — ${data.city}, ${data.state}`,
      {
        'Submitter Name': data.submitterName,
        'Submitter Email': data.submitterEmail,
        'Submitter Phone': data.submitterPhone,
        'Property Title': data.title,
        'Address': `${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}`,
        'Monthly Rent': `$${data.monthlyRent}`,
        'Beds / Baths': `${data.beds} bed / ${data.baths} bath`,
        'Square Footage': data.squareFootage || 'N/A',
        'Pet Policy': data.petPolicy,
        'Furnishing': data.furnishLevel || 'N/A',
        'Parking': data.parking || 'N/A',
        'Laundry': data.laundry || 'N/A',
        'Other Amenities': Array.isArray(data.otherAmenities) && data.otherAmenities.length
          ? data.otherAmenities.join(', ')
          : 'N/A',
        'Listing Link': data.listingLink || 'N/A',
        'Description': data.description,
        'Landlord Name': data.landlordName,
        'Landlord Email': data.landlordEmail,
        'Landlord Phone': data.landlordPhone,
      },
      '/admin/submissions'
    )

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
