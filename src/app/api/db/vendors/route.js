// Vercel serverless function for vendors API
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
    console.log('🏪 API: Getting vendors data from database...');

    const { data: vendors, error } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch vendors from database',
        details: error.message,
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ Found ${vendors?.length || 0} vendors`);
    return new Response(JSON.stringify({
      success: true,
      data: vendors || [],
      count: vendors?.length || 0,
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