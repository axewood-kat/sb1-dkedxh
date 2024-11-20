import { loadStripe } from '@stripe/stripe-js';

// Ensure we're using the correct environment variable
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY) {
  throw new Error('Missing VITE_STRIPE_PUBLIC_KEY environment variable');
}

let stripePromise: Promise<any> | null = null;

export const getStripe = async () => {
  if (!stripePromise) {
    try {
      stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }
      return stripe;
    } catch (error) {
      console.error('Stripe initialization error:', error);
      throw error;
    }
  }
  return stripePromise;
};