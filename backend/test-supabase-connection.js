const { supabase, testSupabaseConnection } = require('./config/supabase');

async function testConnection() {
  console.log('🚀 Testing Supabase Client Connection...');
  console.log('📋 Note: You need to add your Supabase API keys to .env file');
  console.log('📋 Get them from: Supabase Dashboard → Settings → API');
  console.log('');

  const success = await testSupabaseConnection();

  if (success) {
    console.log('');
    console.log('✅ Supabase client is ready!');
    console.log('📋 Next steps:');
    console.log('1. Add your Supabase API keys to .env file');
    console.log('2. Execute schema.sql in Supabase SQL Editor');
    console.log('3. Start your backend server');
  } else {
    console.log('');
    console.log('❌ Connection failed');
    console.log('📋 Make sure to add your Supabase API keys to .env file');
  }
}

testConnection();
