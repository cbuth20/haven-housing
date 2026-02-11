-- search_properties_v2: flexible RPC returning all property columns + computed distance
-- Supports optional status filtering (NULL = all statuses) and text search

CREATE OR REPLACE FUNCTION search_properties_v2(
  search_lat DECIMAL,
  search_lon DECIMAL,
  search_radius DECIMAL DEFAULT 20,
  min_beds INTEGER DEFAULT NULL,
  min_baths DECIMAL DEFAULT NULL,
  allows_pets BOOLEAN DEFAULT NULL,
  max_rent DECIMAL DEFAULT NULL,
  filter_status TEXT DEFAULT 'published',
  search_text TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  description TEXT,
  square_footage INTEGER,
  unit_type TEXT,
  beds INTEGER,
  baths DECIMAL,
  laundry TEXT,
  pet_policy TEXT,
  parking TEXT,
  furnish_level TEXT,
  other_amenities TEXT[],
  landlord_name TEXT,
  landlord_email TEXT,
  landlord_phone TEXT,
  monthly_rent DECIMAL,
  cover_photo_url TEXT,
  media_gallery_urls TEXT[],
  listing_link TEXT,
  property_level TEXT,
  featured BOOLEAN,
  status TEXT,
  salesforce_id TEXT,
  last_synced_at TIMESTAMPTZ,
  wix_id TEXT,
  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.street_address,
    p.city,
    p.state,
    p.zip_code,
    p.country,
    p.latitude,
    p.longitude,
    p.description,
    p.square_footage,
    p.unit_type,
    p.beds,
    p.baths,
    p.laundry,
    p.pet_policy,
    p.parking,
    p.furnish_level,
    p.other_amenities,
    p.landlord_name,
    p.landlord_email,
    p.landlord_phone,
    p.monthly_rent,
    p.cover_photo_url,
    p.media_gallery_urls,
    p.listing_link,
    p.property_level,
    p.featured,
    p.status,
    p.salesforce_id,
    p.last_synced_at,
    p.wix_id,
    p.owner_id,
    p.created_by,
    p.created_at,
    p.updated_at,
    calculate_distance(search_lat, search_lon, p.latitude, p.longitude) as distance
  FROM properties p
  WHERE
    p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND calculate_distance(search_lat, search_lon, p.latitude, p.longitude) <= search_radius
    AND (filter_status IS NULL OR p.status = filter_status)
    AND (min_beds IS NULL OR p.beds >= min_beds)
    AND (min_baths IS NULL OR p.baths >= min_baths)
    AND (allows_pets IS NULL OR
         (allows_pets = true AND (LOWER(p.pet_policy) LIKE '%allow%' OR LOWER(p.pet_policy) LIKE '%yes%')))
    AND (max_rent IS NULL OR p.monthly_rent <= max_rent)
    AND (search_text IS NULL OR (
      p.title ILIKE '%' || search_text || '%'
      OR p.city ILIKE '%' || search_text || '%'
      OR p.state ILIKE '%' || search_text || '%'
      OR p.street_address ILIKE '%' || search_text || '%'
      OR p.zip_code ILIKE '%' || search_text || '%'
    ))
  ORDER BY
    p.featured DESC,
    distance ASC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
