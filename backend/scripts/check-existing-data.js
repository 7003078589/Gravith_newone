const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkExistingData() {
  console.log('🔍 Checking existing data in database...');

  try {
    // Check organizations
    const { data: orgs, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name');

    if (orgError) {
      console.error('❌ Error fetching organizations:', orgError);
    } else {
      console.log(`✅ Organizations: ${orgs.length}`);
      orgs.forEach((org) => console.log(`   - ${org.name} (${org.id})`));
    }

    // Check sites
    const { data: sites, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id, name, organization_id');

    if (siteError) {
      console.error('❌ Error fetching sites:', siteError);
    } else {
      console.log(`✅ Sites: ${sites.length}`);
      sites.forEach((site) => console.log(`   - ${site.name} (${site.id})`));
    }

    // Check vendors
    const { data: vendors, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('id, name, organization_id');

    if (vendorError) {
      console.error('❌ Error fetching vendors:', vendorError);
    } else {
      console.log(`✅ Vendors: ${vendors.length}`);
      vendors.forEach((vendor) => console.log(`   - ${vendor.name} (${vendor.id})`));
    }

    // Check materials
    const { data: materials, error: materialError } = await supabaseAdmin
      .from('materials')
      .select('id, name, organization_id');

    if (materialError) {
      console.error('❌ Error fetching materials:', materialError);
    } else {
      console.log(`✅ Materials: ${materials.length}`);
      materials.forEach((material) => console.log(`   - ${material.name} (${material.id})`));
    }

    // Check vehicles
    const { data: vehicles, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .select('id, registration_number, vehicle_type, organization_id');

    if (vehicleError) {
      console.error('❌ Error fetching vehicles:', vehicleError);
    } else {
      console.log(`✅ Vehicles: ${vehicles.length}`);
      vehicles
        .slice(0, 10)
        .forEach((vehicle) =>
          console.log(`   - ${vehicle.registration_number} (${vehicle.vehicle_type})`),
        );
      if (vehicles.length > 10) {
        console.log(`   ... and ${vehicles.length - 10} more vehicles`);
      }
    }

    // Check purchases
    const { data: purchases, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .select('id, purchase_id, purchase_date, total_amount, organization_id');

    if (purchaseError) {
      console.error('❌ Error fetching purchases:', purchaseError);
    } else {
      console.log(`✅ Purchases: ${purchases.length}`);
      if (purchases.length > 0) {
        const totalAmount = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
        console.log(`   - Total Purchase Value: ₹${totalAmount.toLocaleString()}`);
        console.log(
          `   - Sample Purchase: ${purchases[0].purchase_id} - ₹${purchases[0].total_amount}`,
        );
      }
    }

    // Check expenses
    const { data: expenses, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('id, expense_id, expense_date, amount, organization_id');

    if (expenseError) {
      console.error('❌ Error fetching expenses:', expenseError);
    } else {
      console.log(`✅ Expenses: ${expenses.length}`);
      if (expenses.length > 0) {
        const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        console.log(`   - Total Expense Value: ₹${totalAmount.toLocaleString()}`);
        console.log(`   - Sample Expense: ${expenses[0].expense_id} - ₹${expenses[0].amount}`);
      }
    }

    console.log('\n🎯 Data Summary:');
    console.log(`   - Organizations: ${orgs?.length || 0}`);
    console.log(`   - Sites: ${sites?.length || 0}`);
    console.log(`   - Vendors: ${vendors?.length || 0}`);
    console.log(`   - Materials: ${materials?.length || 0}`);
    console.log(`   - Vehicles: ${vehicles?.length || 0}`);
    console.log(`   - Purchase Records: ${purchases?.length || 0}`);
    console.log(`   - Expense Records: ${expenses?.length || 0}`);

    if (purchases && purchases.length > 0 && expenses && expenses.length > 0) {
      console.log('\n🎉 Your real data is already in the database!');
      console.log('📋 You can now start the API server and view the data in the frontend.');
    } else {
      console.log('\n⚠️ No purchase or expense data found.');
      console.log('📋 You may need to run the data insertion script again.');
    }
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

// Run the check
if (require.main === module) {
  checkExistingData();
}

module.exports = { checkExistingData };
