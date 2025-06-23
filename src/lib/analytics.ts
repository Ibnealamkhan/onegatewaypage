// Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    dataLayer: any[];
    adroll: any;
  }
}

// Google Tag Manager Events
export const trackGTMEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters
    });
  }
};

// Google Analytics 4 Events (via gtag)
export const trackGA4Event = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      // Send to both GA4 and Google Ads
      send_to: ['G-Q60G3QRWJW', 'AW-17260057723']
    });
  }
};

// Google Ads Conversion Tracking
export const trackGoogleAdsConversion = (conversionLabel: string, value?: number, currency = 'INR') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `AW-17260057723/${conversionLabel}`,
      'value': value,
      'currency': currency
    });
  }
};

// Google Analytics Events (via GTM)
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  trackGTMEvent('custom_event', {
    event_name: eventName,
    ...parameters
  });
  
  // Also track via GA4 directly
  trackGA4Event(eventName, parameters);
};

// Meta Pixel Events
export const trackPixelEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// AdRoll Events
export const trackAdRollEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.adroll) {
    window.adroll.track(eventName, parameters);
  }
};

// Combined tracking function
export const trackConversion = (eventName: string, parameters?: Record<string, any>) => {
  trackEvent(eventName, parameters);
  trackPixelEvent(eventName, parameters);
  trackAdRollEvent(eventName, parameters);
  trackGTMEvent('conversion', {
    event_name: eventName,
    ...parameters
  });
  
  // Track Google Ads conversion for contact form submissions
  if (eventName === 'contact_form_submit') {
    trackGoogleAdsConversion('contact_form_conversion', 1);
  }
};

// Specific event trackers
export const trackContactFormSubmission = (formData: {
  name: string;
  email: string;
  phone: string;
  company?: string;
}) => {
  const eventData = {
    event_category: 'Contact',
    event_label: 'Form Submission',
    value: 1,
    has_company: !!formData.company,
    form_type: 'contact_inquiry'
  };

  // Google Tag Manager
  trackGTMEvent('contact_form_submit', eventData);
  
  // Google Analytics 4
  trackGA4Event('generate_lead', {
    currency: 'INR',
    value: 1,
    ...eventData
  });
  
  // Google Ads Conversion
  trackGoogleAdsConversion('contact_form_conversion', 1);
  
  // Meta Pixel - Lead event
  trackPixelEvent('Lead', {
    content_name: 'Contact Form',
    content_category: 'Lead Generation',
    value: 1,
    currency: 'INR'
  });

  // AdRoll - Lead event
  trackAdRollEvent('lead', {
    conversion_value: 1,
    currency: 'INR',
    email: formData.email
  });
};

export const trackButtonClick = (buttonName: string, location: string) => {
  const eventData = {
    event_category: 'Engagement',
    event_label: buttonName,
    button_location: location,
    button_name: buttonName
  };

  trackGTMEvent('button_click', eventData);
  trackGA4Event('click', eventData);
  trackAdRollEvent('click', { button_name: buttonName, location });
  
  // Track Google Ads conversion for CTA button clicks
  if (buttonName === 'Contact Us' && ['hero-cta', 'pricing-cta', 'cta-primary'].includes(location)) {
    trackGoogleAdsConversion('cta_click_conversion');
  }
};

export const trackSectionView = (sectionName: string) => {
  const eventData = {
    event_category: 'Engagement',
    event_label: sectionName,
    section_name: sectionName
  };

  trackGTMEvent('section_view', eventData);
  trackGA4Event('view_item', {
    item_name: sectionName,
    item_category: 'Website Section'
  });
  trackAdRollEvent('view_content', { content_name: sectionName });
};

export const trackModalOpen = (modalName: string) => {
  const eventData = {
    event_category: 'Engagement',
    event_label: modalName,
    modal_type: modalName
  };

  trackGTMEvent('modal_open', eventData);
  trackGA4Event('view_item', {
    item_name: modalName,
    item_category: 'Modal'
  });
  
  // Meta Pixel - ViewContent event
  trackPixelEvent('ViewContent', {
    content_name: modalName,
    content_type: 'modal'
  });

  // AdRoll - ViewContent event
  trackAdRollEvent('view_content', {
    content_name: modalName,
    content_type: 'modal'
  });
  
  // Track Google Ads conversion for contact modal opens
  if (modalName === 'Contact Form') {
    trackGoogleAdsConversion('modal_open_conversion');
  }
};

export const trackPageView = (pageName: string) => {
  const eventData = {
    page_title: pageName,
    page_location: window.location.href
  };

  trackGTMEvent('page_view', eventData);
  trackPixelEvent('PageView');
  trackAdRollEvent('pageView');
  
  // Track Google Analytics 4 page view
  trackGA4Event('page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
  
  // Track Google Ads page view
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'AW-17260057723', {
      page_title: pageName,
      page_location: window.location.href
    });
    
    window.gtag('config', 'G-Q60G3QRWJW', {
      page_title: pageName,
      page_location: window.location.href
    });
  }
};

// Enhanced ecommerce tracking
export const trackPurchase = (transactionData: {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}) => {
  trackGTMEvent('purchase', {
    event_category: 'Ecommerce',
    ...transactionData
  });
  
  trackGA4Event('purchase', {
    transaction_id: transactionData.transaction_id,
    value: transactionData.value,
    currency: transactionData.currency,
    items: transactionData.items
  });
  
  trackPixelEvent('Purchase', {
    value: transactionData.value,
    currency: transactionData.currency,
    content_ids: transactionData.items.map(item => item.item_id),
    content_type: 'product'
  });

  trackAdRollEvent('purchase', {
    conversion_value: transactionData.value,
    currency: transactionData.currency,
    order_id: transactionData.transaction_id
  });
  
  // Track Google Ads purchase conversion
  trackGoogleAdsConversion('purchase_conversion', transactionData.value, transactionData.currency);
};

// User engagement tracking
export const trackUserEngagement = (engagementType: string, details?: Record<string, any>) => {
  trackGTMEvent('user_engagement', {
    event_category: 'User Behavior',
    engagement_type: engagementType,
    ...details
  });

  trackGA4Event('user_engagement', {
    engagement_time_msec: details?.engagement_time || 0,
    ...details
  });

  trackAdRollEvent('engagement', {
    engagement_type: engagementType,
    ...details
  });
};

// Scroll tracking
export const trackScrollDepth = (scrollPercentage: number) => {
  trackGTMEvent('scroll', {
    event_category: 'User Behavior',
    scroll_depth: scrollPercentage
  });

  trackGA4Event('scroll', {
    percent_scrolled: scrollPercentage
  });

  // Track significant scroll milestones with AdRoll
  if ([25, 50, 75, 100].includes(scrollPercentage)) {
    trackAdRollEvent('scroll', {
      scroll_depth: scrollPercentage
    });
  }
};

// File download tracking
export const trackFileDownload = (fileName: string, fileType: string) => {
  trackGTMEvent('file_download', {
    event_category: 'Downloads',
    file_name: fileName,
    file_type: fileType
  });

  trackGA4Event('file_download', {
    file_name: fileName,
    file_extension: fileType
  });

  trackAdRollEvent('download', {
    file_name: fileName,
    file_type: fileType
  });
  
  // Track Google Ads download conversion
  trackGoogleAdsConversion('download_conversion');
};

// External link tracking
export const trackExternalLink = (url: string, linkText: string) => {
  trackGTMEvent('click', {
    event_category: 'External Links',
    link_url: url,
    link_text: linkText,
    outbound: true
  });

  trackGA4Event('click', {
    link_url: url,
    link_text: linkText,
    outbound: true
  });

  trackAdRollEvent('click', {
    link_url: url,
    link_text: linkText,
    link_type: 'external'
  });
};

// AdRoll specific tracking functions
export const trackAdRollIdentify = (email: string, additionalData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.adroll) {
    window.adroll.identify({
      email: email,
      ...additionalData
    });
  }
};

export const trackAdRollCustomEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.adroll) {
    window.adroll.track(eventName, properties);
  }
};

// Phone call tracking
export const trackPhoneCall = (phoneNumber: string) => {
  trackGTMEvent('phone_call', {
    event_category: 'Contact',
    phone_number: phoneNumber
  });
  
  trackGA4Event('contact', {
    method: 'phone',
    phone_number: phoneNumber
  });
  
  trackGoogleAdsConversion('phone_call_conversion');
  
  trackPixelEvent('Contact', {
    content_name: 'Phone Call',
    content_category: 'Contact'
  });
  
  trackAdRollEvent('contact', {
    contact_method: 'phone',
    phone_number: phoneNumber
  });
};

// Email click tracking
export const trackEmailClick = (emailAddress: string) => {
  trackGTMEvent('email_click', {
    event_category: 'Contact',
    email_address: emailAddress
  });
  
  trackGA4Event('contact', {
    method: 'email',
    email_address: emailAddress
  });
  
  trackGoogleAdsConversion('email_click_conversion');
  
  trackPixelEvent('Contact', {
    content_name: 'Email Click',
    content_category: 'Contact'
  });
  
  trackAdRollEvent('contact', {
    contact_method: 'email',
    email_address: emailAddress
  });
};