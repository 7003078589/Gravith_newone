const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Helper function to parse CSV data
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Helper function to clean and format data
function cleanData(data) {
  const cleanNumeric = (value) => {
    if (!value || value === '') return null;
    const cleaned = String(value).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const cleanDate = (dateStr) => {
    if (!dateStr || dateStr === '') return null;

    let date;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        date = new Date(`${year}-${month}-${day}`);
      }
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        date = new Date(`${year}-${month}-${day}`);
      }
    }

    return date && !isNaN(date.getTime()) ? date.toISOString() : null;
  };

  return {
    ...data,
    filled: cleanNumeric(data.Filled),
    empty: cleanNumeric(data.Empty),
    net: cleanNumeric(data.Net),
    qty: cleanNumeric(data.Qty),
    rate: cleanNumeric(data.Rate),
    value: cleanNumeric(data.Value),
    dieselQty: cleanNumeric(data['Diesel Qty in Ltr ']),
    amount: cleanNumeric(data.Amount),
    purchaseDate: cleanDate(data.Date),
    expenseDate: cleanDate(data.Date),
    // Fix BOM issue - handle the ﻿ character at the beginning
    purchaseId: (data['﻿Purchase ID'] || data['Purchase ID'] || '').trim(),
    expenseId: (data['﻿Expense ID'] || data['Expense ID'] || '').trim(),
    vendor: (data.Vendor || '').trim(),
    material: (data.Material || '').trim(),
    site: (data.Site || data['Site Name '] || '').trim(),
    vehicleId: (data['Vehicle ID'] || '').trim(),
    vehicles: (data.Vehicles || '').trim(),
    uom: (data.UOM || '').trim(),
  };
}

// Main import function
async function workingImport() {
  try {
    console.log('🚀 Starting Working CSV Data Import...');

    // Parse CSV files
    console.log('📊 Parsing CSV files...');
    const purchaseData = await parseCSV(
      path.join(__dirname, '../../public/gravith purchase data(Sheet1).csv'),
    );
    const expenseData = await parseCSV(
      path.join(__dirname, '../../public/site expense data(Sheet1).csv'),
    );

    console.log(`📈 Found ${purchaseData.length} purchase records`);
    console.log(`📈 Found ${expenseData.length} expense records`);

    // Clean data
    const cleanedPurchaseData = purchaseData.map(cleanData);
    const cleanedExpenseData = expenseData.map(cleanData);

    // Debug first few records
    console.log('\n🔍 Debug first purchase record:');
    const firstPurchase = cleanedPurchaseData[0];
    console.log('Cleaned purchase ID:', `"${firstPurchase.purchaseId}"`);
    console.log('Cleaned vendor:', `"${firstPurchase.vendor}"`);
    console.log('Cleaned material:', `"${firstPurchase.material}"`);

    console.log('\n🔍 Debug first expense record:');
    const firstExpense = cleanedExpenseData[0];
    console.log('Cleaned expense ID:', `"${firstExpense.expenseId}"`);
    console.log('Cleaned vehicles:', `"${firstExpense.vehicles}"`);

    // Get existing organization and site
    console.log('\n🏢 Getting organization and site...');
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

    // Create vendors
    console.log('\n🏪 Creating vendors...');
    const vendors = [...new Set(cleanedPurchaseData.map((p) => p.vendor).filter(Boolean))];
    const vendorMap = new Map();

    for (const vendorName of vendors) {
      // Check if vendor already exists
      const { data: existingVendor } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('organization_id', org.id)
        .eq('name', vendorName)
        .single();

      if (existingVendor) {
        vendorMap.set(vendorName, existingVendor);
        console.log(`✅ Vendor already exists: ${vendorName}`);
        continue;
      }

      const { data: vendor, error: vendorError } = await supabaseAdmin
        .from('vendors')
        .insert({
          organization_id: org.id,
          name: vendorName,
          contact_person: `${vendorName} Contact`,
          email: `${vendorName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: '+91-9876543210',
          address: 'Vendor Address',
          status: 'active',
        })
        .select()
        .single();

      if (vendorError) {
        console.error(`❌ Error creating vendor ${vendorName}:`, vendorError);
        continue;
      }

      vendorMap.set(vendorName, vendor);
      console.log(`✅ Vendor created: ${vendor.name}`);
    }

    // Create purchase summary
    console.log('\n📦 Creating purchase summary...');
    const purchaseSummary = [];

    for (const purchase of cleanedPurchaseData) {
      if (!purchase.purchaseId || !purchase.vendor || !purchase.material) continue;

      const vendor = vendorMap.get(purchase.vendor);
      if (!vendor) continue;

      purchaseSummary.push({
        organization_id: org.id,
        site_id: site.id,
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        purchase_id: purchase.purchaseId,
        purchase_date: purchase.purchaseDate,
        material_name: purchase.material,
        quantity: purchase.qty,
        unit: purchase.uom || 'Ton',
        rate: purchase.rate,
        total_amount: purchase.value,
        vehicle_id: purchase.vehicleId,
        filled_weight: purchase.filled,
        empty_weight: purchase.empty,
        net_weight: purchase.net,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Create expense summary
    console.log('\n💰 Creating expense summary...');
    const expenseSummary = [];

    for (const expense of cleanedExpenseData) {
      if (!expense.expenseId || !expense.vehicles) continue;

      expenseSummary.push({
        organization_id: org.id,
        site_id: site.id,
        expense_id: expense.expenseId,
        expense_date: expense.expenseDate,
        category: 'Fuel',
        description: `Diesel for ${expense.vehicles}`,
        amount: expense.amount,
        quantity: expense.dieselQty,
        unit: 'Ltr',
        rate: expense.rate,
        vehicle_info: expense.vehicles,
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Save summaries to JSON files
    console.log('\n💾 Saving data summaries...');

    fs.writeFileSync(
      path.join(__dirname, '../../public/purchase-summary.json'),
      JSON.stringify(purchaseSummary, null, 2),
    );

    fs.writeFileSync(
      path.join(__dirname, '../../public/expense-summary.json'),
      JSON.stringify(expenseSummary, null, 2),
    );

    // Summary
    console.log('\n🎉 Data Processing Complete!');
    console.log('📊 Summary:');
    console.log(`   - Organization: ${org.name}`);
    console.log(`   - Site: ${site.name}`);
    console.log(`   - Vendors: ${vendorMap.size}`);
    console.log(`   - Purchase Records: ${purchaseSummary.length}`);
    console.log(`   - Expense Records: ${expenseSummary.length}`);
    console.log('\n📁 Data saved to:');
    console.log('   - public/purchase-summary.json');
    console.log('   - public/expense-summary.json');

    // Show sample data
    if (purchaseSummary.length > 0) {
      console.log('\n📋 Sample Purchase Data:');
      console.log(JSON.stringify(purchaseSummary[0], null, 2));
    }

    if (expenseSummary.length > 0) {
      console.log('\n📋 Sample Expense Data:');
      console.log(JSON.stringify(expenseSummary[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run the import
if (require.main === module) {
  workingImport();
}

module.exports = { workingImport };
