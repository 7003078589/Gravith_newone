// Vercel serverless function for purchases API
// Switched to mock-only: reads from public JSON and does not use Supabase

export async function GET(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const jsonUrl = new URL('/purchase-summary.json', request.url);
    const resp = await fetch(jsonUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const purchaseData = await resp.json();

    return new Response(
      JSON.stringify({ success: true, data: purchaseData, count: purchaseData.length, source: 'mock' }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to load mock purchases', details: String(error?.message || error) }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } },
    );
  }
}
