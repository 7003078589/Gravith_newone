// API configuration for different environments
export const getApiUrl = (endpoint: string): string => {
  // Check if we're in production (Vercel) or development
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env['VERCEL'] === '1' ||
    (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));
  
  // In production (Vercel), API calls go to the same domain
  // In development, they go to localhost:3001
  const baseUrl = isProduction ? '' : 'http://localhost:3001';
  
  const fullUrl = `${baseUrl}${endpoint}`;
  
  // Debug logging
  console.log('🔧 API Config Debug:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env['VERCEL'],
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
    isProduction,
    baseUrl,
    endpoint,
    fullUrl
  });

  return fullUrl;
};

// Specific API endpoints
export const API_ENDPOINTS = {
  // Database API endpoints
  PURCHASES: '/api/db/purchases',
  EXPENSES: '/api/db/expenses',
  SITES: '/api/db/sites',
  VEHICLES: '/api/db/vehicles',
  VENDORS: '/api/db/vendors',
  SUMMARY: '/api/db/summary',

  // Auth endpoints
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  CURRENT_USER: '/api/auth/me',

  // Health check
  HEALTH: '/api/health',
} as const;
