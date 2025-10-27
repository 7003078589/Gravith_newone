// Vercel serverless function for vehicles API
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
    console.log('🚛 API: Getting vehicles data from database...');

    const { data: vehicles, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .order('registration_number', { ascending: true });

    if (error) {
      console.error('❌ Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles from database',
        details: error.message,
      });
    }

    console.log(`✅ Found ${vehicles?.length || 0} vehicles`);
    return res.status(200).json({
      success: true,
      data: vehicles || [],
      count: vehicles?.length || 0,
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
