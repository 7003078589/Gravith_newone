// Simple test to check login functionality
const { AuthService } = require('./src/lib/auth-service');

async function testLogin() {
  console.log('Testing login functionality...');

  try {
    const response = await AuthService.login({
      username: 'admin',
      password: 'admin123',
    });

    console.log('Login response:', response);

    if (response.success) {
      console.log('✅ Login successful!');
      console.log('User:', response.data?.user);
      console.log('Organization:', response.data?.organization);
    } else {
      console.log('❌ Login failed:', response.error);
    }
  } catch (error) {
    console.error('❌ Login error:', error);
  }
}

testLogin();
