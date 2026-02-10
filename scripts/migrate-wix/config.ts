// Configuration constants for migration

export const MIGRATION_CONFIG = {
  // Test mode: process only first N properties
  testMode: false,
  testBatchSize: 50,

  // Batch sizes
  propertyInsertBatch: 100,
  checkpointInterval: 50,

  // Image concurrency
  imageConcurrency: 10,
  maxRetries: 3,
  retryDelay: 2000,  // milliseconds

  // Rate limiting
  supabaseRateLimit: 50,  // Max 50 req/sec

  // Supabase storage
  storageBucket: 'property-photos',

  // File paths
  checkpointFile: '.checkpoint.json',
  logFile: 'migration.log',
  errorLogFile: 'errors.log',
  validationReportFile: 'validation-report.json',

  // Property status
  defaultStatus: 'published' as const,
  defaultCountry: 'US',
}

// Wix image URL pattern
export const WIX_IMAGE_PATTERN = /wix:image:\/\/v1\/([^\/]+)\/([^#]+)/

// Wix static URL template
export const WIX_STATIC_URL = 'https://static.wixstatic.com/media/'
