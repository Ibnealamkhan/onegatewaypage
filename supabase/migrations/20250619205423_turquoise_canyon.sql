/*
  # Create Database Webhook for Telegram Notifications

  1. Database Changes
    - Create a webhook that triggers when new contact inquiries are inserted
    - The webhook will call our Edge Function to send Telegram notifications

  2. Security
    - Webhook is configured to trigger only on INSERT operations
    - Uses the service role for authentication
*/

-- Create the webhook for contact inquiries
-- This will trigger whenever a new row is inserted into contact_inquiries table
SELECT
  net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/send-telegram-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := json_build_object('record', NEW)::jsonb
  ) AS request_id;

-- Note: The above is a template. In practice, we'll use a database trigger
-- to call the webhook function whenever a new contact inquiry is created.

-- Create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION notify_telegram_on_contact_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the Edge Function via HTTP
  SELECT INTO request_id
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/send-telegram-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that calls our function
DROP TRIGGER IF EXISTS contact_inquiry_telegram_notification ON contact_inquiries;
CREATE TRIGGER contact_inquiry_telegram_notification
  AFTER INSERT ON contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_telegram_on_contact_inquiry();