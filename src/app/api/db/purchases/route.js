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
      console.log('🔄 Falling back to JSON data...');
      
      // Fallback to JSON data
      try {
        const fs = await import('fs');
        const path = await import('path');
        const purchaseData = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'public/purchase-summary.json'), 'utf8'),
        );
        
        console.log(`✅ Found ${purchaseData.length} purchase records in JSON fallback`);
        
        return new Response(JSON.stringify({
          success: true,
          data: purchaseData,
          count: purchaseData.length,
          source: 'json_fallback',
        }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        console.error('❌ Error reading JSON fallback:', jsonError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to fetch purchase data from both database and JSON',
          details: error.message,
        }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`✅ Found ${purchases?.length || 0} purchases`);

    // If database is empty, fall back to JSON data
    if (!purchases || purchases.length === 0) {
      console.log('🔄 Database is empty, falling back to JSON data...');
      
      try {
        const fs = await import('fs');
        const path = await import('path');
        const purchaseData = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'public/purchase-summary.json'), 'utf8'),
        );
        
        console.log(`✅ Found ${purchaseData.length} purchase records in JSON fallback`);
        
        return new Response(JSON.stringify({
          success: true,
          data: purchaseData,
          count: purchaseData.length,
          source: 'json_fallback',
        }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        console.error('❌ Error reading JSON fallback:', jsonError);
        // Return empty data if JSON fallback also fails
        return new Response(JSON.stringify({
          success: true,
          data: [],
          count: 0,
          source: 'database_empty',
        }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: purchases,
      count: purchases.length,
      source: 'database',
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
