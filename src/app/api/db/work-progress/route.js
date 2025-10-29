// Vercel serverless function for work-progress API
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
    console.log('🏗️ API: Getting work progress data from database...');

    const { data: workProgress, error } = await supabaseAdmin
      .from('work_progress')
      .select('*')
      .order('work_date', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      console.log('🔄 Falling back to JSON data...');
      
      // Fallback to JSON data
      try {
        const fs = require('fs');
        const path = require('path');
        const workProgressData = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'public/work-progress-summary.json'), 'utf8'),
        );
        
        console.log(`✅ Found ${workProgressData.length} work progress records in JSON fallback`);
        
        return new Response(JSON.stringify({
          success: true,
          data: workProgressData,
          count: workProgressData.length,
          source: 'json_fallback',
        }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        console.error('❌ Error reading JSON fallback:', jsonError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to fetch work progress data from both database and JSON',
          details: error.message,
        }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`✅ Found ${workProgress?.length || 0} work progress records`);

    // If database is empty, fall back to JSON data
    if (!workProgress || workProgress.length === 0) {
      console.log('🔄 Database is empty, falling back to JSON data...');
      
      try {
        const fs = require('fs');
        const path = require('path');
        const workProgressData = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'public/work-progress-summary.json'), 'utf8'),
        );
        
        console.log(`✅ Found ${workProgressData.length} work progress records in JSON fallback`);
        
        return new Response(JSON.stringify({
          success: true,
          data: workProgressData,
          count: workProgressData.length,
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
      data: workProgress,
      count: workProgress.length,
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
