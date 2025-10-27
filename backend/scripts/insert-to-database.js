const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function insertToDatabase() {
  try {
    console.log('🚀 Inserting data into Supabase database...');

    // Load the JSON data
    const purchaseData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../public/purchase-summary.json'), 'utf8'),
    );
    const expenseData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../public/expense-summary.json'), 'utf8'),
    );

    console.log(`📊 Loaded ${purchaseData.length} purchase records`);
    console.log(`📊 Loaded ${expenseData.length} expense records`);

    // Get organization and site IDs
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('name', 'Gavith Build')
      .single();

    const { data: site } = await supabaseAdmin
      .from('sites')
      .select('*')
      .eq('name', 'Gudibande')
      .single();

    if (!org || !site) {
      console.error('❌ Organization or site not found');
      return;
    }

    console.log('✅ Found organization:', org.name);
    console.log('✅ Found site:', site.name);

    // Insert purchase data into material_purchases table
    console.log('\n📦 Inserting purchase data...');
    let purchaseCount = 0;

    for (const purchase of purchaseData) {
      try {
        const { error } = await supabaseAdmin.from('material_purchases').insert({
          organization_id: purchase.organization_id,
          site_id: purchase.site_id,
          vendor_id: purchase.vendor_id,
          purchase_id: purchase.purchase_id,
          purchase_date: purchase.purchase_date,
          material_name: purchase.material_name,
          quantity: purchase.quantity,
          unit: purchase.unit,
          rate: purchase.rate,
          total_amount: purchase.total_amount,
          vehicle_id: purchase.vehicle_id,
          filled_weight: purchase.filled_weight,
          empty_weight: purchase.empty_weight,
          net_weight: purchase.net_weight,
          status: purchase.status,
          created_at: purchase.created_at,
          updated_at: purchase.updated_at,
        });

        if (error) {
          console.error(`❌ Error inserting purchase ${purchase.purchase_id}:`, error.message);
          continue;
        }

        purchaseCount++;
        if (purchaseCount % 50 === 0) {
          console.log(`📦 Inserted ${purchaseCount} purchases...`);
        }
      } catch (err) {
        console.error(`❌ Error inserting purchase ${purchase.purchase_id}:`, err.message);
      }
    }

    console.log(`✅ Inserted ${purchaseCount} purchase records`);

    // Insert expense data into expenses table
    console.log('\n💰 Inserting expense data...');
    let expenseCount = 0;

    for (const expense of expenseData) {
      try {
        const { error } = await supabaseAdmin.from('expenses').insert({
          organization_id: expense.organization_id,
          site_id: expense.site_id,
          expense_id: expense.expense_id,
          expense_date: expense.expense_date,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          quantity: expense.quantity,
          unit: expense.unit,
          rate: expense.rate,
          vehicle_info: expense.vehicle_info,
          status: expense.status,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
        });

        if (error) {
          console.error(`❌ Error inserting expense ${expense.expense_id}:`, error.message);
          continue;
        }

        expenseCount++;
        if (expenseCount % 20 === 0) {
          console.log(`💰 Inserted ${expenseCount} expenses...`);
        }
      } catch (err) {
        console.error(`❌ Error inserting expense ${expense.expense_id}:`, err.message);
      }
    }

    console.log(`✅ Inserted ${expenseCount} expense records`);

    // Verify the data was inserted
    console.log('\n🔍 Verifying inserted data...');

    const { data: insertedPurchases, error: purchaseError } = await supabaseAdmin
      .from('material_purchases')
      .select('count')
      .limit(1);

    const { data: insertedExpenses, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('count')
      .limit(1);

    console.log('\n📊 Final Summary:');
    console.log(`   - Purchase records in database: ${purchaseError ? 'Error' : 'Success'}`);
    console.log(`   - Expense records in database: ${expenseError ? 'Error' : 'Success'}`);
    console.log(`   - Total purchases inserted: ${purchaseCount}`);
    console.log(`   - Total expenses inserted: ${expenseCount}`);

    console.log('\n🎉 Database insertion complete!');
  } catch (error) {
    console.error('❌ Insertion failed:', error);
  }
}

// Run the insertion
if (require.main === module) {
  insertToDatabase();
}

module.exports = { insertToDatabase };
