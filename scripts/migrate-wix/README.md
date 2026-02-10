# Wix to Supabase Property Migration

Comprehensive migration system to import 3,143 properties from Wix CMS to Supabase database.

## Overview

This migration system handles:
- **CSV parsing** with complex nested JSON structures
- **Data transformation** from Wix format to Supabase schema
- **Image migration** from Wix URLs to Supabase Storage
- **Duplicate detection** using Wix ID mapping
- **Progress tracking** with checkpoint/resume capability
- **Error handling** with detailed logging and retry logic

## Prerequisites

1. **Environment variables** configured in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Database migration** applied:
   ```bash
   npx supabase migration up
   ```

3. **Dependencies installed**:
   ```bash
   npm install
   ```

4. **CSV file** downloaded from Wix CMS

## Quick Start

### Step 1: Validate CSV (Dry Run)

Validate the CSV structure without making any database changes:

```bash
npm run migrate:validate -- /path/to/wix-export.csv
```

**What it does:**
- Parses CSV and checks structure
- Validates all fields against schema
- Generates `validation-report.json`
- **No database changes**

**Output:**
```
✓ Parsed 3,143 rows
✓ Valid: 3,120 | Invalid: 23 | Warnings: 45
✓ Validation report saved to validation-report.json
```

### Step 2: Test Migration (50 Properties)

Import first 50 properties to test the process:

```bash
npm run migrate:test -- /path/to/wix-export.csv --limit 50
```

**What it does:**
- Imports first 50 properties (no images yet)
- Sets status to `published`
- Skips duplicates automatically
- Creates checkpoint file for resume capability

**Output:**
```
Importing [████████████████████████] 50/50 (100%)
✓ Imported 48 properties successfully
✗ Failed 2 properties (see errors.log)
```

### Step 3: Migrate Images (Test)

Download Wix images and upload to Supabase Storage:

```bash
npm run migrate:images -- --test
```

**What it does:**
- Finds properties without images
- Downloads from Wix CDN
- Uploads to `property-photos` bucket
- Updates property records with new URLs

**Note:** Full image migration implementation is in progress. Current version logs the process but requires CSV reload feature.

### Step 4: Verify Migration

Check migration success and generate report:

```bash
npm run migrate:verify
```

**Output:**
```
Total Properties: 48
With Wix ID: 48
With Cover Photo: 45
With Gallery: 40
Published: 48
```

### Step 5: Full Migration (Production)

⚠️ **Only run after successful test migration**

```bash
npm run migrate:full -- /path/to/wix-export.csv
```

**What it does:**
- Imports ALL 3,143 properties
- Migrates all images
- Creates comprehensive logs
- Estimated time: **2-5 hours**

## CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `migrate:validate` | Validate CSV without importing | `npm run migrate:validate -- file.csv` |
| `migrate:test` | Import first 50 properties | `npm run migrate:test -- file.csv` |
| `migrate:images` | Migrate images only | `npm run migrate:images` |
| `migrate:full` | Full migration (all properties) | `npm run migrate:full -- file.csv` |
| `migrate:resume` | Resume interrupted migration | `npm run migrate:resume -- file.csv` |
| `migrate:verify` | Verify migration success | `npm run migrate:verify` |

## Architecture

### File Structure

```
/scripts/migrate-wix/
├── migrate.ts                 # Main orchestrator
├── config.ts                  # Configuration constants
├── types.ts                   # TypeScript interfaces
├── logger.ts                  # Structured logging
├── csv-parser.ts              # Streaming CSV parser
├── field-transformer.ts       # Wix → Supabase mapping
├── wix-image-converter.ts     # Image download/upload
├── batch-importer.ts          # Bulk property insertion
├── checkpoint-manager.ts      # Progress tracking
├── README.md                  # This file
├── .checkpoint.json           # Progress checkpoint (auto-generated)
├── migration.log              # Info logs (auto-generated)
├── errors.log                 # Error logs (auto-generated)
└── validation-report.json     # Validation results (auto-generated)
```

### Data Flow

```
CSV File
  ↓
CSV Parser (streaming)
  ↓
Field Transformer (Wix → Supabase)
  ↓
Schema Validation (Zod)
  ↓
Batch Importer (100 properties/batch)
  ↓
Supabase Database
  ↓
Image Converter (Wix URLs → Supabase Storage)
  ↓
Update Property Records
```

## Field Mapping

| CSV Column | Format | Supabase Field | Transformation |
|------------|--------|----------------|----------------|
| Title | String | title | Direct |
| Street Address | JSON/String | street_address | Extract `formatted` |
| City | JSON | city | Parse from `formatted` |
| State | JSON | state | Extract `subdivisions[0].code` |
| Square Footage | "888 SF" | square_footage | `parseInt(value.replace(/[^\d]/g, ''))` |
| Unit Type | `["Single Family"]` | unit_type | Extract first element |
| Beds | Integer | beds | Direct |
| Baths | Decimal | baths | Direct |
| Other Amenities | "A, B, C" | other_amenities | Split by comma |
| Cover Photo | `wix:image://...` | cover_photo_url | Convert to Supabase URL |
| Media Gallery | JSON array | media_gallery_urls | Convert all URLs |

## Configuration

Edit `config.ts` to customize:

```typescript
export const MIGRATION_CONFIG = {
  testBatchSize: 50,           // Properties for test mode
  propertyInsertBatch: 100,    // Batch size for inserts
  checkpointInterval: 50,      // Save checkpoint every N properties
  imageConcurrency: 10,        // Concurrent image downloads
  maxRetries: 3,               // Retry failed operations
  retryDelay: 2000,           // Initial retry delay (ms)
  defaultStatus: 'published',  // Status for imported properties
}
```

## Error Handling

### Checkpoint System

Progress is automatically saved to `.checkpoint.json`:

```json
{
  "phase": "importing",
  "lastProcessedRow": 150,
  "totalRows": 3143,
  "successfulProperties": ["uuid1", "uuid2", "..."],
  "failedProperties": [
    {
      "wixId": "xyz-789",
      "row": 42,
      "error": "Validation failed",
      "phase": "import"
    }
  ]
}
```

**Resume after interruption:**
```bash
npm run migrate:resume -- /path/to/wix-export.csv
```

### Duplicate Detection

Properties are checked against existing `wix_id` values:

```typescript
// Automatic duplicate check before insert
if (wix_id exists in database) {
  Skip with log: "Skipping duplicate: {wix_id}"
} else {
  Insert property
}
```

### Retry Logic

Failed operations are retried with exponential backoff:

1. **Image downloads**: 3 retries (2s, 4s, 8s delays)
2. **Batch inserts**: Fall back to individual inserts
3. **Network timeouts**: Save checkpoint and allow manual retry

## Logs & Reports

### migration.log
```
[2025-02-10 14:30:15] INFO: Starting migration for 50 properties
[2025-02-10 14:30:16] INFO: Validated 50 rows, 48 valid, 2 invalid
[2025-02-10 14:30:17] INFO: Imported property: Fairway, KS (ID: abc-123)
```

### errors.log
```
[2025-02-10 14:30:18] ERROR: Failed to import property (row 15)
  Error: ValidationError: Invalid email format
```

### validation-report.json
```json
{
  "totalRows": 50,
  "validRows": 48,
  "invalidRows": [
    {
      "row": 15,
      "wixId": "xyz-789",
      "errors": ["Invalid email format"]
    }
  ]
}
```

## Troubleshooting

### Issue: CSV parsing errors

**Solution:**
- Check CSV encoding (should be UTF-8)
- Verify CSV has header row
- Look for malformed JSON in fields

### Issue: Validation failures

**Solution:**
- Review `validation-report.json`
- Check `errors.log` for specific errors
- Fix data in CSV and re-run

### Issue: Image download failures

**Solution:**
- Verify Wix URLs are accessible
- Check network connectivity
- Images will retry 3 times automatically
- Manual retry: `npm run migrate:images -- --retry-failed`

### Issue: Supabase rate limits

**Solution:**
- Migration already uses batching (100 properties/batch)
- Rate limits are handled with delays
- If still hitting limits, reduce `propertyInsertBatch` in config

### Issue: Out of memory

**Solution:**
- CSV is parsed in streaming mode (memory efficient)
- If still issues, reduce `testBatchSize` for smaller batches
- Process in multiple runs using `--limit` flag

## Database Schema

The migration adds a `wix_id` column to the `properties` table:

```sql
ALTER TABLE properties ADD COLUMN wix_id TEXT UNIQUE;
CREATE INDEX idx_properties_wix_id ON properties(wix_id);
```

**Purpose:**
- Stores original Wix CMS property ID
- Enables duplicate detection on re-runs
- Allows mapping between systems

## Performance

### Expected Timeline

**Test Migration (50 properties):**
- CSV parsing: ~1 second
- Property import: ~5 seconds
- Image migration: ~2 minutes
- **Total: ~2-3 minutes**

**Full Migration (3,143 properties):**
- CSV parsing: ~5 seconds
- Property import: ~2 minutes
- Image migration: ~2-5 hours (depends on image count)
- **Total: ~2-5 hours**

### Optimization

The system uses:
- **Batch inserts**: 100 properties per API call
- **Concurrent downloads**: 10 images at once
- **Streaming CSV parsing**: Memory efficient
- **Checkpoint system**: Resume from failures
- **Rate limiting**: Respects Supabase limits

## Success Criteria

Migration is successful when:
- ✅ 99%+ of properties imported
- ✅ 95%+ of cover photos migrated
- ✅ 90%+ of gallery images migrated
- ✅ All Wix IDs mapped
- ✅ No duplicates exist
- ✅ All imported properties have `status = 'published'`

## Next Steps

After successful migration:

1. **Review sample properties** in the UI
2. **Check image loading** in property detail pages
3. **Fix validation errors** from errors.log
4. **Retry failed images** if needed
5. **Backup migrated data**
6. **Update documentation**
7. **Set up monitoring** for broken image URLs

## Support

For issues or questions:
- Check `errors.log` for detailed error messages
- Review `validation-report.json` for data issues
- See GitHub issues for known problems
- Contact: [Add contact info]

## License

[Add license information]
