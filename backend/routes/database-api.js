const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Get all purchases from database
router.get('/purchases', async (req, res) => {
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

// Get all expenses from database
router.get('/expenses', async (req, res) => {
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

// Get summary statistics
router.get('/summary', async (req, res) => {
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

// Get vendors
router.get('/vendors', async (req, res) => {
  try {
    const { data: vendors, error } = await supabaseAdmin.from('vendors').select('*').order('name');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch vendors',
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: vendors,
      count: vendors.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Get materials
router.get('/materials', async (req, res) => {
  try {
    const { data: materials, error } = await supabaseAdmin
      .from('materials')
      .select('*')
      .order('name');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch materials',
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: materials,
      count: materials.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Get vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const { data: vehicles, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .order('registration_number');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicles',
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Get all sites from database
router.get('/sites', async (req, res) => {
  try {
    console.log('🏗️ API: Getting sites data from database...');

    const { data: sites, error } = await supabaseAdmin
      .from('sites')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching sites:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sites data',
        error: error.message,
      });
    }

    console.log(`✅ Found ${sites.length} sites in database`);

    res.json({
      success: true,
      data: sites,
      count: sites.length,
    });
  } catch (error) {
    console.error('❌ Error in sites API:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Get all vehicles from database
router.get('/vehicles', async (req, res) => {
  try {
    console.log('🚚 API: Getting vehicles data from database...');

    const { data: vehicles, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .order('registration_number', { ascending: true });

    if (error) {
      console.error('❌ Error fetching vehicles:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicles data',
        error: error.message,
      });
    }

    console.log(`✅ Found ${vehicles.length} vehicles in database`);

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    console.error('❌ Error in vehicles API:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

module.exports = router;
