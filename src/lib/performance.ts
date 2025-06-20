// Performance monitoring and optimization utilities

// Lazy loading utility
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(importFunc);
};

// Image optimization utility
export const optimizeImage = (src: string, width?: number, height?: number) => {
  if (!src) return src;
  
  // For external images, add optimization parameters
  if (src.startsWith('http')) {
    const url = new URL(src);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', '80'); // Quality
    url.searchParams.set('f', 'webp'); // Format
    return url.toString();
  }
  
  return src;
};

// Performance observer for Core Web Vitals
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint
  const observeLCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      // Track LCP
      if (window.gtag) {
        window.gtag('event', 'LCP', {
          event_category: 'Web Vitals',
          value: Math.round(lastEntry.startTime),
          non_interaction: true,
        });
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  };

  // First Input Delay
  const observeFID = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (window.gtag) {
          window.gtag('event', 'FID', {
            event_category: 'Web Vitals',
            value: Math.round(entry.processingStart - entry.startTime),
            non_interaction: true,
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  };

  // Cumulative Layout Shift
  const observeCLS = () => {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      if (window.gtag) {
        window.gtag('event', 'CLS', {
          event_category: 'Web Vitals',
          value: Math.round(clsValue * 1000),
          non_interaction: true,
        });
      }
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
  };

  // Initialize observers
  try {
    observeLCP();
    observeFID();
    observeCLS();
  } catch (error) {
    console.warn('Performance monitoring not supported:', error);
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  fontLink.as = 'style';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preconnect to external domains
  const preconnectDomains = [
    'https://www.googletagmanager.com',
    'https://connect.facebook.net',
    'https://images.pexels.com',
    'https://play-lh.googleusercontent.com'
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};