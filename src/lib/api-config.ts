// API configuration for different environments
export const getApiUrl = (endpoint: string): string => {
  // Always use same-origin; mock routes and public assets are served by Next.js
  const baseUrl = '';
  const fullUrl = `${baseUrl}${endpoint}`;
  return fullUrl;
};

// Specific API endpoints
export const API_ENDPOINTS = {
  // Database API endpoints (mocked via Next.js routes or handled by component fallbacks)
  PURCHASES: '/api/db/purchases',
  EXPENSES: '/api/db/expenses',
  SITES: '/api/db/sites',
  VEHICLES: '/api/db/vehicles',
  VENDORS: '/api/db/vendors',
  WORK_PROGRESS: '/api/db/work-progress',
  SUMMARY: '/api/db/summary',

  // Auth endpoints
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  CURRENT_USER: '/api/auth/me',

  // Health check
  HEALTH: '/api/health',
} as const;
