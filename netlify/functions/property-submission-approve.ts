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

    // Get submission
    const { data: submission, error: fetchError } = await supabase
      .from('property_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError) throw fetchError

    // Create property from submission
    const propertyData = submission.submission_data
    const { data: property, error: createError } = await supabase
      .from('properties')
      .insert({
        title: propertyData.title,
        street_address: propertyData.streetAddress,
        city: propertyData.city,
        state: propertyData.state,
        zip_code: propertyData.zipCode,
        country: 'US',
        description: propertyData.description,
        monthly_rent: Number(propertyData.monthlyRent),
        beds: Number(propertyData.beds),
        baths: Number(propertyData.baths),
        square_footage: propertyData.squareFootage ? Number(propertyData.squareFootage) : null,
        pet_policy: propertyData.petPolicy,
        parking: propertyData.parking,
        laundry: propertyData.laundry,
        furnish_level: propertyData.furnishLevel,
        landlord_name: propertyData.landlordName,
        landlord_email: propertyData.landlordEmail,
        landlord_phone: propertyData.landlordPhone,
        listing_link: propertyData.listingLink,
        status: 'published',
        featured: false,
      })
      .select()
      .single()

    if (createError) throw createError

    // Update submission status
    const { error: updateError } = await supabase
      .from('property_submissions')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
        property_id: property.id,
      })
      .eq('id', submissionId)

    if (updateError) throw updateError

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, propertyId: property.id }),
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
