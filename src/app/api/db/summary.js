// Vercel serverless function for summary API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    console.log('📊 API: Getting summary data from database...');

    // Get counts for different entities
    const [purchasesResult, expensesResult, sitesResult, vehiclesResult, vendorsResult] = await Promise.all([
      supabaseAdmin.from('purchases').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('expenses').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('sites').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('vehicles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('vendors').select('*', { count: 'exact', head: true }),
    ]);

    // Get total purchase value
    const { data: purchaseValues } = await supabaseAdmin
      .from('purchases')
      .select('value, total_amount');

    const totalPurchaseValue = purchaseValues?.reduce((sum, purchase) => {
      return sum + (purchase.value || purchase.total_amount || 0);
    }, 0) || 0;

    // Get total expense amount
    const { data: expenseAmounts } = await supabaseAdmin
      .from('expenses')
      .select('amount');

    const totalExpenseAmount = expenseAmounts?.reduce((sum, expense) => {
      return sum + (expense.amount || 0);
    }, 0) || 0;

    const summary = {
      totalPurchases: purchasesResult.count || 0,
      totalExpenses: expensesResult.count || 0,
      totalSites: sitesResult.count || 0,
      totalVehicles: vehiclesResult.count || 0,
      totalVendors: vendorsResult.count || 0,
      totalPurchaseValue,
      totalExpenseAmount,
      totalValue: totalPurchaseValue + totalExpenseAmount,
    };

    console.log('✅ Summary data calculated:', summary);
    return new Response(JSON.stringify({
      success: true,
      data: summary,
    }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message,
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}