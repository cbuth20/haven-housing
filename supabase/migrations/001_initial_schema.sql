-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties Table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  title TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'USA',

  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Property Details
  description TEXT,
  square_footage INTEGER,
  unit_type TEXT,
  beds INTEGER,
  baths DECIMAL(3, 1),

  -- Amenities
  laundry TEXT,
  pet_policy TEXT,
  parking TEXT,
  furnish_level TEXT,
  other_amenities TEXT[],

  -- Landlord Information
  landlord_name TEXT,
  landlord_email TEXT,
  landlord_phone TEXT,

  -- Financial
  monthly_rent DECIMAL(10, 2),

  -- Media
  cover_photo_url TEXT,
  media_gallery_urls TEXT[],
  listing_link TEXT,

  -- Classification
  property_level TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- Salesforce Integration
  salesforce_id TEXT,
  last_synced_at TIMESTAMPTZ,

  -- Ownership & Tracking
  owner_id UUID REFERENCES user_profiles(id),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Submissions Table
CREATE TABLE property_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Submission Data
  submission_data JSONB NOT NULL,

  -- Submitter Information
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_phone TEXT,

  -- Review Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Link to created property
  property_id UUID REFERENCES properties(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Submissions Table
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Form Type
  form_type TEXT NOT NULL CHECK (form_type IN (
    'insurance_relocation',
    'corporate_relocation',
    'government_lodging',
    'contact',
    'property_submission'
  )),

  -- Form Data
  form_data JSONB NOT NULL,

  -- Submitter Info
  submitter_email TEXT,
  submitter_ip TEXT,

  -- Salesforce Sync Status
  salesforce_id TEXT,
  salesforce_synced BOOLEAN DEFAULT false,
  last_sync_attempt_at TIMESTAMPTZ,
  sync_error TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points of Contact Table
CREATE TABLE points_of_contact (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  organization TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property POCs Junction Table (Many-to-Many)
CREATE TABLE property_pocs (
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  poc_id UUID REFERENCES points_of_contact(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, poc_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
CREATE INDEX idx_properties_city_state ON properties(city, state);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_property_submissions_status ON property_submissions(status);
CREATE INDEX idx_form_submissions_type ON form_submissions(form_type);
CREATE INDEX idx_form_submissions_salesforce_synced ON form_submissions(salesforce_synced);
CREATE INDEX idx_form_submissions_created_at ON form_submissions(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_submissions_updated_at BEFORE UPDATE ON property_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_points_of_contact_updated_at BEFORE UPDATE ON points_of_contact
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
