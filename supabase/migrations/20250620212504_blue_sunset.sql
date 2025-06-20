/*
  # Add user tracking fields to contact inquiries

  1. Schema Changes
    - Add `ip_address` field to store user's IP address
    - Add `device_type` field to store device information (mobile, desktop, tablet)
    - Add `user_agent` field to store full user agent string
    - Add `region` field to store user's region/state
    - Add `city` field to store user's city
    - Add `country` field to store user's country

  2. Security
    - All new fields are optional and have appropriate defaults
    - IP address is stored as inet type for proper validation
    - Fields are included in existing RLS policies
*/

-- Add new columns to contact_inquiries table
DO $$
BEGIN
  -- Add ip_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE contact_inquiries ADD COLUMN ip_address inet;
  END IF;

  -- Add device_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'device_type'
  ) THEN
    ALTER TABLE contact_inquiries ADD COLUMN device_type text DEFAULT 'unknown';
  END IF;

  -- Add user_agent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE contact_inquiries ADD COLUMN user_agent text;
  END IF;

  -- Add region column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'region'
  ) THEN
    ALTER TABLE contact_inquiries ADD COLUMN region text;
  END IF;

  -- Add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'city'
  ) THEN
    ALTER TABLE contact_inquiries ADD COLUMN city text;
  END IF;

  -- Add country column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'country'
  ) THEN
    ALTER TABLE contact_inquiries ADD COLUMN country text DEFAULT 'IN';
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_ip_address ON contact_inquiries(ip_address);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_device_type ON contact_inquiries(device_type);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_region ON contact_inquiries(region);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_city ON contact_inquiries(city);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_country ON contact_inquiries(country);

-- Add comments for documentation
COMMENT ON COLUMN contact_inquiries.ip_address IS 'User IP address for analytics and security';
COMMENT ON COLUMN contact_inquiries.device_type IS 'Device type: mobile, desktop, tablet, or unknown';
COMMENT ON COLUMN contact_inquiries.user_agent IS 'Full user agent string for device identification';
COMMENT ON COLUMN contact_inquiries.region IS 'User region/state from IP geolocation';
COMMENT ON COLUMN contact_inquiries.city IS 'User city from IP geolocation';
COMMENT ON COLUMN contact_inquiries.country IS 'User country code (default: IN for India)';