// User tracking utilities for collecting device and location information

export interface UserTrackingData {
  ip_address?: string;
  device_type: string;
  user_agent: string;
  region?: string;
  city?: string;
  country?: string;
}

// Detect device type from user agent
export const detectDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  } else if (/desktop|windows|macintosh|linux/i.test(ua)) {
    return 'desktop';
  }
  
  return 'unknown';
};

// Get user's IP address and location data
export const getUserLocationData = async (): Promise<Partial<UserTrackingData>> => {
  try {
    // Use a free IP geolocation service
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();
    
    return {
      ip_address: data.ip || undefined,
      region: data.region || data.region_code || undefined,
      city: data.city || undefined,
      country: data.country_code || 'IN', // Default to India
    };
  } catch (error) {
    console.warn('Failed to get location data:', error);
    return {
      country: 'IN' // Default fallback
    };
  }
};

// Get comprehensive user tracking data
export const getUserTrackingData = async (): Promise<UserTrackingData> => {
  const userAgent = navigator.userAgent;
  const deviceType = detectDeviceType(userAgent);
  
  // Get location data
  const locationData = await getUserLocationData();
  
  return {
    device_type: deviceType,
    user_agent: userAgent,
    ...locationData,
  };
};

// Privacy-compliant IP address hashing (optional)
export const hashIP = async (ip: string): Promise<string> => {
  if (!ip) return '';
  
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + 'onegateway-salt'); // Add salt for security
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('Failed to hash IP:', error);
    return '';
  }
};

// Check if user has consented to tracking (GDPR compliance)
export const hasTrackingConsent = (): boolean => {
  try {
    return localStorage.getItem('tracking-consent') === 'true';
  } catch {
    return true; // Default to true for Indian users
  }
};

// Set tracking consent
export const setTrackingConsent = (consent: boolean): void => {
  try {
    localStorage.setItem('tracking-consent', consent.toString());
  } catch (error) {
    console.warn('Failed to set tracking consent:', error);
  }
};