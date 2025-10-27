const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...');

    // Check organizations table
    console.log('\n📋 Organizations table:');
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .limit(1);

    if (orgError) {
      console.error('❌ Organizations error:', orgError);
    } else {
      console.log('✅ Organizations columns:', Object.keys(orgData[0] || {}));
    }

    // Check sites table
    console.log('\n📋 Sites table:');
    const { data: siteData, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('*')
      .limit(1);

    if (siteError) {
      console.error('❌ Sites error:', siteError);
    } else {
      console.log('✅ Sites columns:', Object.keys(siteData[0] || {}));
    }

    // Check vendors table
    console.log('\n📋 Vendors table:');
    const { data: vendorData, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .limit(1);

    if (vendorError) {
      console.error('❌ Vendors error:', vendorError);
    } else {
      console.log('✅ Vendors columns:', Object.keys(vendorData[0] || {}));
    }

    // Check materials table
    console.log('\n📋 Materials table:');
    const { data: materialData, error: materialError } = await supabaseAdmin
      .from('materials')
      .select('*')
      .limit(1);

    if (materialError) {
      console.error('❌ Materials error:', materialError);
    } else {
      console.log('✅ Materials columns:', Object.keys(materialData[0] || {}));
    }

    // Check vehicles table
    console.log('\n📋 Vehicles table:');
    const { data: vehicleData, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .limit(1);

    if (vehicleError) {
      console.error('❌ Vehicles error:', vehicleError);
    } else {
      console.log('✅ Vehicles columns:', Object.keys(vehicleData[0] || {}));
    }

    // Check purchases table
    console.log('\n📋 Purchases table:');
    const { data: purchaseData, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .limit(1);

    if (purchaseError) {
      console.error('❌ Purchases error:', purchaseError);
    } else {
      console.log('✅ Purchases columns:', Object.keys(purchaseData[0] || {}));
    }

    // Check expenses table
    console.log('\n📋 Expenses table:');
    const { data: expenseData, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .limit(1);

    if (expenseError) {
      console.error('❌ Expenses error:', expenseError);
    } else {
      console.log('✅ Expenses columns:', Object.keys(expenseData[0] || {}));
    }
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();
