const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

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

async function debugData() {
  try {
    console.log('🔍 Debugging CSV data...');

    // Parse CSV files
    const purchaseData = await parseCSV(
      path.join(__dirname, '../../public/gravith purchase data(Sheet1).csv'),
    );
    const expenseData = await parseCSV(
      path.join(__dirname, '../../public/site expense data(Sheet1).csv'),
    );

    console.log(`📈 Raw purchase records: ${purchaseData.length}`);
    console.log(`📈 Raw expense records: ${expenseData.length}`);

    // Clean data
    const cleanedPurchaseData = purchaseData.map(cleanData);
    const cleanedExpenseData = expenseData.map(cleanData);

    console.log('\n📋 Sample purchase data (first 3 records):');
    cleanedPurchaseData.slice(0, 3).forEach((p, i) => {
      console.log(`\nRecord ${i + 1}:`);
      console.log(`  Purchase ID: "${p.purchaseId}"`);
      console.log(`  Vendor: "${p.vendor}"`);
      console.log(`  Material: "${p.material}"`);
      console.log(`  Site: "${p.site}"`);
      console.log(`  Date: "${p.purchaseDate}"`);
      console.log(`  Qty: ${p.qty}`);
      console.log(`  Rate: ${p.rate}`);
      console.log(`  Value: ${p.value}`);
    });

    console.log('\n📋 Sample expense data (first 3 records):');
    cleanedExpenseData.slice(0, 3).forEach((e, i) => {
      console.log(`\nRecord ${i + 1}:`);
      console.log(`  Expense ID: "${e.expenseId}"`);
      console.log(`  Vehicles: "${e.vehicles}"`);
      console.log(`  Site: "${e.site}"`);
      console.log(`  Date: "${e.expenseDate}"`);
      console.log(`  Amount: ${e.amount}`);
      console.log(`  Diesel Qty: ${e.dieselQty}`);
    });

    // Check filtering
    const validPurchases = cleanedPurchaseData.filter(
      (p) => p.purchaseId && p.vendor && p.material,
    );
    const validExpenses = cleanedExpenseData.filter((e) => e.expenseId && e.vehicles);

    console.log(`\n📊 Valid purchase records: ${validPurchases.length}`);
    console.log(`📊 Valid expense records: ${validExpenses.length}`);

    // Check what's being filtered out
    const invalidPurchases = cleanedPurchaseData.filter(
      (p) => !p.purchaseId || !p.vendor || !p.material,
    );
    const invalidExpenses = cleanedExpenseData.filter((e) => !e.expenseId || !e.vehicles);

    console.log(`\n❌ Invalid purchase records: ${invalidPurchases.length}`);
    console.log(`❌ Invalid expense records: ${invalidExpenses.length}`);

    if (invalidPurchases.length > 0) {
      console.log('\n📋 Sample invalid purchase data:');
      invalidPurchases.slice(0, 3).forEach((p, i) => {
        console.log(`\nInvalid Record ${i + 1}:`);
        console.log(`  Purchase ID: "${p.purchaseId}" (${!!p.purchaseId})`);
        console.log(`  Vendor: "${p.vendor}" (${!!p.vendor})`);
        console.log(`  Material: "${p.material}" (${!!p.material})`);
      });
    }
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugData();
