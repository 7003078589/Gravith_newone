const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
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
      .on('data', (data) => {
        // Remove BOM character from the first key if present
        const cleanedData = {};
        for (const key in data) {
          const cleanedKey = key.charCodeAt(0) === 0xfeff ? key.substring(1) : key;
          cleanedData[cleanedKey] = data[key];
        }
        results.push(cleanedData);
      })
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

    return date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
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
    purchaseId: (data['Purchase ID'] || data['Purchase ID '] || '').trim(),
    expenseId: (data['Expense ID'] || data['Expense ID '] || '').trim(),
    vendor: (data.Vendor || '').trim(),
    material: (data.Material || '').trim(),
    site: (data.Site || data['Site Name '] || '').trim(),
    vehicleId: (data['Vehicle ID'] || '').trim(),
    vehicles: (data.Vehicles || '').trim(),
    uom: (data.UOM || '').trim(),
  };
}

// Main function to insert all real data
async function insertSimpleData() {
  try {
    console.log('🚀 Starting Simple Real Data Insertion...');

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

    // Get organization and site (they should already exist from the SQL script)
    console.log('\n🏢 Getting organization and site...');
    const { data: orgs, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('name', 'Gavith Build');

    if (orgError || !orgs || orgs.length === 0) {
      console.error(
        '❌ Error finding organization:',
        orgError || 'Organization "Gavith Build" not found.',
      );
      console.log(
        '📋 Please run the final-complete-schema.sql script in Supabase SQL Editor first!',
      );
      return;
    }
    const org = orgs[0];
    console.log('✅ Found organization:', org.name);

    const { data: sites, error: siteError } = await supabaseAdmin
      .from('sites')
      .select('id, name')
      .eq('name', 'Gudibande')
      .eq('organization_id', org.id);

    if (siteError || !sites || sites.length === 0) {
      console.error('❌ Error finding site:', siteError || 'Site "Gudibande" not found.');
      console.log(
        '📋 Please run the final-complete-schema.sql script in Supabase SQL Editor first!',
      );
      return;
    }
    const site = sites[0];
    console.log('✅ Found site:', site.name);

    // Create vendors
    console.log('\n🏪 Creating vendors...');
    const vendors = [...new Set(cleanedPurchaseData.map((p) => p.vendor).filter(Boolean))];
    const vendorMap = new Map();

    for (const vendorName of vendors) {
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

    // Create materials
    console.log('\n🧱 Creating materials...');
    const materials = [...new Set(cleanedPurchaseData.map((p) => p.material).filter(Boolean))];
    const materialMap = new Map();

    for (const materialName of materials) {
      const { data: material, error: materialError } = await supabaseAdmin
        .from('materials')
        .insert({
          organization_id: org.id,
          name: materialName,
          description: `${materialName} construction material`,
          unit: 'Ton',
          category: 'Construction Material',
          status: 'active',
        })
        .select()
        .single();

      if (materialError) {
        console.error(`❌ Error creating material ${materialName}:`, materialError);
        continue;
      }

      materialMap.set(materialName, material);
      console.log(`✅ Material created: ${material.name}`);
    }

    // Create vehicles
    console.log('\n🚛 Creating vehicles...');
    const vehicles = [
      ...new Set([
        ...cleanedPurchaseData.map((p) => p.vehicleId).filter(Boolean),
        ...cleanedExpenseData.map((e) => e.vehicles).filter(Boolean),
      ]),
    ];
    const vehicleMap = new Map();

    for (const vehicleInfo of vehicles) {
      if (!vehicleInfo) continue;

      const { data: vehicle, error: vehicleError } = await supabaseAdmin
        .from('vehicles')
        .insert({
          organization_id: org.id,
          registration_number: vehicleInfo,
          vehicle_type: vehicleInfo.includes('Tipper')
            ? 'Tipper'
            : vehicleInfo.includes('Roller')
              ? 'Roller'
              : vehicleInfo.includes('Grader')
                ? 'Grader'
                : vehicleInfo.includes('Hitachi')
                  ? 'Excavator'
                  : vehicleInfo.includes('Tractor')
                    ? 'Tractor'
                    : vehicleInfo.includes('Tanker')
                      ? 'Tanker'
                      : 'Other',
          model: 'Unknown',
          status: 'active',
        })
        .select()
        .single();

      if (vehicleError) {
        console.error(`❌ Error creating vehicle ${vehicleInfo}:`, vehicleError);
        continue;
      }

      vehicleMap.set(vehicleInfo, vehicle);
      console.log(`✅ Vehicle created: ${vehicle.registration_number}`);
    }

    // Insert purchase data
    console.log('\n📦 Inserting purchase data...');
    let purchaseCount = 0;

    for (const purchase of cleanedPurchaseData) {
      if (!purchase.purchaseId || !purchase.vendor || !purchase.material) continue;

      const vendor = vendorMap.get(purchase.vendor);
      const material = materialMap.get(purchase.material);
      const vehicle = vehicleMap.get(purchase.vehicleId);

      if (!vendor || !material) continue;

      const { error: purchaseError } = await supabaseAdmin.from('purchases').insert({
        organization_id: org.id,
        site_id: site.id,
        vendor_id: vendor.id,
        material_id: material.id,
        vehicle_id: vehicle?.id,
        purchase_id: purchase.purchaseId,
        purchase_date: purchase.purchaseDate,
        material_name: purchase.material,
        quantity: purchase.qty,
        unit: purchase.uom || 'Ton',
        rate: purchase.rate,
        total_amount: purchase.value,
        filled_weight: purchase.filled,
        empty_weight: purchase.empty,
        net_weight: purchase.net,
        status: 'completed',
      });

      if (purchaseError) {
        console.error(`❌ Error inserting purchase ${purchase.purchaseId}:`, purchaseError.message);
        continue;
      }

      purchaseCount++;
      if (purchaseCount % 50 === 0) {
        console.log(`📦 Inserted ${purchaseCount} purchases...`);
      }
    }

    console.log(`✅ Inserted ${purchaseCount} purchase records`);

    // Insert expense data
    console.log('\n💰 Inserting expense data...');
    let expenseCount = 0;

    for (const expense of cleanedExpenseData) {
      if (!expense.expenseId || !expense.vehicles) continue;

      const vehicle = vehicleMap.get(expense.vehicles);

      const { error: expenseError } = await supabaseAdmin.from('expenses').insert({
        organization_id: org.id,
        site_id: site.id,
        vehicle_id: vehicle?.id,
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
      });

      if (expenseError) {
        console.error(`❌ Error inserting expense ${expense.expenseId}:`, expenseError.message);
        continue;
      }

      expenseCount++;
      if (expenseCount % 20 === 0) {
        console.log(`💰 Inserted ${expenseCount} expenses...`);
      }
    }

    console.log(`✅ Inserted ${expenseCount} expense records`);

    // Final summary
    console.log('\n🎉 Simple Real Data Insertion Finished!');
    console.log('📊 Summary:');
    console.log(`   - Organization: ${org.name}`);
    console.log(`   - Site: ${site.name}`);
    console.log(`   - Vendors: ${vendorMap.size}`);
    console.log(`   - Materials: ${materialMap.size}`);
    console.log(`   - Vehicles: ${vehicleMap.size}`);
    console.log(`   - Purchase Records: ${purchaseCount}`);
    console.log(`   - Expense Records: ${expenseCount}`);

    console.log('\n✅ All your real CSV data is now in the database!');
    console.log('🔗 Check your Supabase dashboard to see the data in the tables.');
  } catch (error) {
    console.error('❌ Insertion failed:', error);
  }
}

// Run the insertion
if (require.main === module) {
  insertSimpleData();
}

module.exports = { insertSimpleData };
