// Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

// Google Analytics Events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Meta Pixel Events
export const trackPixelEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Combined tracking function
export const trackConversion = (eventName: string, parameters?: Record<string, any>) => {
  trackEvent(eventName, parameters);
  trackPixelEvent(eventName, parameters);
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
    custom_parameters: {
      has_company: !!formData.company,
      form_type: 'contact_inquiry'
    }
  };

  // Google Analytics
  trackEvent('contact_form_submit', eventData);
  
  // Meta Pixel - Lead event
  trackPixelEvent('Lead', {
    content_name: 'Contact Form',
    content_category: 'Lead Generation',
    value: 1,
    currency: 'INR'
  });
};

export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('button_click', {
    event_category: 'Engagement',
    event_label: buttonName,
    custom_parameters: {
      button_location: location
    }
  });
};

export const trackSectionView = (sectionName: string) => {
  trackEvent('section_view', {
    event_category: 'Engagement',
    event_label: sectionName,
    custom_parameters: {
      section_name: sectionName
    }
  });
};

export const trackModalOpen = (modalName: string) => {
  trackEvent('modal_open', {
    event_category: 'Engagement',
    event_label: modalName,
    custom_parameters: {
      modal_type: modalName
    }
  });
  
  // Meta Pixel - ViewContent event
  trackPixelEvent('ViewContent', {
    content_name: modalName,
    content_type: 'modal'
  });
};

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
  
  trackPixelEvent('PageView');
};