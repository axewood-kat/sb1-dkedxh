import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Initialize GA4 with measurement ID
export const initGA = () => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

// Track events
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// Track calculation attempts
export const trackCalculation = (success: boolean, errorType?: string) => {
  trackEvent(
    'Calculation',
    success ? 'Success' : 'Error',
    errorType
  );
};

// Track form interactions
export const trackFormInteraction = (fieldName: string, action: 'focus' | 'change' | 'blur') => {
  trackEvent(
    'Form Interaction',
    action,
    fieldName
  );
};

// Track results interactions
export const trackResultsInteraction = (action: string) => {
  trackEvent(
    'Results',
    action
  );
};

// Track error occurrences
export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent(
    'Error',
    errorType,
    errorMessage
  );
};