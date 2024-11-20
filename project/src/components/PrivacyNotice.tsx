import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyNotice({ isOpen, onClose }: PrivacyNoticeProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-800">Privacy Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Information We Collect</h3>
            <p className="text-gray-600">
              We collect anonymous usage data to improve our service, including:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
              <li>Pages visited</li>
              <li>Calculation attempts and results</li>
              <li>Error occurrences</li>
              <li>Browser type and version</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">How We Use Your Data</h3>
            <p className="text-gray-600">
              We use the collected data to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
              <li>Improve our calculator's accuracy and usability</li>
              <li>Fix errors and technical issues</li>
              <li>Understand how users interact with the calculator</li>
              <li>Generate anonymous usage statistics</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Cookies</h3>
            <p className="text-gray-600">
              We use essential cookies to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
              <li>Remember your cookie consent preference</li>
              <li>Track anonymous usage statistics via Google Analytics</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Rights</h3>
            <p className="text-gray-600">
              You have the right to:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
              <li>Decline non-essential cookies</li>
              <li>Request information about the data we collect</li>
              <li>Request deletion of your data</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Us</h3>
            <p className="text-gray-600">
              For privacy-related inquiries, please contact us at:{' '}
              <a href="mailto:privacy@example.com" className="text-emerald-600 hover:text-emerald-700">
                privacy@example.com
              </a>
            </p>
          </section>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}