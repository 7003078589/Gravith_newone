const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Organization ID (from existing data)
const ORGANIZATION_ID = '550e8400-e29b-41d4-a716-446655440000';

// Helper function to parse currency string to number
function parseCurrency(currencyStr) {
  if (!currencyStr || currencyStr.trim() === '') return 0;
  // Remove commas and convert to number
  return parseFloat(currencyStr.replace(/,/g, '')) || 0;
}

// Helper function to clean vendor name
function cleanVendorName(name) {
  // Extract the main vendor name before the dash
  const parts = name.split(' - ');
  return parts[0].trim();
}

// Helper function to consolidate vendor data
function consolidateVendorData(vendors) {
  const consolidated = {};
  
  vendors.forEach(vendor => {
    const key = vendor.name;
    if (consolidated[key]) {
      // Add to existing vendor
      consolidated[key].total_paid += vendor.total_paid;
      consolidated[key].pending_amount += vendor.pending_amount;
      consolidated[key].total_amount = consolidated[key].total_paid + consolidated[key].pending_amount;
    } else {
      // Create new vendor entry
      consolidated[key] = {
        ...vendor,
        total_amount: vendor.total_paid + vendor.pending_amount
      };
    }
  });
  
  return Object.values(consolidated);
}

// Helper function to determine category based on vendor name
function getCategory(vendorName) {
  const name = vendorName.toLowerCase();
  if (name.includes('steel') || name.includes('cement')) return 'Construction Materials';
  if (name.includes('sand') || name.includes('rock')) return 'Aggregates';
  if (name.includes('sve') || name.includes('svs')) return 'General Contractor';
  return 'Vendor';
}

async function importVendorData() {
  console.log('🚀 Starting vendor data import from CSV...');

  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '../../public/vendor(Sheet1) (1).csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    console.log(`📄 Found ${lines.length - 1} vendor records in CSV`);

    // Skip header row
    const dataLines = lines.slice(1);
    const vendorData = [];

    // First pass: collect all vendor data
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      // Parse CSV line (handle commas within quoted fields)
      const fields = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());

      if (fields.length < 5) {
        console.log(`⚠️ Skipping line ${i + 2}: Insufficient fields`);
        continue;
      }

      const [slNo, particulars, paid, balance, total] = fields;
      
      // Skip if particulars is empty
      if (!particulars || particulars.trim() === '') continue;

      const vendorName = cleanVendorName(particulars);
      const paidAmount = parseCurrency(paid);
      const balanceAmount = parseCurrency(balance);
      const totalAmount = parseCurrency(total);

      console.log(`\n📝 Processing: ${vendorName}`);
      console.log(`   - Paid: ₹${paidAmount.toLocaleString()}`);
      console.log(`   - Balance: ₹${balanceAmount.toLocaleString()}`);
      console.log(`   - Total: ₹${totalAmount.toLocaleString()}`);

      // Check if vendor already exists
      const { data: existingVendor, error: checkError } = await supabaseAdmin
        .from('vendors')
        .select('id, name, total_paid, pending_amount')
        .eq('organization_id', ORGANIZATION_ID)
        .eq('name', vendorName)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking vendor ${vendorName}:`, checkError);
        continue;
      }

      if (existingVendor) {
        // Update existing vendor
        console.log(`   🔄 Updating existing vendor: ${vendorName}`);
        
        const { error: updateError } = await supabaseAdmin
          .from('vendors')
          .update({
            total_paid: paidAmount,
            pending_amount: balanceAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVendor.id);

        if (updateError) {
          console.error(`❌ Error updating vendor ${vendorName}:`, updateError);
        } else {
          console.log(`   ✅ Updated vendor: ${vendorName}`);
        }
      } else {
        // Create new vendor
        console.log(`   ➕ Creating new vendor: ${vendorName}`);
        
        const { error: insertError } = await supabaseAdmin
          .from('vendors')
          .insert({
            organization_id: ORGANIZATION_ID,
            name: vendorName,
            category: getCategory(vendorName),
            total_paid: paidAmount,
            pending_amount: balanceAmount,
            status: balanceAmount > 0 ? 'pending' : 'active',
            registration_date: new Date().toISOString().split('T')[0],
            notes: `Imported from CSV - ${particulars}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`❌ Error creating vendor ${vendorName}:`, insertError);
        } else {
          console.log(`   ✅ Created vendor: ${vendorName}`);
        }
      }
    }

    console.log('\n🎉 Vendor data import completed!');
    
    // Verify the import
    const { data: vendors, error: verifyError } = await supabaseAdmin
      .from('vendors')
      .select('name, total_paid, pending_amount, status')
      .eq('organization_id', ORGANIZATION_ID)
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying import:', verifyError);
    } else {
      console.log('\n📊 Final vendor data:');
      vendors.forEach(vendor => {
        console.log(`   - ${vendor.name}: Paid ₹${vendor.total_paid.toLocaleString()}, Pending ₹${vendor.pending_amount.toLocaleString()}, Status: ${vendor.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error importing vendor data:', error);
  }
}

// Run the import
if (require.main === module) {
  importVendorData();
}

module.exports = { importVendorData };
