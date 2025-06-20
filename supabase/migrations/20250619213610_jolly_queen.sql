/*
  # Fix Contact Inquiries RLS Policies

  1. Security Updates
    - Drop existing policies that might be conflicting
    - Create new comprehensive policies for anonymous and authenticated users
    - Ensure proper permissions for contact form submissions

  2. Policy Details
    - Allow anonymous users to insert contact inquiries
    - Allow authenticated users to read and insert contact inquiries
    - Maintain data security while enabling form functionality
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable anonymous contact form submissions" ON contact_inquiries;
DROP POLICY IF EXISTS "Enable authenticated contact form submissions" ON contact_inquiries;
DROP POLICY IF EXISTS "Authenticated users can read all inquiries" ON contact_inquiries;

-- Create new comprehensive policies
CREATE POLICY "Allow anonymous contact submissions"
  ON contact_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated contact submissions"
  ON contact_inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read inquiries"
  ON contact_inquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT ON contact_inquiries TO anon;
GRANT INSERT, SELECT ON contact_inquiries TO authenticated;