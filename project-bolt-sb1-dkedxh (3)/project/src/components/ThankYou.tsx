import React from 'react';
import { Heart } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <Heart className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Thank You for Your Support!</h1>
        <p className="text-gray-600 mb-6">
          Your donation helps us maintain and improve the NZ Leave Calculator, keeping it free and accessible for everyone.
        </p>
        <a
          href="/"
          className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Return to Calculator
        </a>
      </div>
    </div>
  );
}