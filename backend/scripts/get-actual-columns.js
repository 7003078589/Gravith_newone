const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function getActualColumns() {
  try {
    console.log('🔍 Getting actual table columns...');

    // Get vendors columns (we know this works)
    console.log('\n📋 Vendors table columns:');
    const { data: vendorData, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .limit(1);

    if (!vendorError && vendorData.length > 0) {
      console.log('✅ Vendors columns:', Object.keys(vendorData[0]));
    }

    // Get materials columns
    console.log('\n📋 Materials table columns:');
    const { data: materialData, error: materialError } = await supabaseAdmin
      .from('materials')
      .select('*')
      .limit(1);

    if (!materialError && materialData.length > 0) {
      console.log('✅ Materials columns:', Object.keys(materialData[0]));
    } else {
      console.log('❌ Materials error:', materialError?.message);
    }

    // Get vehicles columns
    console.log('\n📋 Vehicles table columns:');
    const { data: vehicleData, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .limit(1);

    if (!vehicleError && vehicleData.length > 0) {
      console.log('✅ Vehicles columns:', Object.keys(vehicleData[0]));
    } else {
      console.log('❌ Vehicles error:', vehicleError?.message);
    }

    // Get material_purchases columns
    console.log('\n📋 Material_purchases table columns:');
    const { data: purchaseData, error: purchaseError } = await supabaseAdmin
      .from('material_purchases')
      .select('*')
      .limit(1);

    if (!purchaseError && purchaseData.length > 0) {
      console.log('✅ Material_purchases columns:', Object.keys(purchaseData[0]));
    } else {
      console.log('❌ Material_purchases error:', purchaseError?.message);
    }

    // Get expenses columns
    console.log('\n📋 Expenses table columns:');
    const { data: expenseData, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .limit(1);

    if (!expenseError && expenseData.length > 0) {
      console.log('✅ Expenses columns:', Object.keys(expenseData[0]));
    } else {
      console.log('❌ Expenses error:', expenseError?.message);
    }
  } catch (error) {
    console.error('❌ Get columns failed:', error);
  }
}

getActualColumns();
