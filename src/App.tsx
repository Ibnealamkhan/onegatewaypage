import React, { useState, useEffect, Suspense } from 'react';
import { 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Users, 
  Smartphone,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Send,
  Check,
  Sparkles,
  ExternalLink,
  CreditCard,
  Wallet
} from 'lucide-react';
import { supabase, type ContactInquiry } from './lib/supabase';
import { 
  trackContactFormSubmission, 
  trackButtonClick, 
  trackModalOpen,
  trackSectionView 
} from './lib/analytics';
import { 
  sanitizeInput, 
  isValidEmail, 
  isValidPhone, 
  formRateLimiter,
  setupSecurityHeaders 
} from './lib/security';
import { 
  initPerformanceMonitoring, 
  preloadCriticalResources,
  registerServiceWorker 
} from './lib/performance';
import { 
  getUserTrackingData,
  hasTrackingConsent,
  type UserTrackingData 
} from './lib/userTracking';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Custom Logo Component
const Logo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg 
    className={className}
    viewBox="0 0 699.03 699.04" 
    xmlns="http://www.w3.org/2000/svg"
    aria-label="OneGateway Logo"
  >
    <defs>
      <linearGradient id="linear-gradient" x1="627.75" y1="636.27" x2="404.27" y2="363.69" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff"/>
        <stop offset="0.24" stopColor="#fcfeff"/>
        <stop offset="0.38" stopColor="#f4fbfe"/>
        <stop offset="0.5" stopColor="#e6f5fc"/>
        <stop offset="0.61" stopColor="#d1edf9"/>
        <stop offset="0.7" stopColor="#b7e3f5"/>
        <stop offset="0.79" stopColor="#97d6f1"/>
        <stop offset="0.88" stopColor="#70c7ec"/>
        <stop offset="0.96" stopColor="#45b6e6"/>
        <stop offset="1" stopColor="#29abe2"/>
      </linearGradient>
    </defs>
    <path fill="#206bc4" d="M500.29,150.85H609.45c3,0,5.92,0,8.88.07,4,.14,8.1-.14,11.92.77,3.18.77,6.45.33,9.59,1.46,2.34.84,5,.71,7.54,1.09,3.3.51,6.65.9,9.89,1.69,5.3,1.31,10.49,3.07,15.8,4.32,6.45,1.52,12.52,4.11,18.76,6.21A120.57,120.57,0,0,1,705,172c7,3.33,13.84,6.83,20.66,10.43,3.37,1.78,6.58,3.87,9.77,6,4.8,3.13,9.56,6.3,14.24,9.6,3,2.11,5.84,4.41,8.66,6.75,4.33,3.61,8.73,7.17,12.83,11,5.26,5,10.4,10.11,15.31,15.44,3.82,4.15,7.3,8.62,10.78,13.07,3.77,4.82,7.49,9.69,11,14.73,2.88,4.18,5.38,8.61,8,13,1.12,1.84,2.13,3.74,3.17,5.63,1.92,3.47,4,6.89,5.71,10.44s3.15,7,4.65,10.47c1.71,4,3.45,8,5,12.12,1.36,3.65,2.49,7.4,3.64,11.13,1.42,4.61,2.8,9.24,4.1,13.88.52,1.83.81,3.73,1.2,5.59s.76,3.55,1.12,5.34c.75,3.74,1.58,7.47,2.19,11.24.48,3.06.65,6.17,1,9.25.16,1.32.51,2.63.71,3.95.12.79.14,1.59.2,2.38.21,2.92-.34,5.9.86,8.74a5.63,5.63,0,0,1,.08,2.14q0,93,0,186,0,22.92-.07,45.83a34.74,34.74,0,0,1-.58,3.73c-.15,1.34-.21,2.7-.3,4.05-.15,2.37.34,4.8-.8,7.06a1.83,1.83,0,0,0-.08.71c-.33,3.41-.55,6.84-1,10.23-.33,2.43-1,4.82-1.49,7.23-.22,1.1-.25,2.23-.48,3.32-1,4.64-2,9.29-3.16,13.92-.8,3.31-1.61,6.63-2.66,9.87-1.54,4.75-3.29,9.43-5,14.14-1.19,3.29-2.28,6.63-3.69,9.83-2,4.58-4.18,9.11-6.46,13.58-2.67,5.24-5.41,10.45-8.33,15.55-2.34,4.06-4.91,8-7.53,11.88S802.83,749,800,752.79c-2.1,2.8-4.38,5.46-6.63,8.15-3,3.54-5.88,7.13-9,10.52-3.29,3.57-6.75,7-10.25,10.35-2.92,2.81-5.91,5.56-9,8.15-4.83,4-9.72,8-14.74,11.76-4.25,3.21-8.66,6.21-13.08,9.19-2.63,1.78-5.38,3.38-8.12,5a240.69,240.69,0,0,1-22.05,11.41c-5.34,2.44-10.8,4.64-16.27,6.77-4.65,1.82-9.37,3.45-14.1,5.06-2,.66-4,1.05-6,1.58-3.23.85-6.44,1.8-9.7,2.55s-6.52,1.29-9.78,1.93c-2.73.53-5.44,1.11-8.18,1.6-1.33.25-2.68.35-4,.51-5.91.71-11.79,1.71-17.77,1.73a23.23,23.23,0,0,0-3.26.58,15.71,15.71,0,0,1-2.37.22q-13.92,0-27.83,0H385.3a16.45,16.45,0,0,1-4.21-.59,28.66,28.66,0,0,0-6-.34c-1.74-.07-3.52.2-5.15-.72a2.41,2.41,0,0,0-.94-.15c-3.41-.33-6.83-.6-10.23-1-1.81-.21-3.6-.64-5.4-1-3-.52-6-.9-8.92-1.57-3.79-.86-7.52-1.95-11.28-2.94-1.23-.32-2.49-.56-3.7-.94-4.69-1.46-9.4-2.87-14-4.47q-7.44-2.58-14.76-5.51c-2.94-1.17-5.77-2.62-8.64-4-3.88-1.85-7.76-3.7-11.61-5.61-1.77-.89-3.48-1.91-5.19-2.91-3.84-2.24-7.74-4.4-11.48-6.81s-7.52-5.06-11.14-7.78c-5.36-4-10.75-8-15.82-12.36-5.25-4.5-10.2-9.35-15.19-14.15a231,231,0,0,1-19.29-21.83c-2.75-3.41-5.27-7-7.68-10.66-4-6-8-12.09-11.7-18.32a173.72,173.72,0,0,1-10.4-20.39c-1.93-4.53-4-9-5.82-13.57-1.36-3.4-2.51-6.88-3.62-10.37-1.37-4.31-2.64-8.65-3.89-13-.57-2-1-4-1.5-6a19.72,19.72,0,0,0-1.09-4.11c-1-2-.79-4.2-1.3-6.27-.58-2.39-.88-4.85-1.28-7.28-.24-1.49-.41-3-.62-4.48-.11-.79-.2-1.58-.33-2.36-.18-1-.42-2-.59-3-.29-1.71-.55-3.43-.82-5.15a7.46,7.46,0,0,1-.11-.95c-.23-6.54-.65-13.08-.65-19.63q-.07-109.65,0-219.3c0-6.55.42-13.09.64-19.64,1.46-3,.53-6.42,1.61-9.57.76-2.21.6-4.73,1.05-7.07.79-4.13,1.29-8.32,2.42-12.39s1.84-8.22,3-12.25q2.53-8.54,5.51-17c1.71-4.88,3.53-9.73,5.61-14.46,2.41-5.45,5.08-10.78,7.8-16.08,2.18-4.26,4.52-8.44,7-12.55,2.23-3.76,4.57-7.46,7.09-11,3.81-5.38,7.72-10.71,11.79-15.89a178,178,0,0,1,17.21-19.2c3.93-3.73,7.64-7.71,11.73-11.25,4.93-4.27,10.16-8.2,15.26-12.28,1.74-1.39,3.41-2.87,5.22-4.15,2.86-2,5.76-4,8.74-5.81,5.15-3.17,10.28-6.38,15.59-9.27s10.81-5.41,16.26-8c2.43-1.17,4.9-2.28,7.4-3.29,3.76-1.52,7.56-2.94,11.36-4.36,3.34-1.25,6.64-2.61,10.06-3.61,4.65-1.36,9.39-2.42,14.09-3.6,2.76-.69,5.5-1.51,8.29-2,4.86-.83,9.65-2,14.61-2.41a87.74,87.74,0,0,0,9.31-1.66,5.67,5.67,0,0,1,.72-.06c6.62-.23,13.24-.64,19.87-.65Q445.22,150.78,500.29,150.85Z" transform="translate(-150.91 -150.84)"/>
    <path fill="url(#linear-gradient)" d="M580.7,309.34V691.47c0,32.38-27.56,58.64-61.57,58.64s-61.57-26.26-61.57-58.64V433.4A56.06,56.06,0,0,0,479,420.65l83.87-79.88a51.85,51.85,0,0,0,16.39-37.67,51.14,51.14,0,0,0-1-10.17A55.71,55.71,0,0,1,580.7,309.34Z" transform="translate(-150.91 -150.84)"/>
    <path fill="#fff" fillOpacity="0.96" d="M579.34,303.1a53.11,53.11,0,0,1-15.61,37.67l-79.88,79.88a53.26,53.26,0,1,1-75.32-75.33l60.05-60.05,19.83-19.82a52.88,52.88,0,0,1,25.25-14.14,58.62,58.62,0,0,1,64.69,41.58s0,0,0,0A52.63,52.63,0,0,1,579.34,303.1Z" transform="translate(-150.91 -150.84)"/>
  </svg>
);

// Animated section component
const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div 
      ref={elementRef}
      className={`transition-all duration-1000 ${
        isIntersecting 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [userTrackingData, setUserTrackingData] = useState<UserTrackingData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  // Initialize performance monitoring and security
  useEffect(() => {
    // Hide loading screen immediately
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
    
    // Add app-loaded class to body
    document.body.classList.add('app-loaded');
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Register service worker
    registerServiceWorker();
    
    // Setup security headers
    setupSecurityHeaders();
    
    // Get user tracking data if consent is given
    if (hasTrackingConsent()) {
      getUserTrackingData().then(setUserTrackingData);
    }
    
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'OneGateway - Home',
        page_location: window.location.href
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track section views on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'clients', 'upi-apps', 'pricing', 'partners'];
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            trackSectionView(sectionId);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const sendTelegramNotification = async (contactData: Omit<ContactInquiry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram notification failed:', errorData);
        throw new Error(`Telegram notification failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Telegram notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Rate limiting
    const userIdentifier = formData.email;
    if (!formRateLimiter.isAllowed(userIdentifier)) {
      const remainingTime = Math.ceil(formRateLimiter.getRemainingTime(userIdentifier) / 1000);
      alert(`Please wait ${remainingTime} seconds before submitting again.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get fresh tracking data if not available
      let trackingData = userTrackingData;
      if (!trackingData && hasTrackingConsent()) {
        trackingData = await getUserTrackingData();
      }

      const contactData: Omit<ContactInquiry, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || null,
        message: formData.message.trim() || null,
        // Add client-side tracking data if available and consent is given
        ...(trackingData && hasTrackingConsent() && {
          device_type: trackingData.device_type || 'unknown',
          user_agent: trackingData.user_agent || null,
        })
      };

      // Send to Telegram notification function first to get enhanced data
      const telegramResult = await sendTelegramNotification(contactData);
      
      // Use enhanced data from Telegram function if available
      const finalContactData = telegramResult?.enhanced_data || contactData;

      // Submit to database - IP address and location will be determined server-side
      const { data, error } = await supabase
        .from('contact_inquiries')
        .insert([finalContactData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Contact inquiry submitted successfully:', data);
      
      // Track successful form submission
      trackContactFormSubmission({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company
      });
      
      // Show success popup and close contact form
      setShowContactForm(false);
      setShowSuccessPopup(true);
      setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      setFormErrors({});
      
      // Auto-hide success popup after 5 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your inquiry. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactButtonClick = (location: string) => {
    trackButtonClick('Contact Us', location);
    trackModalOpen('Contact Form');
    setShowContactForm(true);
  };

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Lowest Charges",
      description: "Only 0.10% transaction fee - the most competitive rate in the market",
      color: "bg-emerald-500" 
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Instant Settlement",
      description: "Real-time settlement within seconds, no waiting periods",
      color: "bg-blue-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "RBI Authorized",
      description: "Partnered with RBI-authorized payment gateways for maximum security",
      color: "bg-cyan-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "High Success Rate",
      description: "99.9% uptime with industry-leading transaction success rates",
      color: "bg-orange-500"
    }
  ];

  const partners = [
    { name: "Cashfree", logo: "cashfree.png", color: "bg-white", isImage: true },
    { name: "Sabpaisa", logo: "Group-47850-3.png", color: "bg-white", isImage: true },
    { name: "Razorpay", logo: "razor_pay_icon-ICtywSbN.png", color: "bg-white", isImage: true }
  ];

  const clients = [
    { name: "PePlus", logo: "https://play-lh.googleusercontent.com/1YDx0xZBLl4-my6klDo_Y-idM4HW4IHgnQkiijiUE-oblAZ4BN_a_93PAmqpEQs4QQoB=w240-h480-rw", color: "bg-white-600", description: "Mobile Recharge Platform" , url: "https://peplus.in/", isImage: true, isExternalImage: true},
    { name: "BillPe", logo: "https://play-lh.googleusercontent.com/QRh3SOM1KJv2S2IPWYfJH4cHBEADpgCc5sXWYI7TW4nGAFya0DFBn-TETFvWNqMWTyk", color: "bg-white-600", description: "Bill Payment Solutions" , url: "https://billpe.app/", isImage: true, isExternalImage: true},
    { name: "Pay2Back", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlDersm3uNoCFYDGNKgKDPXMN8yZgjXNe_8g&s", color: "bg-white-600", description: "Cashback & Recharge" , url: "https://pay2back.in/", isImage: true, isExternalImage: true  },
    { name: "BillHub", logo: "billhub-logo.jpg", color: "bg-white", description: "Multi-Service Platform", isImage: true, url: "https://app.billhub.in/" },
    { name: "Okpe", logo: "https://play-lh.googleusercontent.com/tBkY2pHRdp7a4bChtpPqjCpJTVm3VwimXV0D4hV4IH6W_8neCmM_6FrVLWxR-OCgryU", color: "bg-white", description: "Mobile Recharge App", url: "https://okpe.in/", isImage: true, isExternalImage: true }
  ];

  const upiApps = [
    {
      name: "PhonePe",
      logo: "phonepe-logo.svg",
      users: "450M+",
      color: "bg-purple-600",
      description: "India's leading UPI app",
      isLocal: true
    },
    {
      name: "Google Pay",
      logo: "googlepay-logo.svg",
      users: "150M+",
      color: "bg-blue-600",
      description: "Google's payment solution",
      isLocal: true
    },
    {
      name: "Paytm",
      logo: "paytm-logo.svg",
      users: "350M+",
      color: "bg-blue-500",
      description: "Digital payments pioneer",
      isLocal: true
    },
    {
      name: "Amazon Pay",
      logo: "amazonpay-logo.svg",
      users: "50M+",
      color: "bg-orange-500",
      description: "Amazon's payment service",
      isLocal: true
    },
    {
      name: "BHIM UPI",
      logo: "bhim-logo.svg",
      users: "100M+",
      color: "bg-green-600",
      description: "Government's UPI app",
      isLocal: true
    },
    {
      name: "Freecharge",
      logo: "freecharge-logo.svg",
      users: "50M+",
      color: "bg-yellow-500",
      description: "Mobile recharge & bills",
      isLocal: true
    },
    {
      name: "MobiKwik",
      logo: "mobikwik-logo.svg",
      users: "120M+",
      color: "bg-red-500",
      description: "Digital wallet & UPI",
      isLocal: true
    },
    {
      name: "WhatsApp Pay",
      logo: "whatsapp-logo.svg",
      users: "100M+",
      color: "bg-green-500",
      description: "WhatsApp integrated payments",
      isLocal: true
    }
  ];

  const stats = [
    { number: "500K+", label: "Transactions Daily" },
    { number: "99.9%", label: "Uptime" },
    { number: "0.10%", label: "Transaction Fee" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        {/* Success Popup Modal */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full transform animate-bounce">
              {/* Success Animation */}
              <div className="text-center mb-6">
                <div className="relative mx-auto w-20 h-20 mb-4">
                  {/* Animated background circle */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                  {/* Success checkmark */}
                  <div className="relative flex items-center justify-center w-full h-full">
                    <Check className="h-10 w-10 text-white animate-bounce" />
                  </div>
                  {/* Sparkle effects */}
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-spin" />
                  </div>
                  <div className="absolute -bottom-2 -left-2">
                    <Sparkles className="h-4 w-4 text-blue-400 animate-ping" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Message Sent Successfully! 🎉
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Thank you for reaching out! Our team will review your inquiry and get back to you within 24 hours.
                </p>
              </div>

              {/* Success details */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-green-800 font-medium">
                    Confirmation email sent to your inbox
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-800 font-medium">
                    Our team will call you soon
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Got it!
                </button>
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                    handleContactButtonClick('success-popup');
                  }}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Another
                </button>
              </div>

              {/* Auto-close indicator */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center text-xs text-gray-500">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-2 animate-pulse"></div>
                  This popup will close automatically in a few seconds
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
                <button 
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                  aria-label="Close contact form"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-describedby={formErrors.name ? 'name-error' : undefined}
                  />
                  {formErrors.name && (
                    <p id="name-error" className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-describedby={formErrors.email ? 'email-error' : undefined}
                  />
                  {formErrors.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                  />
                  {formErrors.phone && (
                    <p id="phone-error" className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Tell us about your requirements..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={`fixed w-full z-40 transition-all duration-300 ${
          scrollY > 50 ? 'bg-white shadow-lg' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                    <Logo className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">onegateway</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
                <a href="#clients" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Clients</a>
                <a href="#upi-apps" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">UPI Apps</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
                <a href="#partners" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Partners</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
                <button 
                  onClick={() => handleContactButtonClick('navigation')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Contact Us
                </button>
              </div>

              <div className="md:hidden">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">Features</a>
                <a href="#clients" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">Clients</a>
                <a href="#upi-apps" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">UPI Apps</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
                <a href="#partners" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">Partners</a>
                <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
                <button 
                  onClick={() => handleContactButtonClick('mobile-menu')}
                  className="w-full text-left bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 rounded-lg font-medium"
                >
                  Contact Us
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full px-4 py-2 text-sm font-medium text-blue-800">
                    <Star className="h-4 w-4 mr-2" />
                    RBI Authorized Payment Gateway Partner
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Recharge Apps
                    </span>
                    <br />
                    Made Simple
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Power your mobile recharge business with India's most affordable payment gateway. 
                    Only <span className="font-bold text-green-600">0.10% charges</span> with 
                    <span className="font-bold text-blue-600"> instant settlement</span>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleContactButtonClick('hero-cta')}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  >
                    Contact Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 pt-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection className="relative">
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-3">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Transaction Fee</span>
                      <span className="text-3xl font-bold text-green-600">0.10%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Settlement Time</span>
                      <span className="text-lg font-semibold text-blue-600">Instant</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="text-lg font-semibold text-cyan-600">99.9%</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Mobile Recharge Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Gateway?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built specifically for recharge applications with industry-leading features and reliability
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <AnimatedSection 
                  key={index}
                  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                >
                  <div className={`${feature.color} rounded-lg p-3 w-fit mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Clients Section */}
        <section id="clients" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Leading Brands
              </h2>
              <p className="text-xl text-gray-600">
                Powering recharge and bill payment platforms across India
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {clients.map((client, index) => {
                const ClientCard = (
                  <AnimatedSection 
                    className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2 ${
                      client.url ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className={`${client.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${
                      client.isImage ? 'border border-gray-200 overflow-hidden' : 'text-white text-lg font-bold'
                    }`}>
                      {client.isImage ? (
                        <img 
                          src={client.isExternalImage ? client.logo : `/${client.logo}`}
                          alt={client.name}
                          className="w-12 h-12 object-contain rounded-full"
                          crossOrigin={client.isExternalImage ? "anonymous" : undefined}
                          loading="lazy"
                        />
                      ) : (
                        client.logo
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center justify-center">
                      {client.name}
                      {client.url && <ExternalLink className="h-4 w-4 ml-2 text-gray-400" />}
                    </h3>
                    <p className="text-sm text-gray-600">{client.description}</p>
                  </AnimatedSection>
                );

                return client.url ? (
                  <a 
                    key={index}
                    href={client.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {ClientCard}
                  </a>
                ) : (
                  <div key={index}>
                    {ClientCard}
                  </div>
                );
              })}
            </div>

            <AnimatedSection className="mt-12 text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full px-6 py-3">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Join 100+ successful businesses</span>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* UPI Apps Section */}
        <section id="upi-apps" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Compatible with All UPI Apps
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our payment gateway seamlessly integrates with all major UPI applications, ensuring maximum reach for your customers
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-12">
              {upiApps.map((app, index) => (
                <AnimatedSection 
                  key={index}
                  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 hover:border-blue-200 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={app.isLocal ? `/${app.logo}` : app.logo}
                      alt={`${app.name} logo`}
                      className="w-full h-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{app.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{app.description}</p>
                  <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full px-3 py-1">
                    <Users className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-xs font-medium text-blue-800">{app.users} users</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full p-3">
                    <Wallet className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Universal UPI Compatibility
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Your customers can pay using any UPI app of their choice. Our gateway supports all major UPI applications, 
                  providing flexibility and convenience for seamless transactions.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">8+</div>
                    <div className="text-sm text-gray-600">UPI Apps</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">1B+</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                    <div className="text-sm text-gray-600">Availability</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">100%</div>
                    <div className="text-sm text-gray-600">Compatible</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Partners Section */}
        <section id="partners" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                RBI Authorized Partners
              </h2>
              <p className="text-xl text-gray-600">
                Integrated with India's most trusted payment gateway providers
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {partners.map((partner, index) => (
                <AnimatedSection 
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-gray-100 hover:border-blue-200"
                >
                  <div className={`${partner.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${partner.isImage ? 'border border-gray-200' : ''}`}>
                    {partner.isImage ? (
                      <img 
                        src={`/${partner.logo}`} 
                        alt={partner.name}
                        className="w-12 h-12 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">{partner.logo}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{partner.name}</h3>
                  <p className="text-gray-600 mt-2">RBI Authorized</p>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="mt-12 text-center">
              <div className="inline-flex items-center bg-green-100 rounded-full px-6 py-3">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">100% Secure & Compliant</span>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600">
                No hidden fees, no setup costs, no monthly charges
              </p>
            </AnimatedSection>

            <AnimatedSection className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold mb-4">Pay Per Transaction</h3>
                  <div className="text-6xl font-bold mb-2">0.10%</div>
                  <p className="text-xl opacity-90">Per successful transaction</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 rounded-lg p-4">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-semibold">No Setup Fee</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-semibold">No Monthly Charges</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-semibold">Instant Settlement</div>
                  </div>
                </div>

                <button 
                  onClick={() => handleContactButtonClick('pricing-cta')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Contact Us Now
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Recharge Business?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of businesses already using our payment gateway for their mobile recharge applications
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => handleContactButtonClick('cta-primary')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Contact Us
                </button>
                <button 
                  onClick={() => handleContactButtonClick('cta-secondary')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
                >
                  Get Quote
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                    <Logo className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">onegateway</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Empowering mobile recharge businesses with the most affordable and reliable payment gateway solution in India.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-400" />
                    <a href="tel:+916001011509" className="hover:text-white transition-colors">+916001011509</a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <a href="mailto:support@onegateway.in" className="hover:text-white transition-colors">support@onegateway.in</a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    <span>Dhekiajuli,Sonitpur,Assam-784110</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li>
                    <button 
                      onClick={() => handleContactButtonClick('footer')}
                      className="hover:text-white transition-colors"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">&copy; 2025 onegateway. All rights reserved.</p>
              
              {/* Footer Logo */}
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">Powered by</span>
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                  <Logo className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-300 font-medium">onegateway</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;