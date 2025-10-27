const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// API route to get purchase data
router.get('/purchases', (req, res) => {
  try {
    const purchaseData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../public/purchase-summary.json'), 'utf8'),
    );

    res.json({
      success: true,
      data: purchaseData,
      count: purchaseData.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load purchase data',
      error: error.message,
    });
  }
});

// API route to get expense data
router.get('/expenses', (req, res) => {
  try {
    const expenseData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../public/expense-summary.json'), 'utf8'),
    );

    res.json({
      success: true,
      data: expenseData,
      count: expenseData.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load expense data',
      error: error.message,
    });
  }
});

// API route to get summary statistics
router.get('/summary', (req, res) => {
  try {
    const purchaseData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../public/purchase-summary.json'), 'utf8'),
    );

    const expenseData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../public/expense-summary.json'), 'utf8'),
    );

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
    res.status(500).json({
      success: false,
      message: 'Failed to load summary data',
      error: error.message,
    });
  }
});

module.exports = router;
