import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { getStripe } from '../lib/stripe';

interface DonateButtonProps {
  show: boolean;
}

export default function DonateButton({ show }: DonateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!show) return null;

  const handleDonation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stripe = await getStripe();
      
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 500, // Fixed $5 donation
          currency: 'nzd'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      if (!sessionId) {
        throw new Error('Invalid checkout session');
      }

      const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });
      if (redirectError) {
        throw redirectError;
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Payment failed. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 
                   transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          <span>Donate $5</span>
        </button>

        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}