import React from 'react';
import { Heart } from 'lucide-react';

interface DonateButtonProps {
  show: boolean;
}

export default function DonateButton({ show }: DonateButtonProps) {
  if (!show) return null;

  const handleDonation = () => {
    alert('Donation feature coming soon! Thank you for your interest in supporting us.');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Support Our Work</h3>
          <p className="text-sm text-gray-600">Help us keep this calculator free for everyone</p>
        </div>

        <button
          onClick={handleDonation}
          className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 
                   transition-colors flex items-center justify-center gap-2"
        >
          <Heart className="h-4 w-4" />
          <span>Donate $5</span>
        </button>
      </div>
    </div>
  );
}