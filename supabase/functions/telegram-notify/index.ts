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
  ip_address?: string;
  region?: string;
  city?: string;
  country?: string;
}

// Function to get IP geolocation data
async function getLocationFromIP(ip: string) {
  try {
    // Use a free IP geolocation service
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,query`, {
      headers: {
        'User-Agent': 'OneGateway/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        region: data.regionName || data.region || null,
        city: data.city || null,
        country: data.countryCode || 'IN'
      };
    } else {
      throw new Error('Geolocation API returned failure status');
    }
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

    const requestData: ContactFormData = await req.json();
    
    // Get client IP address from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                    req.headers.get('x-real-ip') || 
                    req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-client-ip') ||
                    'unknown';

    // Get user agent from headers if not provided in request
    const userAgent = requestData.user_agent || req.headers.get('user-agent') || '';

    // Get location data from IP if not already provided
    let locationData = {
      region: requestData.region,
      city: requestData.city,
      country: requestData.country || 'IN'
    };

    if (clientIP !== 'unknown' && (!locationData.region || !locationData.city)) {
      const geoData = await getLocationFromIP(clientIP);
      locationData = {
        region: locationData.region || geoData.region,
        city: locationData.city || geoData.city,
        country: locationData.country || geoData.country
      };
    }

    // Detect device type if not provided
    const deviceType = requestData.device_type || detectDeviceType(userAgent);

    // Prepare the complete contact data
    const enhancedContactData = {
      ...requestData,
      ip_address: clientIP !== 'unknown' ? clientIP : null,
      device_type: deviceType,
      user_agent: userAgent || null,
      region: locationData.region,
      city: locationData.city,
      country: locationData.country
    };

    // Format the message for Telegram with all available information
    let telegramMessage = `
🔔 *New Contact Form Submission*

👤 *Name:* ${enhancedContactData.name}
📧 *Email:* ${enhancedContactData.email}
📱 *Phone:* ${enhancedContactData.phone}
${enhancedContactData.company ? `🏢 *Company:* ${enhancedContactData.company}` : ''}
${enhancedContactData.message ? `💬 *Message:* ${enhancedContactData.message}` : ''}

📊 *User Analytics:*
${enhancedContactData.ip_address ? `🌐 *IP:* ${enhancedContactData.ip_address}` : ''}
${enhancedContactData.device_type ? `📱 *Device:* ${enhancedContactData.device_type}` : ''}
${enhancedContactData.city ? `🏙️ *City:* ${enhancedContactData.city}` : ''}
${enhancedContactData.region ? `📍 *Region:* ${enhancedContactData.region}` : ''}
${enhancedContactData.country ? `🇮🇳 *Country:* ${enhancedContactData.country}` : ''}

⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
🌐 *Source:* OneGateway Website
    `.trim();

    // Send to Telegram
    const telegramBotToken = '7769880320:AAGE_xQH2ymqMs_VqSRF1nIew0Y3hHWivp4';
    const telegramChatId = '1090595464';
    const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: telegramMessage,
        parse_mode: 'Markdown'
      }),
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('Telegram API error:', errorText);
      throw new Error(`Telegram notification failed: ${telegramResponse.status} - ${errorText}`);
    }

    const telegramResult = await telegramResponse.json();
    console.log('Telegram notification sent successfully:', telegramResult);

    // Return the enhanced contact data so the client can store it in the database
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Telegram notification sent successfully',
        telegram_message_id: telegramResult.message_id,
        enhanced_data: enhancedContactData
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
        error: 'Failed to send Telegram notification',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});