import { Handler } from '@netlify/functions'
import { supabaseAdmin } from './utils/supabase-client'
import { requireAdmin } from './utils/auth-middleware'
import multipart from 'parse-multipart-data'

const handler: Handler = requireAdmin(async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const contentType = event.headers['content-type'] || ''

    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Content-Type must be multipart/form-data' }),
      }
    }

    // Parse the multipart form data
    const boundary = contentType.split('boundary=')[1]
    const parts = multipart.parse(Buffer.from(event.body || '', 'base64'), boundary)

    const uploadedUrls: string[] = []

    // Upload each file to Supabase Storage
    for (const part of parts) {
      if (part.filename) {
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const fileName = `${timestamp}-${randomString}-${part.filename}`

        const { data, error } = await supabaseAdmin
          .storage
          .from('property-photos')
          .upload(fileName, part.data, {
            contentType: part.type,
            cacheControl: '3600',
          })

        if (error) {
          console.error('Upload error:', error)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('property-photos')
          .getPublicUrl(data.path)

        uploadedUrls.push(publicUrl)
      }
    }

    if (uploadedUrls.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No files were uploaded' }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ urls: uploadedUrls }),
    }
  } catch (error: any) {
    console.error('Error uploading photos:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: error.message }),
    }
  }
})

export { handler }
