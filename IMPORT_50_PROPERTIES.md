# Import 50 Properties with Images

Quick guide to import your first 50 properties from Wix with images.

## Prerequisites

✅ You've already validated the CSV:
```bash
npm run migrate:validate -- ./All+Properties.csv
```

Now you need to:

### 1. Create Storage Bucket

Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → **Storage** → **Create new bucket**

**Settings:**
- **Name:** `property-photos`
- **Public bucket:** ✅ Yes (important!)
- **File size limit:** 50 MB
- **Allowed MIME types:** `image/*`

Click **Create bucket**

### 2. Apply Database Migration (if not done yet)

Run this SQL in **Supabase SQL Editor**:

```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS wix_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_properties_wix_id ON properties(wix_id);
COMMENT ON COLUMN properties.wix_id IS 'Original Wix CMS property ID - used for migration duplicate detection';
```

---

## Import 50 Properties

Run this single command:

```bash
npm run migrate:import -- ./All+Properties.csv 50
```

**What it does:**
1. ✅ Parses first 50 rows from CSV
2. ✅ Validates and transforms data
3. ✅ Imports properties to database
4. ✅ Downloads images from Wix
5. ✅ Uploads images to Supabase Storage
6. ✅ Updates property records with new image URLs

**Expected time:** ~5-10 minutes (depending on images)

---

## Check Results

After import completes:

```bash
# 1. Check database status
npx tsx scripts/check-migration-status.ts

# 2. View in admin panel
# Open: http://localhost:3000/admin/properties
```

You should see:
- ✅ 50 properties in database
- ✅ Properties with images
- ✅ Storage bucket with uploaded images

---

## What You'll See

### During Import

```
Importing 50 Properties with Images
✓ Parsed 50 rows
✓ Valid properties: 48

Step 1: Importing property data...
Importing Properties [████████████████] 48/48 (100%)
✓ Imported 48 properties

Step 2: Migrating images for 48 properties...
This may take a while (downloading from Wix, uploading to Supabase)
Migrating Images [████████████████] 48/48 (100%)

MIGRATION SUMMARY
  Properties Imported: 48
  Images Migrated Successfully: 46
  Image Migrations Failed: 2
  Property Import Failures: 0

✅ Import complete!
```

### In Admin Panel

When you open `/admin/properties`, you'll see:
- **Data table** with 48-50 properties
- **Thumbnail images** in the table
- Click any row to see full details with image gallery

---

## Troubleshooting

### Error: "Storage bucket not found"

Create the bucket as described in step 1 above.

### Error: "Rate limit exceeded"

The script automatically adds delays. If you still hit limits, wait a few minutes and retry failed images:

```bash
# Import again - it will skip duplicates
npm run migrate:import -- ./All+Properties.csv 50
```

### Some images failed to download

Common reasons:
- Wix URL no longer accessible
- Network timeout
- Invalid image format

Failed images will be logged in `scripts/migrate-wix/import-with-images-errors.log`

### Properties imported but no images

Check the storage bucket exists and is public:
- Go to Supabase Dashboard → Storage → property-photos
- Click bucket settings
- Verify "Public bucket" is enabled

---

## Next Steps

After successful test with 50 properties:

### Option 1: Import More Properties

Import in batches:

```bash
# Import next 50 (skip already imported)
npm run migrate:import -- ./All+Properties.csv 100

# Import next 50
npm run migrate:import -- ./All+Properties.csv 150

# etc.
```

### Option 2: Import All Properties

```bash
# Import all 2,805 properties (takes ~2-5 hours)
npm run migrate:import -- ./All+Properties.csv 2805
```

### Option 3: Clear and Restart

If you want to start over:

1. Go to Supabase Dashboard → Table Editor → properties
2. Delete all rows
3. Re-run import

---

## Verify Everything Works

```bash
# Check migration status
npx tsx scripts/check-migration-status.ts
```

Expected output:
```
✓ Total Properties: 50
✓ With Cover Photos: 48/50
✓ property-photos bucket: EXISTS
✓ Files in bucket: 300+
```

---

## Files Created

Logs are saved to:
- `scripts/migrate-wix/import-with-images.log` - Full log
- `scripts/migrate-wix/import-with-images-errors.log` - Errors only

---

Ready to import! 🚀

```bash
npm run migrate:import -- ./All+Properties.csv 50
```
