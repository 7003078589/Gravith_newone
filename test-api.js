// Test script to check API configuration
const { getApiUrl, API_ENDPOINTS } = require('./src/lib/api-config.ts');

console.log('Testing API configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('API_ENDPOINTS.VENDORS:', API_ENDPOINTS.VENDORS);
console.log('Generated URL:', getApiUrl(API_ENDPOINTS.VENDORS));