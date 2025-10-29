const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Organization and Site IDs (from existing data)
const ORGANIZATION_ID = '550e8400-e29b-41d4-a716-446655440000';
const SITE_ID = '550e8400-e29b-41d4-a716-446655440001';

// Helper function to parse date
function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Handle different date formats
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // DD/MM/YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,   // DD-MM-YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  return null;
}

// Helper function to parse decimal numbers
function parseDecimal(value) {
  if (!value || value.trim() === '') return 0;
  return parseFloat(value.replace(/,/g, '')) || 0;
}

// Helper function to clean text
function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

async function importWorkProgressData() {
  console.log('🚀 Starting work progress data import from CSV...');

  try {
    // First, create the table if it doesn't exist
    const { createWorkProgressTable } = require('./create-work-progress-table');
    await createWorkProgressTable();

    // Read the CSV file
    const csvPath = path.join(__dirname, '../../public/work progress(Sheet1).csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    console.log(`📄 Found ${lines.length} lines in CSV`);

    // Skip header rows (first 3 lines are headers)
    const dataLines = lines.slice(3);
    let importedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      // Parse CSV line
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

      if (fields.length < 15) {
        console.log(`⚠️ Skipping line ${i + 4}: Insufficient fields (${fields.length})`);
        skippedCount++;
        continue;
      }

      const [
        slNo,
        date,
        description,
        unit,
        length,
        width,
        thickness,
        quantity,
        steelOpen,
        steelConsumption,
        steelBalance,
        cementOpen,
        cementConsumption,
        cementBalance,
        remarks
      ] = fields;

      // Skip if no date or description
      if (!date || !description || date.trim() === '' || description.trim() === '') {
        console.log(`⚠️ Skipping line ${i + 4}: No date or description`);
        skippedCount++;
        continue;
      }

      const workDate = parseDate(date);
      if (!workDate) {
        console.log(`⚠️ Skipping line ${i + 4}: Invalid date format: ${date}`);
        skippedCount++;
        continue;
      }

      const workProgressData = {
        organization_id: ORGANIZATION_ID,
        site_id: SITE_ID,
        work_date: workDate,
        description: cleanText(description),
        unit: cleanText(unit) || 'cum',
        length: parseDecimal(length),
        width: parseDecimal(width),
        thickness: parseDecimal(thickness),
        quantity: parseDecimal(quantity),
        steel_open: parseDecimal(steelOpen),
        steel_consumption: parseDecimal(steelConsumption),
        steel_balance: parseDecimal(steelBalance),
        cement_open: parseDecimal(cementOpen),
        cement_consumption: parseDecimal(cementConsumption),
        cement_balance: parseDecimal(cementBalance),
        remarks: cleanText(remarks),
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log(`\n📝 Processing: ${workProgressData.description} (${workDate})`);
      console.log(`   - Unit: ${workProgressData.unit}`);
      console.log(`   - Quantity: ${workProgressData.quantity}`);
      console.log(`   - Steel: ${workProgressData.steel_consumption} consumed, ${workProgressData.steel_balance} balance`);
      console.log(`   - Cement: ${workProgressData.cement_consumption} consumed, ${workProgressData.cement_balance} balance`);

      // Insert into database
      const { error: insertError } = await supabaseAdmin
        .from('work_progress')
        .insert(workProgressData);

      if (insertError) {
        console.error(`❌ Error inserting work progress:`, insertError);
        skippedCount++;
      } else {
        console.log(`   ✅ Imported successfully`);
        importedCount++;
      }
    }

    console.log('\n🎉 Work progress data import completed!');
    console.log(`   - Imported: ${importedCount} records`);
    console.log(`   - Skipped: ${skippedCount} records`);
    
    // Verify the import
    const { data: workProgress, error: verifyError } = await supabaseAdmin
      .from('work_progress')
      .select('work_date, description, quantity, steel_consumption, cement_consumption')
      .eq('organization_id', ORGANIZATION_ID)
      .order('work_date', { ascending: true });

    if (verifyError) {
      console.error('❌ Error verifying import:', verifyError);
    } else {
      console.log('\n📊 Sample imported work progress data:');
      workProgress.slice(0, 5).forEach(entry => {
        console.log(`   - ${entry.work_date}: ${entry.description} (${entry.quantity} ${entry.unit || 'cum'})`);
      });
      if (workProgress.length > 5) {
        console.log(`   ... and ${workProgress.length - 5} more entries`);
      }
    }

  } catch (error) {
    console.error('❌ Error importing work progress data:', error);
  }
}

// Run the import
if (require.main === module) {
  importWorkProgressData();
}

module.exports = { importWorkProgressData };
