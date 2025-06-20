/*
  # Telegram Notification Setup for Contact Inquiries

  1. Database Changes
    - Create function to handle Telegram notifications
    - Set up trigger to call notification function on new contact inquiries
    - Use proper JSON handling for HTTP requests

  2. Functionality
    - When new contact inquiry is inserted, trigger calls Edge Function
    - Edge Function sends Telegram message with contact details
    - Proper error handling and logging
*/

-- Create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION notify_telegram_on_contact_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
  auth_header text;
BEGIN
  -- Build the function URL (will be updated with actual project reference)
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/telegram-notify';
  
  -- Build the authorization header
  auth_header := 'Bearer ' || current_setting('app.settings.service_role_key', true);
  
  -- Call the Edge Function via HTTP with proper JSON formatting
  BEGIN
    SELECT INTO request_id
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', auth_header
        ),
        body := jsonb_build_object(
          'name', NEW.name,
          'email', NEW.email,
          'phone', NEW.phone,
          'company', NEW.company,
          'message', NEW.message,
          'created_at', NEW.created_at
        )
      );
    
    -- Log successful notification attempt
    RAISE NOTICE 'Telegram notification sent for contact inquiry ID: %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send Telegram notification for contact inquiry ID: %. Error: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS contact_inquiry_telegram_notification ON contact_inquiries;

-- Create the trigger that calls our function
CREATE TRIGGER contact_inquiry_telegram_notification
  AFTER INSERT ON contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION notify_telegram_on_contact_inquiry();

-- Grant necessary permissions for the function to work
GRANT USAGE ON SCHEMA net TO postgres;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres;