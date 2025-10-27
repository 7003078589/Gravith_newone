const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Test connection function
async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');

    // Test with a simple query
    const { data, error } = await supabase.from('organizations').select('count').limit(1);

    if (error) {
      console.log('⚠️  Organizations table not found (expected if schema not created yet)');
      console.log('📋 This is normal - you need to run the schema.sql script first');
    } else {
      console.log('✅ Supabase connection successful!');
    }

    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  testSupabaseConnection,
};
