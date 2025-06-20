/*
  # Fix RLS policy for contact form submissions

  1. Security Updates
    - Drop existing INSERT policy for contact_inquiries
    - Create new INSERT policy that properly allows anonymous submissions
    - Ensure the policy covers all required scenarios for contact form submissions

  2. Policy Details
    - Allow anonymous users to insert contact inquiries
    - No restrictions on the data being inserted (public contact form)
    - Maintains security while enabling functionality
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow anonymous contact form submissions" ON contact_inquiries;

-- Create a new INSERT policy that allows anonymous users to submit contact forms
CREATE POLICY "Enable anonymous contact form submissions"
  ON contact_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Ensure the policy also works for authenticated users who might submit forms
CREATE POLICY "Enable authenticated contact form submissions"
  ON contact_inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);