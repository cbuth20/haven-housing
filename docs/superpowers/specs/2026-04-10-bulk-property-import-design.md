# Bulk Property Import — Design Spec

**Date:** 2026-04-10
**Status:** Draft

## Overview

Add a self-service CSV import feature to the admin dashboard so the client can bulk-upload new properties without developer involvement. The client maintains a large spreadsheet of properties and needs to periodically add batches of hundreds of new properties at a time.

## User Flow

Three-step wizard at `/admin/properties/import`, accessible via an "Import Properties" button on the existing admin properties page.

### Step 1: Upload

- Drag-and-drop or file picker for `.csv` files
- Client-side parsing with Papa Parse
- Quick summary after upload: "Found 142 rows, 26 columns"
- Basic file validation: must be CSV, must have at least one data row

### Step 2: Map Columns

Two-column layout:

- **Left:** Detected CSV headers
- **Right:** Dropdown of property fields to map to

Auto-mapping runs first using a dictionary of known aliases (case-insensitive, trimmed). Examples:

| Property Field | Known Aliases |
|---|---|
| `street_address` | "Street Address", "Address", "Property Address" |
| `city` | "City", "City Name" |
| `state` | "State", "State Code" |
| `zip_code` | "Zip Code", "Zipcode", "Postal Code", "ZIP" |
| `title` | "Title", "Property Name", "Name" |
| `beds` | "Beds", "Bedrooms", "Bed Count" |
| `baths` | "Baths", "Bathrooms", "Bath Count" |
| `square_footage` | "Square Footage", "Sq Ft", "SqFt", "Square Feet" |
| `unit_type` | "Unit Type", "Property Type", "Type" |
| `description` | "Description", "Property Description" |
| `monthly_rent` | "Monthly Rent", "Rent", "Price" |
| `landlord_name` | "Landlord", "Landlord Name", "Owner Name" |
| `landlord_email` | "Landlord Email", "Owner Email", "Email" |
| `landlord_phone` | "Landlord Phone Number", "Landlord Phone", "Phone" |
| `laundry` | "Laundry", "Laundry Type" |
| `pet_policy` | "Pet Policy", "Pets", "Pet Friendly" |
| `parking` | "Parking", "Parking Type" |
| `furnish_level` | "Furnish Level", "Furnished", "Furnishing" |
| `other_amenities` | "Other Amenities", "Other Ammenities", "Amenities" |
| `listing_link` | "Listing Link", "Listing URL", "URL" |
| `cover_photo_url` | "Cover Photo", "Cover Photo URL", "Photo" |
| `featured` | "Featured" |
| `latitude` | "Latitude", "Lat" |
| `longitude` | "Longitude", "Lng", "Long" |

Unmapped or ambiguous columns are highlighted in yellow for manual resolution. A "preview sample" shows the first 3 rows of data for each mapped column so the client can verify the mapping.

Columns can also be mapped to "Skip this column" to ignore irrelevant CSV data.

### Step 3: Review & Import

Full table of parsed/transformed rows. Each row gets a status badge:

- **Ready** (green) — passes validation, no duplicate found
- **Duplicate** (yellow) — matches an existing property by address. Client chooses per-row: skip, update existing, or create new
- **Error** (red) — missing required fields or invalid data. Shows specific error message.

**Duplicate resolution UI:** When a row is flagged as a duplicate, it expands to show a side-by-side comparison — CSV data on the left, existing database record on the right. Differences highlighted. Per-row actions: Skip (default), Update, or Create New.

**Batch actions:** A "Select All Duplicates" dropdown applies the same action to all duplicates, with per-row override.

Client can deselect any row they don't want to import. "Import X Properties" button at the bottom. All new imports go in as **draft** status.

## Data Transformation

### Address Handling

Accept both plain text and structured JSON formats:

- **Plain text** (e.g., "4023 W 62nd Ter, Fairway, KS 66205"): Parse city, state, zip from the string using regex patterns
- **Wix JSON objects**: Extract from nested `city`, `subdivision`, `postalCode`, `streetAddress.formattedAddressLine` fields (reuse logic from existing `FieldTransformer`)

### Value Normalization

- **Array-wrapped values**: `["Single Family"]` → `"Single Family"`, plain `"Single Family"` also accepted
- **Square footage**: Strip non-numeric suffixes — `"888 SF"` → `888`, `"1,590 sq ft"` → `1590`
- **Booleans**: Accept `true`/`false`, `"true"`/`"false"`, `"1"`/`"0"`, `"yes"`/`"no"` for fields like `featured`
- **Emails**: Trim whitespace, validate contains `@`
- **Phone numbers**: Accept as-is (no reformatting)
- **Amenities**: Split comma-separated string into array — `"Fenced Backyard, Outdoor Patio"` → `["Fenced Backyard", "Outdoor Patio"]`

### Photos

Optional. If a column is mapped to `cover_photo_url` and contains a URL (http/https), it is stored as-is. Wix `wix:image://` URLs are ignored. Media gallery not supported in CSV import — photos can be added individually after import via the existing admin UI.

### Required Fields

A row is valid if it has: `street_address`, `city`, `state`, `zip_code`. Title is auto-generated from address if not provided (e.g., "4023 W 62nd Ter, Fairway, KS").

## Duplicate Detection

Match on normalized street address + zip code:

- Lowercase
- Trim whitespace
- Standardize abbreviations: "St" → "Street", "Dr" → "Drive", "Ave" → "Avenue", "Ct" → "Court", "Ter" → "Terrace", "Blvd" → "Boulevard", "Ln" → "Lane"

If `wix_id` is present in the CSV and matches an existing property's `wix_id`, that also flags as duplicate.

If `listing_link` matches an existing property's `listing_link`, that also flags as duplicate.

Duplicate check happens server-side during the review step — client sends the parsed rows, server returns match results.

## Architecture

### Client-Side

All CSV parsing, column mapping, and preview rendering happens in the browser. Only transformed property objects are sent to the server.

**New files:**

- `app/admin/properties/import/page.tsx` — wizard page with step navigation
- `components/import/UploadStep.tsx` — drag-and-drop CSV file picker
- `components/import/MappingStep.tsx` — column mapping UI with auto-detection
- `components/import/ReviewStep.tsx` — preview table with validation badges and duplicate resolution
- `lib/csv-import.ts` — column alias dictionary, data normalizers, validation logic

**Dependencies:**

- `papaparse` — CSV parsing (new dependency)

### Server-Side

Two new Netlify functions:

**`properties-bulk-validate`** — POST, admin auth required

- Accepts array of transformed property objects
- Runs duplicate detection against the database (address + zip, wix_id, listing_link)
- Returns per-row validation results: valid, duplicate (with matching property data), or error

**`properties-bulk-create`** — POST, admin auth required

- Accepts array of property objects with per-row action (create, update, skip)
- Re-validates with existing `PropertySchema`
- Batch inserts new properties (status: `draft`, `created_by` set to authenticated user)
- Batch updates for rows marked as "update existing"
- Returns summary: X created, Y updated, Z skipped, W errors

### Geocoding

For imported properties without lat/lng, geocode via Google Maps after insert. The `properties-bulk-create` function inserts all properties first, then fires geocoding requests without awaiting them (fire-and-forget). If the function times out before geocoding completes, that's fine — properties exist as drafts and geocoding can be retried. Uses existing Google Maps integration.

### Batching

Netlify functions have execution time limits. For large imports (100+ rows), the client-side sends rows in batches of 50 to `properties-bulk-create`. Progress is shown in the UI ("Importing batch 2 of 4..."). Each batch is independent — if one fails, previous batches are not rolled back. The final summary aggregates results across all batches.

### No Database Migrations

The existing `properties` table schema supports all fields. No new tables or columns needed.

## Error Handling

- **Malformed CSV**: Show error at upload step with a clear message
- **No mappable columns**: Show warning at mapping step, client must manually map at least the required fields
- **Partial failures**: If some rows fail during import, show which succeeded and which failed. Don't roll back successful inserts.
- **Network errors**: Show retry option. Since properties are created as drafts, re-importing the same CSV will flag previously imported rows as duplicates.

## Access Control

- Only admin users can access `/admin/properties/import`
- Both Netlify functions require admin auth (JWT with admin role), same as existing `properties-create`
