// Vercel serverless function for purchases API
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch purchases from database',
        details: error.message,
      });
    }

    console.log(`✅ Found ${purchases?.length || 0} purchases`);
    return res.status(200).json({
      success: true,
      data: purchases || [],
      count: purchases?.length || 0,
    });
  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
}
