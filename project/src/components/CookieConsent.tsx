import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    onAccept();
    trackEvent('Cookie Consent', 'Accept');
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    onDecline();
    trackEvent('Cookie Consent', 'Decline');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-slide-up">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 pr-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookie Consent</h3>
            <p className="text-gray-600 text-sm">
              We use cookies to analyze site usage and improve our services. By clicking "Accept", 
              you consent to our use of cookies. See our{' '}
              <button 
                onClick={() => trackEvent('Privacy Policy', 'View', 'Cookie Banner')}
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                Privacy Policy
              </button>{' '}
              for more information.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Accept
            </button>
          </div>
          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}