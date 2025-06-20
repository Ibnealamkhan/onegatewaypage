/*
  # Fix RLS policy for contact inquiries

  1. Security Changes
    - Drop the existing INSERT policy that may have incorrect conditions
    - Create a new INSERT policy that properly allows anonymous users to submit contact forms
    - Ensure the policy has the correct WITH CHECK condition

  This migration fixes the "new row violates row-level security policy" error
  by ensuring anonymous users can insert contact inquiries.
*/

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Allow anonymous contact form submissions" ON contact_inquiries;

-- Create a new policy that allows anonymous users to insert contact inquiries
CREATE POLICY "Allow anonymous contact form submissions"
  ON contact_inquiries
  FOR INSERT
  TO anon
  WITH CHECK (true);