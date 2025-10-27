const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testDatabase() {
  console.log('🔍 Testing database connection and tables...');

  try {
    // Test organizations table
    console.log('\n📋 Testing organizations table...');
    const { data: orgs, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .limit(1);

    if (orgError) {
      console.error('❌ Organizations table error:', orgError.message);
    } else {
      console.log('✅ Organizations table exists');
      console.log(`   Found ${orgs.length} organizations`);
    }

    // Test sites table
    console.log('\n📋 Testing sites table...');
    const { data: sites, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('*')
      .limit(1);

    if (siteError) {
      console.error('❌ Sites table error:', siteError.message);
    } else {
      console.log('✅ Sites table exists');
      console.log(`   Found ${sites.length} sites`);
    }

    // Test vendors table
    console.log('\n📋 Testing vendors table...');
    const { data: vendors, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .limit(1);

    if (vendorError) {
      console.error('❌ Vendors table error:', vendorError.message);
    } else {
      console.log('✅ Vendors table exists');
      console.log(`   Found ${vendors.length} vendors`);
    }

    // Test materials table
    console.log('\n📋 Testing materials table...');
    const { data: materials, error: materialError } = await supabaseAdmin
      .from('materials')
      .select('*')
      .limit(1);

    if (materialError) {
      console.error('❌ Materials table error:', materialError.message);
    } else {
      console.log('✅ Materials table exists');
      console.log(`   Found ${materials.length} materials`);
    }

    // Test vehicles table
    console.log('\n📋 Testing vehicles table...');
    const { data: vehicles, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .limit(1);

    if (vehicleError) {
      console.error('❌ Vehicles table error:', vehicleError.message);
    } else {
      console.log('✅ Vehicles table exists');
      console.log(`   Found ${vehicles.length} vehicles`);
    }

    // Test purchases table
    console.log('\n📋 Testing purchases table...');
    const { data: purchases, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .limit(1);

    if (purchaseError) {
      console.error('❌ Purchases table error:', purchaseError.message);
    } else {
      console.log('✅ Purchases table exists');
      console.log(`   Found ${purchases.length} purchases`);
    }

    // Test expenses table
    console.log('\n📋 Testing expenses table...');
    const { data: expenses, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .limit(1);

    if (expenseError) {
      console.error('❌ Expenses table error:', expenseError.message);
    } else {
      console.log('✅ Expenses table exists');
      console.log(`   Found ${expenses.length} expenses`);
    }

    console.log('\n🎯 Database test complete!');

    if (
      orgError ||
      siteError ||
      vendorError ||
      materialError ||
      vehicleError ||
      purchaseError ||
      expenseError
    ) {
      console.log('\n❌ Some tables are missing or have errors.');
      console.log(
        '📋 Please run the final-complete-schema.sql script in Supabase SQL Editor first!',
      );
    } else {
      console.log('\n✅ All tables exist and are accessible!');
      console.log('📋 You can now run: node scripts/insert-simple-data.js');
    }
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };
