const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Body parsing middleware
app.use(express.json());

// API route to get purchase data from database
app.get('/api/db/purchases', async (req, res) => {
  try {
    console.log('📦 API: Getting purchase data from database...');

    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select(
        `
        *,
        vendors!inner(name),
        materials!inner(name),
        sites!inner(name),
        vehicles(registration_number)
      `,
      )
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching purchases:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase data',
        error: error.message,
      });
    }

    console.log(`✅ Found ${purchases.length} purchase records in database`);

    res.json({
      success: true,
      data: purchases,
      count: purchases.length,
    });
  } catch (error) {
    console.error('❌ Error in purchases API:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// API route to get expense data from database
app.get('/api/db/expenses', async (req, res) => {
  try {
    console.log('💰 API: Getting expense data from database...');

    const { data: expenses, error } = await supabaseAdmin
      .from('expenses')
      .select(
        `
        *,
        sites!inner(name),
        vehicles(registration_number)
      `,
      )
      .order('expense_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching expenses:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch expense data',
        error: error.message,
      });
    }

    console.log(`✅ Found ${expenses.length} expense records in database`);

    res.json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    console.error('❌ Error in expenses API:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// API route to get summary statistics
app.get('/api/db/summary', async (req, res) => {
  try {
    console.log('📊 API: Getting summary data from database...');

    // Get purchase summary
    const { data: purchases, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .select('total_amount, quantity, vendor_id, material_id');

    if (purchaseError) {
      console.error('❌ Error fetching purchase summary:', purchaseError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase summary',
        error: purchaseError.message,
      });
    }

    // Get expense summary
    const { data: expenses, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .select('amount, quantity');

    if (expenseError) {
      console.error('❌ Error fetching expense summary:', expenseError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch expense summary',
        error: expenseError.message,
      });
    }

    // Calculate totals
    const totalPurchaseAmount = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPurchaseQuantity = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalExpenseQuantity = expenses.reduce((sum, e) => sum + (e.quantity || 0), 0);

    // Get unique counts
    const uniqueVendors = new Set(purchases.map((p) => p.vendor_id)).size;
    const uniqueMaterials = new Set(purchases.map((p) => p.material_id)).size;

    res.json({
      success: true,
      data: {
        purchases: {
          count: purchases.length,
          totalAmount: totalPurchaseAmount,
          totalQuantity: totalPurchaseQuantity,
          vendors: uniqueVendors,
          materials: uniqueMaterials,
        },
        expenses: {
          count: expenses.length,
          totalAmount: totalExpenseAmount,
          totalQuantity: totalExpenseQuantity,
        },
        summary: {
          totalRecords: purchases.length + expenses.length,
          totalValue: totalPurchaseAmount + totalExpenseAmount,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error in summary API:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Get counts from database
    const { count: purchaseCount } = await supabaseAdmin
      .from('purchases')
      .select('*', { count: 'exact', head: true });

    const { count: expenseCount } = await supabaseAdmin
      .from('expenses')
      .select('*', { count: 'exact', head: true });

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      data: {
        purchases: purchaseCount || 0,
        expenses: expenseCount || 0,
      },
    });
  } catch (error) {
    res.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Database API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Purchases: http://localhost:${PORT}/api/db/purchases`);
  console.log(`💰 Expenses: http://localhost:${PORT}/api/db/expenses`);
  console.log(`📊 Summary: http://localhost:${PORT}/api/db/summary`);
});

module.exports = app;
