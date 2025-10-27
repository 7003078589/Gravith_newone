const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structure...');

    // Check if we can insert a simple record to test structure
    console.log('\n📋 Testing vendors table...');
    const { data: vendorData, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .insert({
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Vendor',
        contact_person: 'Test Contact',
        email: 'test@example.com',
        phone: '+91-9876543210',
        address: 'Test Address',
        status: 'active',
      })
      .select();

    if (vendorError) {
      console.error('❌ Vendors insert error:', vendorError);
    } else {
      console.log('✅ Vendors insert successful:', vendorData);
    }

    // Check materials table
    console.log('\n📋 Testing materials table...');
    const { data: materialData, error: materialError } = await supabaseAdmin
      .from('materials')
      .insert({
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Material',
        unit: 'Ton',
        category: 'Test Category',
        status: 'active',
      })
      .select();

    if (materialError) {
      console.error('❌ Materials insert error:', materialError);
    } else {
      console.log('✅ Materials insert successful:', materialData);
    }

    // Check vehicles table
    console.log('\n📋 Testing vehicles table...');
    const { data: vehicleData, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .insert({
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
        registration_number: 'TEST123',
        vehicle_type: 'Test Type',
        model: 'Test Model',
        status: 'active',
      })
      .select();

    if (vehicleError) {
      console.error('❌ Vehicles insert error:', vehicleError);
    } else {
      console.log('✅ Vehicles insert successful:', vehicleData);
    }

    // Check material_purchases table
    console.log('\n📋 Testing material_purchases table...');
    const { data: purchaseData, error: purchaseError } = await supabaseAdmin
      .from('material_purchases')
      .insert({
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        vendor_id: 'test-vendor-id',
        material_id: 'test-material-id',
        purchase_id: 'TEST-PURCHASE-001',
        purchase_date: new Date().toISOString(),
        quantity: 10,
        unit: 'Ton',
        rate: 100,
        total_amount: 1000,
        status: 'completed',
      })
      .select();

    if (purchaseError) {
      console.error('❌ Material purchases insert error:', purchaseError);
    } else {
      console.log('✅ Material purchases insert successful:', purchaseData);
    }

    // Check expenses table
    console.log('\n📋 Testing expenses table...');
    const { data: expenseData, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .insert({
        organization_id: '550e8400-e29b-41d4-a716-446655440000',
        site_id: '550e8400-e29b-41d4-a716-446655440001',
        expense_id: 'TEST-EXPENSE-001',
        expense_date: new Date().toISOString(),
        category: 'Fuel',
        description: 'Test expense',
        amount: 500,
        status: 'approved',
      })
      .select();

    if (expenseError) {
      console.error('❌ Expenses insert error:', expenseError);
    } else {
      console.log('✅ Expenses insert successful:', expenseData);
    }
  } catch (error) {
    console.error('❌ Table structure check failed:', error);
  }
}

checkTableStructure();
