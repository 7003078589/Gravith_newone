const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking current database data...');

    // Check organizations
    const { data: orgs, error: orgError } = await supabaseAdmin.from('organizations').select('*');

    console.log('\n📋 Organizations:');
    if (orgError) {
      console.error('❌ Error:', orgError);
    } else {
      console.log(
        `✅ Found ${orgs.length} organizations:`,
        orgs.map((o) => o.name),
      );
    }

    // Check sites
    const { data: sites, error: siteError } = await supabaseAdmin.from('sites').select('*');

    console.log('\n📋 Sites:');
    if (siteError) {
      console.error('❌ Error:', siteError);
    } else {
      console.log(
        `✅ Found ${sites.length} sites:`,
        sites.map((s) => s.name),
      );
    }

    // Check vendors
    const { data: vendors, error: vendorError } = await supabaseAdmin.from('vendors').select('*');

    console.log('\n📋 Vendors:');
    if (vendorError) {
      console.error('❌ Error:', vendorError);
    } else {
      console.log(
        `✅ Found ${vendors.length} vendors:`,
        vendors.map((v) => v.name),
      );
    }

    // Check if we have any purchase/expense data in the database
    console.log('\n📋 Checking for purchase/expense data in database...');

    // Try to find any tables that might have our data
    const tables = ['purchases', 'expenses', 'material_purchases', 'site_expenses'];

    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin.from(table).select('count').limit(1);

        if (!error) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' error:`, error.message);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' not accessible`);
      }
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkDatabaseData();
