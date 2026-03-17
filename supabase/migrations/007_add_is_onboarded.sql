-- Add is_onboarded column to user_profiles
ALTER TABLE user_profiles ADD COLUMN is_onboarded BOOLEAN NOT NULL DEFAULT false;

-- Mark all existing users as onboarded
UPDATE user_profiles SET is_onboarded = true;
