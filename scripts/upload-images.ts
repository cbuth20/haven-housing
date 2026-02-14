import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = 'https://fkncanspiknxqhkubvnc.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const IMAGES_DIR = path.join(__dirname, '..', 'Images for upload')

const uploads = [
  // Team headshots
  { file: 'Updated Headshot.JPG', bucket: 'site-assets', storagePath: 'team/cory-yoviene.jpg', contentType: 'image/jpeg' },
  { file: 'Merrick.webp', bucket: 'site-assets', storagePath: 'team/merrick-kovatch.webp', contentType: 'image/webp' },
  { file: 'Juliet Howie (1).png', bucket: 'site-assets', storagePath: 'team/juliet-howie.png', contentType: 'image/png' },
  { file: 'Deserie Headshot.jpg', bucket: 'site-assets', storagePath: 'team/deserie-foley.jpg', contentType: 'image/jpeg' },
  { file: 'Terri Headshot.jpg', bucket: 'site-assets', storagePath: 'team/terri-royse.jpg', contentType: 'image/jpeg' },
  // Membership logos
  { file: 'NDTAlogoSmall.png', bucket: 'site-assets', storagePath: 'memberships/ndta-logo.png', contentType: 'image/png' },
  { file: 'CHPA_Logo_WithTagline_FullColor.TM_1K-800x117.png', bucket: 'site-assets', storagePath: 'memberships/chpa-logo.png', contentType: 'image/png' },
  { file: 'WERC Logo.svg', bucket: 'site-assets', storagePath: 'memberships/werc-logo.svg', contentType: 'image/svg+xml' },
]

async function ensureBucket(name: string) {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === name)
  if (!exists) {
    const { error } = await supabase.storage.createBucket(name, {
      public: true,
      allowedMimeTypes: ['image/*'],
    })
    if (error) {
      console.error(`Failed to create bucket ${name}:`, error.message)
    } else {
      console.log(`Created bucket: ${name}`)
    }
  }
}

async function main() {
  console.log('Starting image uploads to Supabase...\n')

  await ensureBucket('site-assets')

  for (const upload of uploads) {
    const filePath = path.join(IMAGES_DIR, upload.file)

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      continue
    }

    const fileBuffer = fs.readFileSync(filePath)

    console.log(`Uploading ${upload.file} -> ${upload.bucket}/${upload.storagePath}...`)

    const { data, error } = await supabase.storage
      .from(upload.bucket)
      .upload(upload.storagePath, fileBuffer, {
        contentType: upload.contentType,
        upsert: true,
      })

    if (error) {
      console.error(`  Failed: ${error.message}`)
    } else {
      const { data: urlData } = supabase.storage
        .from(upload.bucket)
        .getPublicUrl(upload.storagePath)
      console.log(`  Success! URL: ${urlData.publicUrl}`)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
