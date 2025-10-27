// Test API endpoints
const testApi = async () => {
  try {
    console.log('Testing API endpoints...');
    
    // Test vehicles endpoint
    const response = await fetch('/api/db/vehicles');
    console.log('Vehicles API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Vehicles API Response:', data);
    } else {
      console.error('Vehicles API Error:', response.statusText);
    }
    
    // Test vendors endpoint
    const vendorsResponse = await fetch('/api/db/vendors');
    console.log('Vendors API Status:', vendorsResponse.status);
    
    if (vendorsResponse.ok) {
      const vendorsData = await vendorsResponse.json();
      console.log('Vendors API Response:', vendorsData);
    } else {
      console.error('Vendors API Error:', vendorsResponse.statusText);
    }
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
};

// Run test
testApi();
