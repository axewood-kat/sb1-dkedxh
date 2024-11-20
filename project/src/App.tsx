import React, { useEffect, useState } from 'react';
import { Calculator, HelpCircle } from 'lucide-react';
import PayslipCalculator from './components/PayslipCalculator';
import CookieConsent from './components/CookieConsent';
import PrivacyNotice from './components/PrivacyNotice';
import InstructionsPanel from './components/InstructionsPanel';
import { initGA, trackPageView, trackEvent } from './utils/analytics';

export default function App() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'accepted') {
      initGA();
      setAnalyticsEnabled(true);
    }
  }, []);

  const handleCookieAccept = () => {
    initGA();
    setAnalyticsEnabled(true);
    trackPageView(window.location.pathname);
  };

  const handleCookieDecline = () => {
    setAnalyticsEnabled(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white p-3 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-200">
              <Calculator className="h-8 w-8 md:h-10 md:w-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              NZ Leave Calculator
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Check your sick leave and holiday pay are calculated correctly for NZ
          </p>
          <button
            onClick={() => {
              setIsInstructionsOpen(true);
              analyticsEnabled && trackEvent('Instructions', 'Open');
            }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span>How to Use This Calculator</span>
          </button>
        </header>
        <PayslipCalculator />
      </div>

      <footer className="mt-16 py-8 bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            This calculator is provided for informational purposes only. For official guidance, please consult{' '}
            <a 
              href="https://www.employment.govt.nz" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-600 hover:text-emerald-700"
              onClick={() => analyticsEnabled && trackEvent('External Link', 'Click', 'Employment NZ')}
            >
              Employment New Zealand
            </a>.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Privacy Policy
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => {
                localStorage.removeItem('cookieConsent');
                window.location.reload();
              }}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </footer>

      <CookieConsent
        onAccept={handleCookieAccept}
        onDecline={handleCookieDecline}
      />
      
      <PrivacyNotice
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <InstructionsPanel
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />
    </div>
  );
}