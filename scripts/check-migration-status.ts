#!/usr/bin/env node
// Quick diagnostic to check migration status
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStatus() {
  console.log('🔍 Checking Migration Status...\n')

  // Check properties
  console.log('━━━ DATABASE ━━━')
  const { data: properties, error: propsError, count: totalCount } = await supabase
    .from('properties')
    .select('id, title, cover_photo_url, media_gallery_urls, wix_id, status', { count: 'exact' })
    .limit(5)

  if (propsError) {
    console.log('❌ Error fetching properties:', propsError.message)
  } else {
    console.log(`✓ Total Properties: ${totalCount}`)

    if (properties && properties.length > 0) {
      const withImages = properties.filter(p => p.cover_photo_url).length
      console.log(`✓ Sample Properties: ${properties.length}`)
      console.log(`✓ With Cover Photos: ${withImages}/${properties.length}`)

      console.log('\nSample Property:')
      console.log(JSON.stringify(properties[0], null, 2))
    } else {
      console.log('⚠️  No properties found in database')
    }
  }

  // Check if wix_id column exists
  const { data: withWixId } = await supabase
    .from('properties')
    .select('wix_id')
    .not('wix_id', 'is', null)
    .limit(1)

  console.log(`✓ Wix ID column exists: ${withWixId && withWixId.length > 0 ? 'Yes' : 'No (migration not applied)'}`)

  // Check storage buckets
  console.log('\n━━━ STORAGE ━━━')
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets()

  if (bucketsError) {
    console.log('❌ Error fetching buckets:', bucketsError.message)
  } else {
    console.log(`✓ Total Buckets: ${buckets?.length || 0}`)

    const propertyBucket = buckets?.find(b => b.name === 'property-photos')
    if (propertyBucket) {
      console.log('✓ property-photos bucket: EXISTS')

      // Check files in bucket
      const { data: files, error: filesError } = await supabase
        .storage
        .from('property-photos')
        .list('', { limit: 10 })

      if (!filesError && files) {
        console.log(`✓ Files in bucket: ${files.length}`)
      }
    } else {
      console.log('❌ property-photos bucket: NOT FOUND')
    }

    console.log('\nAll buckets:', buckets?.map(b => b.name).join(', '))
  }

  // Check for Wix CSV file
  console.log('\n━━━ CSV FILE ━━━')
  const fs = require('fs')
  const csvPath = './All+Properties.csv'
  if (fs.existsSync(csvPath)) {
    const stats = fs.statSync(csvPath)
    console.log(`✓ CSV file found: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
  } else {
    console.log('❌ CSV file not found at ./All+Properties.csv')
  }

  console.log('\n━━━ NEXT STEPS ━━━')

  const propertyBucket = buckets?.find(b => b.name === 'property-photos')

  if (!withWixId || withWixId.length === 0) {
    console.log('1. ❗ Apply database migration to add wix_id column')
    console.log('   → Run SQL in Supabase Dashboard or: npx supabase db push')
  }

  if (!propertyBucket) {
    console.log('2. ❗ Create property-photos storage bucket')
    console.log('   → Follow instructions below')
  }

  if (totalCount === 0) {
    console.log('3. ❗ Import properties from CSV')
    console.log('   → npm run migrate:test -- ./All+Properties.csv')
  }

  if (totalCount && totalCount > 0 && !properties?.some(p => p.cover_photo_url)) {
    console.log('4. ❗ Migrate images from Wix to Supabase')
    console.log('   → npm run migrate:images')
  }

  console.log('\n✨ Status check complete!')
}

checkStatus().catch(console.error)
