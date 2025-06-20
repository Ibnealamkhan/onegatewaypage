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
  ip_address?: string;
  device_type?: string;
  user_agent?: string;
  region?: string;
  city?: string;
  country?: string;
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
      ip_address,
      device_type,
      user_agent,
      region,
      city,
      country
    }: ContactFormData = await req.json();

    // Format the message for Telegram with additional tracking info
    let telegramMessage = `
🔔 *New Contact Form Submission*

👤 *Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone}
${company ? `🏢 *Company:* ${company}` : ''}
${message ? `💬 *Message:* ${message}` : ''}

📊 *User Analytics:*
${ip_address ? `🌐 *IP:* ${ip_address}` : ''}
${device_type ? `📱 *Device:* ${device_type}` : ''}
${city ? `🏙️ *City:* ${city}` : ''}
${region ? `📍 *Region:* ${region}` : ''}
${country ? `🇮🇳 *Country:* ${country}` : ''}

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
        message: 'Telegram notification sent successfully',
        telegram_message_id: telegramResult.message_id 
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