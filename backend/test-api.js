const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3001';

  console.log('🚀 Testing Backend API Endpoints...');
  console.log('📋 Base URL:', baseURL);
  console.log('');

  try {
    // Test health endpoint
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test organizations endpoint
    console.log('2. Testing Organizations API...');
    const orgsResponse = await axios.get(`${baseURL}/api/organizations`);
    console.log('✅ Organizations API:', orgsResponse.data);
    console.log('');

    // Test sites endpoint
    console.log('3. Testing Sites API...');
    const sitesResponse = await axios.get(`${baseURL}/api/sites?organization_id=test`);
    console.log('✅ Sites API:', sitesResponse.data);
    console.log('');

    console.log('🎉 All API endpoints are working!');
    console.log('📋 Backend is ready for frontend connection!');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running');
      console.log('🔧 Start the server with: npm run dev');
    } else {
      console.log('❌ API Error:', error.message);
    }
  }
}

testAPI();
