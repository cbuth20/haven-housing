# Quick Reference Card

## Common Commands

```bash
# 1️⃣ Validate CSV (no changes)
npm run migrate:validate -- /path/to/file.csv

# 2️⃣ Test migration (50 properties)
npm run migrate:test -- /path/to/file.csv --limit 50

# 3️⃣ Verify results
npm run migrate:verify

# 4️⃣ Migrate images
npm run migrate:images

# 5️⃣ Full migration (all properties)
npm run migrate:full -- /path/to/file.csv

# ⚡ Resume interrupted migration
npm run migrate:resume -- /path/to/file.csv
```

## Typical Workflow

```bash
# Step 1: Validate
npm run migrate:validate -- ~/Downloads/All+properties.csv

# Step 2: Test with 50 properties
npm run migrate:test -- ~/Downloads/All+properties.csv

# Step 3: Check results
npm run migrate:verify

# Step 4: If test successful, run full migration
npm run migrate:full -- ~/Downloads/All+properties.csv
```

## Output Files

| File | Purpose |
|------|---------|
| `migration.log` | All operations log |
| `errors.log` | Errors only |
| `validation-report.json` | Validation results |
| `verification-report.json` | Migration stats |
| `.checkpoint.json` | Resume progress |

## Configuration

Edit `config.ts`:

```typescript
testBatchSize: 50          // Properties for test
propertyInsertBatch: 100   // Batch size
imageConcurrency: 10       // Concurrent downloads
maxRetries: 3              // Retry attempts
defaultStatus: 'published' // Import status
```

## Troubleshooting

```bash
# Check logs
cat scripts/migrate-wix/errors.log
cat scripts/migrate-wix/migration.log

# View validation report
cat scripts/migrate-wix/validation-report.json

# Check checkpoint status
cat scripts/migrate-wix/.checkpoint.json

# Verify database
npm run migrate:verify
```

## Database Query

```sql
-- Count imported properties
SELECT COUNT(*) FROM properties WHERE wix_id IS NOT NULL;

-- Check properties without images
SELECT COUNT(*) FROM properties
WHERE wix_id IS NOT NULL
AND cover_photo_url IS NULL;

-- View recent imports
SELECT id, title, wix_id, created_at
FROM properties
WHERE wix_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## Key Points

✅ Always start with validation
✅ Test with 50 properties first
✅ Verify results before full migration
✅ Images can be migrated separately
✅ Safe to re-run (duplicate detection)
✅ Checkpoint allows resume

⚠️ Full migration takes 2-5 hours
⚠️ Use service_role key, not anon key
⚠️ Backup data before full migration
