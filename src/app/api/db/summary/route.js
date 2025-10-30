export async function GET() {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    console.log('📊 API (mock): Returning mock summary');
    const summary = {
      totalPurchases: 0,
      totalExpenses: 0,
      totalSites: 0,
      totalVehicles: 0,
      totalVendors: 0,
      totalPurchaseValue: 0,
      totalExpenseAmount: 0,
      totalValue: 0,
    };
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