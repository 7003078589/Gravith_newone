// API configuration for different environments
export const getApiUrl = (endpoint: string): string => {
  // In production (Vercel), API calls go to the same domain
  // In development, they go to localhost:3001
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? '' // Same domain in production
      : 'http://localhost:3001'; // Local backend in development

  return `${baseUrl}${endpoint}`;
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
