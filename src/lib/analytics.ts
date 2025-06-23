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

// Google Analytics Events (via GTM)
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  trackGTMEvent('custom_event', {
    event_name: eventName,
    ...parameters
  });
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
  trackAdRollEvent('click', { button_name: buttonName, location });
};

export const trackSectionView = (sectionName: string) => {
  const eventData = {
    event_category: 'Engagement',
    event_label: sectionName,
    section_name: sectionName
  };

  trackGTMEvent('section_view', eventData);
  trackAdRollEvent('view_content', { content_name: sectionName });
};

export const trackModalOpen = (modalName: string) => {
  const eventData = {
    event_category: 'Engagement',
    event_label: modalName,
    modal_type: modalName
  };

  trackGTMEvent('modal_open', eventData);
  
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
};

export const trackPageView = (pageName: string) => {
  const eventData = {
    page_title: pageName,
    page_location: window.location.href
  };

  trackGTMEvent('page_view', eventData);
  trackPixelEvent('PageView');
  trackAdRollEvent('pageView');
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
};

// User engagement tracking
export const trackUserEngagement = (engagementType: string, details?: Record<string, any>) => {
  trackGTMEvent('user_engagement', {
    event_category: 'User Behavior',
    engagement_type: engagementType,
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

  trackAdRollEvent('download', {
    file_name: fileName,
    file_type: fileType
  });
};

// External link tracking
export const trackExternalLink = (url: string, linkText: string) => {
  trackGTMEvent('click', {
    event_category: 'External Links',
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