const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Load data from JSON files
let purchaseData = [];
let expenseData = [];

// Load data on startup
function loadData() {
  try {
    console.log('📊 Loading data from JSON files...');

    // Load purchase data
    const purchaseJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../public/purchase-summary.json'), 'utf8'),
    );
    purchaseData = purchaseJson;

    // Load expense data
    const expenseJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../public/expense-summary.json'), 'utf8'),
    );
    expenseData = expenseJson;

    console.log(`✅ Loaded ${purchaseData.length} purchase records`);
    console.log(`✅ Loaded ${expenseData.length} expense records`);
  } catch (error) {
    console.error('❌ Error loading data:', error);
  }
}

// API route to get purchase data
app.get('/api/db/purchases', (req, res) => {
  try {
    console.log('📦 API: Getting purchase data...');

    res.json({
      success: true,
      data: purchaseData,
      count: purchaseData.length,
    });
  } catch (error) {
    console.error('❌ Error loading purchase data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load purchase data',
      error: error.message,
    });
  }
});

// API route to get expense data
app.get('/api/db/expenses', (req, res) => {
  try {
    console.log('💰 API: Getting expense data...');

    res.json({
      success: true,
      data: expenseData,
      count: expenseData.length,
    });
  } catch (error) {
    console.error('❌ Error loading expense data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load expense data',
      error: error.message,
    });
  }
});

// API route to get summary statistics
app.get('/api/db/summary', (req, res) => {
  try {
    console.log('📊 API: Getting summary data...');

    const totalPurchaseAmount = purchaseData.reduce(
      (sum, purchase) => sum + (purchase.total_amount || 0),
      0,
    );
    const totalExpenseAmount = expenseData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalPurchaseQuantity = purchaseData.reduce(
      (sum, purchase) => sum + (purchase.quantity || 0),
      0,
    );
    const totalExpenseQuantity = expenseData.reduce(
      (sum, expense) => sum + (expense.quantity || 0),
      0,
    );

    // Get unique vendors
    const vendors = [...new Set(purchaseData.map((p) => p.vendor_name))];

    // Get unique materials
    const materials = [...new Set(purchaseData.map((p) => p.material_name))];

    res.json({
      success: true,
      data: {
        purchases: {
          count: purchaseData.length,
          totalAmount: totalPurchaseAmount,
          totalQuantity: totalPurchaseQuantity,
          vendors: vendors.length,
          materials: materials.length,
        },
        expenses: {
          count: expenseData.length,
          totalAmount: totalExpenseAmount,
          totalQuantity: totalExpenseQuantity,
        },
        summary: {
          totalRecords: purchaseData.length + expenseData.length,
          totalValue: totalPurchaseAmount + totalExpenseAmount,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error loading summary data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load summary data',
      error: error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    data: {
      purchases: purchaseData.length,
      expenses: expenseData.length,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Working API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Purchases: http://localhost:${PORT}/api/db/purchases`);
  console.log(`💰 Expenses: http://localhost:${PORT}/api/db/expenses`);
  console.log(`📊 Summary: http://localhost:${PORT}/api/db/summary`);

  // Load data on startup
  loadData();
});

module.exports = app;
