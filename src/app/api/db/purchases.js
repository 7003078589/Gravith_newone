// Vercel serverless function for purchases API
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
    console.log('📦 API: Getting purchase data from database...');

    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select(
        `
        *,
        vendors!inner(name),
        materials!inner(name),
        sites!inner(name),
        vehicles(registration_number)
      `,
      )
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch purchases from database',
        details: error.message,
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ Found ${purchases?.length || 0} purchases`);
    return new Response(JSON.stringify({
      success: true,
      data: purchases || [],
      count: purchases?.length || 0,
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
