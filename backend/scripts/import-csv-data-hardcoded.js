const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase configuration for data import
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTY2MjUsImV4cCI6MjA3Njg3MjYyNX0.lQ8f7W3yVHQEih427TXQ7_MLndnvxcBkJqm9077c8jE';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
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
  // Clean numeric values
  const cleanNumeric = (value) => {
    if (!value || value === '') return null;
    // Remove commas and convert to number
    const cleaned = String(value).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  // Clean date values
  const cleanDate = (dateStr) => {
    if (!dateStr || dateStr === '') return null;

    // Handle different date formats
    let date;
    if (dateStr.includes('/')) {
      // Format: DD/MM/YYYY or DD/M/YYYY
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        date = new Date(`${year}-${month}-${day}`);
      }
    } else if (dateStr.includes('-')) {
      // Format: DD-MM-YYYY
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
    // Clean numeric fields
    filled: cleanNumeric(data.Filled),
    empty: cleanNumeric(data.Empty),
    net: cleanNumeric(data.Net),
    qty: cleanNumeric(data.Qty),
    rate: cleanNumeric(data.Rate),
    value: cleanNumeric(data.Value),
    dieselQty: cleanNumeric(data['Diesel Qty in Ltr ']),
    amount: cleanNumeric(data.Amount),
    // Clean date fields
    purchaseDate: cleanDate(data.Date),
    expenseDate: cleanDate(data.Date),
    // Clean text fields
    purchaseId: data['Purchase ID']?.trim(),
    expenseId: data['Expense ID']?.trim(),
    vendor: data.Vendor?.trim(),
    material: data.Material?.trim(),
    site: data.Site?.trim() || data['Site Name ']?.trim(),
    vehicleId: data['Vehicle ID']?.trim(),
    vehicles: data.Vehicles?.trim(),
    uom: data.UOM?.trim(),
  };
}

// Main import function
async function importCSVData() {
  try {
    console.log('🚀 Starting CSV Data Import...');

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

    // Create organization (Gavith Build)
    console.log('🏢 Creating organization...');
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .upsert(
        {
          id: '550e8400-e29b-41d4-a716-446655440000', // Fixed UUID for consistency
          name: 'Gavith Build',
          subscription: 'premium',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select()
      .single();

    if (orgError) {
      console.error('❌ Error creating organization:', orgError);
      return;
    }

    console.log('✅ Organization created:', org.name);

    // Create site (Gudibande)
    console.log('🏗️ Creating site...');
    const { data: site, error: siteError } = await supabaseAdmin
      .from('sites')
      .upsert(
        {
          id: '550e8400-e29b-41d4-a716-446655440001', // Fixed UUID for consistency
          organization_id: org.id,
          name: 'Gudibande',
          location: 'Gudibande, Karnataka, India',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select()
      .single();

    if (siteError) {
      console.error('❌ Error creating site:', siteError);
      return;
    }

    console.log('✅ Site created:', site.name);

    // Create vendors
    console.log('🏪 Creating vendors...');
    const vendors = [...new Set(cleanedPurchaseData.map((p) => p.vendor).filter(Boolean))];
    const vendorMap = new Map();

    for (const vendorName of vendors) {
      const { data: vendor, error: vendorError } = await supabaseAdmin
        .from('vendors')
        .upsert(
          {
            organization_id: org.id,
            name: vendorName,
            contact_person: `${vendorName} Contact`,
            email: `${vendorName.toLowerCase().replace(/\s+/g, '')}@example.com`,
            phone: '+91-9876543210',
            address: 'Vendor Address',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'organization_id,name' },
        )
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
    console.log('🧱 Creating materials...');
    const materials = [...new Set(cleanedPurchaseData.map((p) => p.material).filter(Boolean))];
    const materialMap = new Map();

    for (const materialName of materials) {
      const { data: material, error: materialError } = await supabaseAdmin
        .from('materials')
        .upsert(
          {
            organization_id: org.id,
            name: materialName,
            description: `${materialName} material`,
            unit: 'Ton',
            category: 'Construction Material',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'organization_id,name' },
        )
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
    console.log('🚛 Creating vehicles...');
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
        .upsert(
          {
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'organization_id,registration_number' },
        )
        .select()
        .single();

      if (vehicleError) {
        console.error(`❌ Error creating vehicle ${vehicleInfo}:`, vehicleError);
        continue;
      }

      vehicleMap.set(vehicleInfo, vehicle);
      console.log(`✅ Vehicle created: ${vehicle.registration_number}`);
    }

    // Import purchase data
    console.log('📦 Importing purchase data...');
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
        quantity: purchase.qty,
        unit: purchase.uom || 'Ton',
        rate: purchase.rate,
        total_amount: purchase.value,
        filled_weight: purchase.filled,
        empty_weight: purchase.empty,
        net_weight: purchase.net,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (purchaseError) {
        console.error(`❌ Error importing purchase ${purchase.purchaseId}:`, purchaseError);
        continue;
      }

      purchaseCount++;
      if (purchaseCount % 50 === 0) {
        console.log(`📦 Imported ${purchaseCount} purchases...`);
      }
    }

    console.log(`✅ Imported ${purchaseCount} purchases`);

    // Import expense data
    console.log('💰 Importing expense data...');
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
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (expenseError) {
        console.error(`❌ Error importing expense ${expense.expenseId}:`, expenseError);
        continue;
      }

      expenseCount++;
      if (expenseCount % 20 === 0) {
        console.log(`💰 Imported ${expenseCount} expenses...`);
      }
    }

    console.log(`✅ Imported ${expenseCount} expenses`);

    // Summary
    console.log('\n🎉 Data Import Complete!');
    console.log('📊 Summary:');
    console.log(`   - Organization: ${org.name}`);
    console.log(`   - Site: ${site.name}`);
    console.log(`   - Vendors: ${vendorMap.size}`);
    console.log(`   - Materials: ${materialMap.size}`);
    console.log(`   - Vehicles: ${vehicleMap.size}`);
    console.log(`   - Purchases: ${purchaseCount}`);
    console.log(`   - Expenses: ${expenseCount}`);
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run the import
if (require.main === module) {
  importCSVData();
}

module.exports = { importCSVData };
