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

// API route to get purchase data
app.get('/api/purchases', (req, res) => {
  try {
    console.log('📦 API: Getting purchase data...');
    const purchaseData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../public/purchase-summary.json'), 'utf8'),
    );

    console.log(`✅ Found ${purchaseData.length} purchase records`);

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
app.get('/api/expenses', (req, res) => {
  try {
    console.log('💰 API: Getting expense data...');
    const expenseData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../public/expense-summary.json'), 'utf8'),
    );

    console.log(`✅ Found ${expenseData.length} expense records`);

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

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Purchases: http://localhost:${PORT}/api/purchases`);
  console.log(`💰 Expenses: http://localhost:${PORT}/api/expenses`);
});

module.exports = app;
