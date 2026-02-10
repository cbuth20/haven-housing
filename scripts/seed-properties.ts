import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample properties from the CSV
const properties = [
  {
    title: 'Beautiful Home in Fairway, KS 66205',
    street_address: '4023 W 62nd Ter',
    city: 'Fairway',
    state: 'KS',
    zip_code: '66205',
    country: 'US',
    latitude: 39.02222769999999,
    longitude: -94.6319018,
    description: 'Updated and tastefully designed single family home with 2 bedrooms and 1 bath in Fairway, KS 66205. Conveniently located and ready for occupancy by families and clients for any length of stay. Book this home away from home now.',
    square_footage: 888,
    unit_type: 'Single Family',
    beds: 2,
    baths: 1,
    laundry: 'Yes',
    pet_policy: 'Pets Allowed',
    parking: 'Free Parking on Premises',
    furnish_level: 'Furnished',
    other_amenities: ['Fenced Backyard', 'Outdoor Patio', 'Bathtub'],
    landlord_name: 'Nicole Zerrer',
    landlord_phone: '(913) 416-0227',
    listing_link: 'https://furnishedhomeskc.guestybookings.com/properties/63b5a220ac7d3600347aa3fd',
    monthly_rent: 2500,
    status: 'published',
    featured: false,
  },
  {
    title: 'Spacious Family Home in Ballwin, MO 63011',
    street_address: '1369 Nykiel Ct',
    city: 'Ballwin',
    state: 'MO',
    zip_code: '63011',
    country: 'US',
    latitude: 38.6098436,
    longitude: -90.4982013,
    description: 'Updated and tastefully designed single family home with 4 bedrooms and 3 baths in Ballwin, MO 63011. Conveniently located and ready for occupancy by families and clients for any length of stay. Book this home away from home now.',
    square_footage: 2238,
    unit_type: 'Single Family',
    beds: 4,
    baths: 3,
    laundry: 'Yes',
    pet_policy: 'Pets Allowed',
    parking: 'Garage',
    furnish_level: 'Unfurnished',
    other_amenities: ['Family room', 'Fenced backyard', 'Fireplace'],
    landlord_name: 'Sam Schulte',
    landlord_phone: '314-882-8191',
    landlord_email: 'sam@woodfordrentals.com',
    listing_link: 'https://www.zillow.com/homedetails/1369-Nykiel-Ct-Ballwin-MO-63011/2789875_zpid/',
    monthly_rent: 2800,
    status: 'published',
    featured: true,
  },
  {
    title: 'Cozy Florida Home in Saint Cloud, FL 34769',
    street_address: '307 Tennessee Ave',
    city: 'St. Cloud',
    state: 'FL',
    zip_code: '34769',
    country: 'US',
    latitude: 28.2562349,
    longitude: -81.2967431,
    description: 'Updated and tastefully designed single family home with 3 bedrooms and 2 baths in Saint Cloud, FL 34769. Conveniently located and ready for occupancy by families and clients for any length of stay. Book this home away from home now.',
    square_footage: 1272,
    unit_type: 'Single Family',
    beds: 3,
    baths: 2,
    laundry: 'Yes',
    pet_policy: 'Pets Allowed',
    parking: 'Free parking on premises',
    furnish_level: 'Furnished',
    other_amenities: ['Grill', 'Stock tank pool', 'Fully fenced backyard'],
    landlord_name: 'Karina Rose',
    landlord_phone: '+1 321-343-9226',
    landlord_email: 'authenticallykarina@gmail.com',
    listing_link: 'https://www.zillow.com/homedetails/307-Tennessee-Ave-Saint-Cloud-FL-34769/46272936_zpid/',
    monthly_rent: 2200,
    status: 'published',
    featured: false,
  },
  {
    title: 'Modern Home in Plano, TX 75023',
    street_address: '3805 Yosemite Dr',
    city: 'Plano',
    state: 'TX',
    zip_code: '75023',
    country: 'US',
    latitude: 33.0603809,
    longitude: -96.73334299999999,
    description: 'Updated and tastefully designed single family home with 3 bedrooms and 2 baths in Plano, TX 75023. Conveniently located and ready for occupancy by families and clients for any length of stay. Book this home away from home now.',
    square_footage: 1590,
    unit_type: 'Single Family',
    beds: 3,
    baths: 2,
    laundry: 'Yes',
    pet_policy: 'Pets Allowed',
    parking: 'Free Parking on Premises',
    furnish_level: 'Furnished',
    other_amenities: ['Indoor Fireplace', 'Dedicated Workspace', 'BBQ Grill', 'Outdoor Patio', 'Outdoor Furniture', 'Fenced Backyard'],
    landlord_name: 'Carly Ly',
    landlord_phone: '972-977-8568',
    landlord_email: 'Texas.summit.properties@gmail.com',
    monthly_rent: 2600,
    status: 'published',
    featured: true,
  },
  {
    title: 'Luxury Estate in Woodland Hills, CA 91367',
    street_address: '5557 Ostin Ave',
    city: 'Woodland Hills',
    state: 'CA',
    zip_code: '91367',
    country: 'US',
    latitude: 34.1785255,
    longitude: -118.597305,
    description: 'Updated and tastefully designed single family home with 5 bedrooms and 3 baths in Woodland Hills, CA 91367. Conveniently located and ready for occupancy by families and clients for any length of stay. Book this home away from home now.',
    square_footage: null,
    unit_type: 'Single Family',
    beds: 5,
    baths: 3,
    laundry: 'Yes',
    pet_policy: 'Pets Allowed',
    parking: 'Free Parking on Premises',
    furnish_level: 'Furnished',
    other_amenities: ['Hot Tub', 'Outdoor Furniture', 'Outdoor Patio', 'Firepit', 'Indoor Fireplace', 'BBQ Grill', 'Dedicated Workspace', 'Walk-In Shower', 'Guest House', 'Bathtub'],
    landlord_name: 'Sharon Furman-Lee / LaKai Properties LLC',
    landlord_phone: '(310) 696-9620',
    listing_link: 'https://www.airbnb.com.ar/rooms/834917179856600385',
    monthly_rent: 5500,
    status: 'published',
    featured: true,
  },
  {
    title: 'Beach House in San Diego, CA 92109',
    street_address: '1015 Hornblend St',
    city: 'San Diego',
    state: 'CA',
    zip_code: '92109',
    country: 'US',
    latitude: 32.7963024,
    longitude: -117.2511397,
    description: 'Updated and tastefully designed single family home with 2 bedrooms and 1 baths in San Diego, CA 92109. Conveniently located and ready for occupancy by families and clients for any length of stay. Book this home away from home now.',
    square_footage: 650,
    unit_type: 'Single Family',
    beds: 2,
    baths: 1,
    laundry: 'Yes',
    pet_policy: 'No Pets',
    parking: 'Free parking on premises',
    furnish_level: 'Furnished',
    other_amenities: ['Bathtub', 'Fenced backyard', 'Fully stocked kitchen', 'Picnic table'],
    landlord_name: 'West Coast Homestays',
    landlord_phone: '619-815-8610',
    landlord_email: 'rentals@westcoasthomestays.com',
    monthly_rent: 3200,
    status: 'published',
    featured: false,
  },
]

async function seedProperties() {
  console.log('🌱 Seeding properties...\n')

  for (const property of properties) {
    console.log(`   Creating: ${property.title}`)

    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single()

    if (error) {
      console.error(`   ❌ Error creating ${property.title}:`, error.message)
    } else {
      console.log(`   ✅ Created ${property.title} (ID: ${data.id})`)
    }
  }

  console.log('\n✨ Seeding complete!')
}

seedProperties()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error seeding properties:', error)
    process.exit(1)
  })
