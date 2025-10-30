const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration (neutralized for mock-only mode)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
}

async function testSupabaseConnection() {
  if (!supabase) {
    console.log('ℹ️ Supabase not configured; running in mock-only mode.');
    return false;
  }
  try {
    console.log('🔌 Testing Supabase connection...');
    const { error } = await supabase.from('organizations').select('count').limit(1);
    if (error) {
      console.log('⚠️ Organizations table not found or query failed.');
    } else {
      console.log('✅ Supabase connection successful!');
    }
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

module.exports = { supabase, supabaseAdmin, testSupabaseConnection };
