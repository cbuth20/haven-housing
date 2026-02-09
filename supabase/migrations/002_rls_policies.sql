-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_of_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_pocs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User Profiles Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM user_profiles WHERE id = auth.uid())
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Allow user creation on signup
CREATE POLICY "Allow user creation on signup"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Properties Policies
-- Anyone can view published properties
CREATE POLICY "Anyone can view published properties"
  ON properties FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);

-- Only admins can insert properties
CREATE POLICY "Admins can insert properties"
  ON properties FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update properties
CREATE POLICY "Admins can update properties"
  ON properties FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Only admins can delete properties
CREATE POLICY "Admins can delete properties"
  ON properties FOR DELETE
  USING (is_admin());

-- Property Submissions Policies
-- Anyone can submit properties (including anonymous)
CREATE POLICY "Anyone can submit properties"
  ON property_submissions FOR INSERT
  WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY "Admins can view submissions"
  ON property_submissions FOR SELECT
  USING (is_admin());

-- Only admins can update submissions
CREATE POLICY "Admins can update submissions"
  ON property_submissions FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Form Submissions Policies
-- Anyone can submit forms (including anonymous)
CREATE POLICY "Anyone can submit forms"
  ON form_submissions FOR INSERT
  WITH CHECK (true);

-- Only admins can view form submissions
CREATE POLICY "Admins can view form submissions"
  ON form_submissions FOR SELECT
  USING (is_admin());

-- Only admins can update form submissions (for sync status)
CREATE POLICY "Admins can update form submissions"
  ON form_submissions FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Points of Contact Policies
-- Admins can do everything with POCs
CREATE POLICY "Admins can view POCs"
  ON points_of_contact FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert POCs"
  ON points_of_contact FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update POCs"
  ON points_of_contact FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete POCs"
  ON points_of_contact FOR DELETE
  USING (is_admin());

-- Property POCs Junction Policies
-- Admins can manage property-POC relationships
CREATE POLICY "Admins can view property POCs"
  ON property_pocs FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert property POCs"
  ON property_pocs FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete property POCs"
  ON property_pocs FOR DELETE
  USING (is_admin());
