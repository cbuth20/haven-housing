# Migration Setup Guide

Quick setup instructions for Wix to Supabase property migration.

## 1. Database Setup

Apply the database migration to add the `wix_id` column:

### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your Supabase project (if not already linked)
npx supabase link

# Apply all pending migrations
npx supabase db push
```

### Option B: Manual SQL (Supabase Dashboard)

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL:

```sql
-- Add wix_id column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS wix_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_wix_id ON properties(wix_id);

-- Add documentation comment
COMMENT ON COLUMN properties.wix_id IS 'Original Wix CMS property ID - used for migration duplicate detection';
```

## 2. Environment Variables

Ensure `.env.local` has these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find:**
- Go to Supabase Dashboard → Settings → API
- Copy "Project URL" and "service_role" key

## 3. Dependencies

Dependencies are already installed. If needed, reinstall:

```bash
npm install
```

## 4. CSV File

Download your Wix export CSV file. You'll need the path for migration commands:

```
/path/to/your/All+properties.csv
```

## 5. Verify Setup

Test that everything is configured correctly:

```bash
# This should show no errors
npm run migrate:verify
```

## 6. Ready to Migrate!

Follow the steps in [README.md](./README.md):

1. **Validate**: `npm run migrate:validate -- /path/to/file.csv`
2. **Test**: `npm run migrate:test -- /path/to/file.csv`
3. **Verify**: `npm run migrate:verify`
4. **Full Migration**: `npm run migrate:full -- /path/to/file.csv`

## Troubleshooting

### Supabase CLI not linked

```bash
npx supabase link --project-ref your-project-ref
```

Find project ref in: Supabase Dashboard → Settings → General → Reference ID

### Permission errors

Make sure you're using the **service_role** key, not the **anon** key.

### Missing dependencies

```bash
npm install csv-parser p-limit cli-progress
```

### TypeScript errors

Dependencies include TypeScript types:

```bash
npm install -D @types/node
```

## Ready to Start

Once setup is complete, start with:

```bash
npm run migrate:validate -- /Users/conbuth/Downloads/All+properties.csv
```

This will validate your CSV without making any changes!
