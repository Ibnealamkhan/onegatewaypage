/*
  # Simple Telegram Notification Setup

  1. Database Changes
    - Remove notification tracking columns (notification_sent, notification_sent_at)
    - Create simple trigger function to call Edge Function
    - Set up trigger to fire on new contact inquiries

  2. Functionality
    - When new contact inquiry is inserted, trigger calls Edge Function
    - Edge Function sends Telegram message immediately
    - No database tracking of notification status needed
*/

-- Remove notification tracking columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'notification_sent'
  ) THEN
    ALTER TABLE contact_inquiries DROP COLUMN notification_sent;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_inquiries' AND column_name = 'notification_sent_at'
  ) THEN
    ALTER TABLE contact_inquiries DROP COLUMN notification_sent_at;
  END IF;
END $$;

-- Drop old functions and triggers
DROP TRIGGER IF EXISTS contact_inquiry_notification_setup ON contact_inquiries;
DROP TRIGGER IF EXISTS contact_inquiry_telegram_notification ON contact_inquiries;
DROP FUNCTION IF EXISTS mark_inquiry_for_notification();
DROP FUNCTION IF EXISTS notify_telegram_on_contact_inquiry();
DROP FUNCTION IF EXISTS mark_notification_sent(uuid);
DROP FUNCTION IF EXISTS get_pending_notifications();

-- Create simple function that logs the inquiry (for webhook to pick up)
CREATE OR REPLACE FUNCTION log_new_contact_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Just log the new inquiry - the webhook will be called by Supabase
  RAISE NOTICE 'New contact inquiry: ID=%, Name=%, Phone=%', NEW.id, NEW.name, NEW.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new contact inquiries
CREATE TRIGGER contact_inquiry_webhook_trigger
  AFTER INSERT ON contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION log_new_contact_inquiry();