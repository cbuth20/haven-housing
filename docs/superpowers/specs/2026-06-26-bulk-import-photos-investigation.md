# Bulk Property Import — Photos: Investigation & Recommendation

**Date:** 2026-06-26
**Status:** Investigation / proposal (no code changed)
**Context:** Client reports bulk property uploads can't bring in photos; team currently
adds photos property-by-property by hand after importing. Connor attempted "pull photos
from a link" (OneDrive / listing link) without success.

## How bulk import works today

3-step wizard at `/admin/properties/import` (`app/admin/properties/import/page.tsx`):

1. **Upload CSV** — Papa Parse in the browser; "Found N rows, M columns".
2. **Map columns** (`components/import/MappingStep.tsx`) — auto-maps headers to property
   fields via `COLUMN_ALIASES` in `lib/csv-import.ts`; admin fixes unmapped ones.
3. **Review & import** (`components/import/ReviewStep.tsx`) — transforms/validates each row,
   server-side duplicate check (`properties-bulk-validate`), then batch insert
   (`properties-bulk-create`, batches of 50) as **draft** status.

Text data (address, beds, baths, rent, amenities) imports cleanly. **Photos effectively do not.**

## Why photos don't work (root causes per reported symptom)

- **"Only retrieves a single image"** — The importer maps a single `cover_photo_url` column;
  there is **no `media_gallery_urls` mapping at all** (not in `COLUMN_ALIASES` or the field
  dropdown). Design spec (`2026-04-10-bulk-property-import-design.md`) explicitly says galleries
  aren't supported in CSV import. Sharper cause: `normalizeValue` for `cover_photo_url`
  (`lib/csv-import.ts:198-203, 236-239`) only accepts a value starting with `http(s)://`. A
  JSON array of URLs (typical Wix/spreadsheet export, e.g. `["a.jpg","b.jpg"]`) unwraps only
  when it has exactly ONE element; 2+ elements → returns **null** (no image).
- **"Listing link does not pull in image"** — There is **no scraping logic anywhere**.
  `listing_link` is stored as a plain text link ("View Original Listing"). Nothing fetches
  images from a Zillow/listing URL. (Scraping is fragile + against ToS — not recommended.)
- **"Images fail to display"** — three compounding reasons:
  1. OneDrive *share* links and Zillow listing URLs are HTML pages, **not direct image files**,
     so `<img src>` renders broken; a OneDrive *folder* link is many images, not one.
  2. `next.config.js` `images.remotePatterns` only allows `*.supabase.co`. Search-result cards
     (`PropertyListCard`) use `next/image`, which **blocks any other host** → broken images.
     (Detail page/gallery use plain `<img>`, so they tolerate any direct URL — hence
     inconsistent behavior across pages.)
  3. External CDNs often block hotlinking or use expiring signed URLs.
- **Critically: the import stores external links as-is and NEVER re-hosts.** Unlike the
  single-property form (`lib/upload-photos.ts` → Supabase Storage) and the Wix migration
  script (`scripts/migrate-wix/wix-image-converter.ts`, which downloads + re-hosts), bulk
  import does zero image fetching. This is the root fragility.

Note: the **server schema is NOT the bottleneck** — `PropertySchema` (`netlify/functions/utils/validation.ts:30-31`) already accepts `cover_photo_url` and `media_gallery_urls`. Only the CSV/UI layer is missing gallery support.

## Is the manual per-property photo upload avoidable?

Mostly yes. Two pieces of work:
- **Associating photos ↔ property** — unavoidable; someone must do it once. BUT it's likely
  already done: the client stores photos in OneDrive folders per property, so the mapping
  exists in their folder structure.
- **Re-uploading them one property at a time, in-app, after import** — **avoidable drudgery.**
  This only exists because bulk import never handled photos.

Closing the gap reuses the organization they already have, turning "import data, then hand-add
photos to N properties" into "import data + photos together."

## Recommendation: ZIP + CSV, with server-side re-hosting (backbone)

Re-host every image into Supabase Storage so all images live on the allowlisted `*.supabase.co`
(fixes display wholesale — no expiry, no hotlink block, no `next/image` host issue), and add
`media_gallery_urls` support.

Chosen source = **ZIP of per-property folders + a `photo_folder` CSV column** that matches each
folder name. Most reliable, source-agnostic, true multi-photo. Client can drag existing OneDrive
folders into a zip, so it fits their workflow without an OAuth integration.

Rejected/deferred sources:
- **Direct image-URL column** — non-starter for their data (OneDrive/Zillow links aren't direct
  image files).
- **OneDrive/SharePoint folder via MS Graph API** — best match for current workflow but heaviest
  build (OAuth + share-permission + throttling); defer to phase 2 only if zips prove too tedious.
- **Listing-link scraping** — fragile, ToS issues; avoid.
- **Better per-property upload UI** — cheap stopgap, doesn't deliver true "bulk".

## What to build (all three required)

1. Add `media_gallery_urls` to the importer (alias + field dropdown + multi-URL normalizer).
2. Re-host images into Supabase Storage (reuse `wix-image-converter.ts` download/upload logic).
3. ZIP step in the wizard: upload `.zip`; each folder named to match the CSV `photo_folder`
   column; unzip → upload each image to Supabase → set cover (first) + gallery.

**Architecture caveat:** `properties-bulk-create` is a Netlify function with a short execution
limit — downloading/re-hosting hundreds of images inside it WOULD time out (the Wix migration
avoided this by being a long-running checkpointed script). Do the image uploads **from the
browser straight to Supabase Storage** (reuse `lib/upload-photos.ts`, which already bypasses
function size/time limits), then send the resulting `*.supabase.co` URLs in the import payload,
keeping the serverless function to fast DB inserts only.

Rough effort: gallery mapping + re-host wiring = small/medium; the ZIP unzip/match UI is the bulk
— a few days.

## Answer to give the client

Standardize on a **ZIP** where each property has its own folder, plus a `photo_folder` CSV column
matching the folder name (address or ID). We import all photos per folder, host them on our own
servers (always display, never break), and set the first as cover. Listing links can't pull
photos, and individual share links only carry one image — the zip approach is what gives reliable,
multi-photo bulk upload.
