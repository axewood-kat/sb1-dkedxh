import ReactGA from 'react-ga4';

// Initialize GA4 with your measurement ID
export const initGA = () => {
  ReactGA.initialize('G-XXXXXXXXXX'); // Replace with your GA4 measurement ID
};

// Track page views
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track events
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
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