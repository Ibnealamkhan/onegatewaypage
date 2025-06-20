/*
  # Fix RLS policies for contact inquiries

  1. Security Updates
    - Drop existing INSERT policy that may be misconfigured
    - Create new INSERT policy for anonymous users with proper conditions
    - Ensure the policy allows public form submissions
    - Keep existing SELECT policy for authenticated users

  2. Changes
    - Remove potentially problematic INSERT policy
    - Add new INSERT policy with explicit permissions for anon role
    - Verify RLS is properly enabled
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Anyone can submit contact inquiries" ON contact_inquiries;

-- Recreate the INSERT policy with explicit conditions
CREATE POLICY "Allow anonymous contact form submissions"
  ON contact_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure RLS is enabled (should already be enabled based on schema)
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Verify the SELECT policy exists for authenticated users (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_inquiries' 
    AND policyname = 'Authenticated users can read all inquiries'
  ) THEN
    CREATE POLICY "Authenticated users can read all inquiries"
      ON contact_inquiries
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;