// User tracking utilities for collecting device and location information

export interface UserTrackingData {
  device_type: string;
  user_agent: string;
  // Note: IP address and location will be determined server-side
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

// Get client-side tracking data (device type and user agent)
export const getUserTrackingData = async (): Promise<UserTrackingData> => {
  const userAgent = navigator.userAgent;
  const deviceType = detectDeviceType(userAgent);
  
  return {
    device_type: deviceType,
    user_agent: userAgent,
  };
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