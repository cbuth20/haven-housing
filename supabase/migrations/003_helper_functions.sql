-- Calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
  R DECIMAL := 3959; -- Earth's radius in miles
  dLat DECIMAL;
  dLon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dLat := RADIANS(lat2 - lat1);
  dLon := RADIANS(lon2 - lon1);

  a := SIN(dLat/2) * SIN(dLat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dLon/2) * SIN(dLon/2);

  c := 2 * ATAN2(SQRT(a), SQRT(1-a));

  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Search properties by geolocation and filters
CREATE OR REPLACE FUNCTION search_properties(
  search_lat DECIMAL,
  search_lon DECIMAL,
  search_radius DECIMAL DEFAULT 20, -- miles
  min_beds INTEGER DEFAULT NULL,
  min_baths DECIMAL DEFAULT NULL,
  allows_pets BOOLEAN DEFAULT NULL,
  max_rent DECIMAL DEFAULT NULL,
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
  latitude DECIMAL,
  longitude DECIMAL,
  description TEXT,
  square_footage INTEGER,
  beds INTEGER,
  baths DECIMAL,
  monthly_rent DECIMAL,
  pet_policy TEXT,
  cover_photo_url TEXT,
  distance DECIMAL,
  featured BOOLEAN
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
    p.latitude,
    p.longitude,
    p.description,
    p.square_footage,
    p.beds,
    p.baths,
    p.monthly_rent,
    p.pet_policy,
    p.cover_photo_url,
    calculate_distance(search_lat, search_lon, p.latitude, p.longitude) as distance,
    p.featured
  FROM properties p
  WHERE
    p.status = 'published'
    AND p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND calculate_distance(search_lat, search_lon, p.latitude, p.longitude) <= search_radius
    AND (min_beds IS NULL OR p.beds >= min_beds)
    AND (min_baths IS NULL OR p.baths >= min_baths)
    AND (allows_pets IS NULL OR
         (allows_pets = true AND LOWER(p.pet_policy) LIKE '%allow%') OR
         (allows_pets = true AND LOWER(p.pet_policy) LIKE '%yes%'))
    AND (max_rent IS NULL OR p.monthly_rent <= max_rent)
  ORDER BY
    p.featured DESC,
    distance ASC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
