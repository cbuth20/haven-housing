-- Ensure property-photos bucket exists with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-photos',
  'property-photos',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Drop existing policies if any (idempotent re-run)
DROP POLICY IF EXISTS "Public photo read access" ON storage.objects;
DROP POLICY IF EXISTS "Public submission photo uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admin photo uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admin photo deletion" ON storage.objects;

-- Anyone can view photos (public bucket)
CREATE POLICY "Public photo read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-photos');

-- Anyone can upload to submissions/ folder (for public property submissions)
CREATE POLICY "Public submission photo uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-photos'
  AND (storage.foldername(name))[1] = 'submissions'
);

-- Authenticated admins can upload anywhere in the bucket
CREATE POLICY "Admin photo uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-photos'
  AND public.is_admin()
);

-- Only admins can delete photos
CREATE POLICY "Admin photo deletion"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-photos'
  AND public.is_admin()
);
