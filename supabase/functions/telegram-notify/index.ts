const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  device_type?: string;
  user_agent?: string;
}

// Function to get IP geolocation data
async function getLocationFromIP(ip: string) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'OneGateway/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      region: data.region || data.region_code || null,
      city: data.city || null,
      country: data.country_code || 'IN'
    };
  } catch (error) {
    console.warn('Failed to get location data:', error);
    return {
      region: null,
      city: null,
      country: 'IN'
    };
  }
}

// Function to detect device type from user agent
function detectDeviceType(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  } else if (/desktop|windows|macintosh|linux/i.test(ua)) {
    return 'desktop';
  }
  
  return 'unknown';
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { 
      name, 
      email, 
      phone, 
      company, 
      message,
      device_type,
      user_agent
    }: ContactFormData = await req.json();

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    req.headers.get('cf-connecting-ip') || 
                    'unknown';

    // Get location data from IP
    const locationData = await getLocationFromIP(clientIP);

    // Detect device type if not provided
    const finalDeviceType = device_type || detectDeviceType(user_agent || '');

    // Store the enhanced data in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const contactData = {
      name,
      email,
      phone,
      company: company || null,
      message: message || null,
      ip_address: clientIP !== 'unknown' ? clientIP : null,
      device_type: finalDeviceType,
      user_agent: user_agent || null,
      region: locationData.region,
      city: locationData.city,
      country: locationData.country
    };

    // Insert into database
    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/contact_inquiries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(contactData)
    });

    if (!dbResponse.ok) {
      const errorText = await dbResponse.text();
      console.error('Database insert error:', errorText);
      throw new Error(`Database error: ${dbResponse.status}`);
    }

    // Format the message for Telegram with additional tracking info
    let telegramMessage = `
🔔 *New Contact Form Submission*

👤 *Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone}
${company ? `🏢 *Company:* ${company}` : ''}
${message ? `💬 *Message:* ${message}` : ''}

📊 *User Analytics:*
${clientIP !== 'unknown' ? `🌐 *IP:* ${clientIP}` : ''}
${finalDeviceType ? `📱 *Device:* ${finalDeviceType}` : ''}
${locationData.city ? `🏙️ *City:* ${locationData.city}` : ''}
${locationData.region ? `📍 *Region:* ${locationData.region}` : ''}
${locationData.country ? `🇮🇳 *Country:* ${locationData.country}` : ''}

⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
🌐 *Source:* OneGateway Website
    `.trim();

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot7769880320:AAGE_xQH2ymqMs_VqSRF1nIew0Y3hHWivp4/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: '1090595464',
        text: telegramMessage,
        parse_mode: 'Markdown'
      }),
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('Telegram API error:', errorText);
      throw new Error(`Telegram notification failed: ${telegramResponse.status}`);
    }

    const telegramResult = await telegramResponse.json();
    console.log('Telegram notification sent successfully:', telegramResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact inquiry processed successfully',
        telegram_message_id: telegramResult.message_id,
        location_data: locationData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in telegram-notify function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process contact inquiry',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});