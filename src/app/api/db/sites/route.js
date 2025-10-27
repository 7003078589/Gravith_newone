// Vercel serverless function for sites API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    console.log('🏗️ API: Getting sites data from database...');

    const { data: sites, error } = await supabaseAdmin
      .from('sites')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch sites from database',
        details: error.message,
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ Found ${sites?.length || 0} sites`);
    return new Response(JSON.stringify({
      success: true,
      data: sites || [],
      count: sites?.length || 0,
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message,
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}