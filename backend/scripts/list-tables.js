const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function listTables() {
  try {
    console.log('🔍 Listing all tables...');

    // Try to query information_schema to get table names
    const { data, error } = await supabaseAdmin.rpc('get_table_names');

    if (error) {
      console.log('❌ RPC error, trying direct queries...');

      // Try common table names
      const tables = [
        'organizations',
        'sites',
        'vendors',
        'materials',
        'vehicles',
        'purchases',
        'expenses',
        'material_purchases',
        'site_expenses',
        'users',
        'contracts',
        'payments',
        'work_progress',
        'tenders',
      ];

      for (const table of tables) {
        try {
          const { data: tableData, error: tableError } = await supabaseAdmin
            .from(table)
            .select('*')
            .limit(1);

          if (!tableError) {
            console.log(
              `✅ Table '${table}' exists with columns:`,
              Object.keys(tableData[0] || {}),
            );
          } else {
            console.log(`❌ Table '${table}' error:`, tableError.message);
          }
        } catch (err) {
          console.log(`❌ Table '${table}' not found`);
        }
      }
    } else {
      console.log('✅ Tables found:', data);
    }
  } catch (error) {
    console.error('❌ List tables failed:', error);
  }
}

listTables();
