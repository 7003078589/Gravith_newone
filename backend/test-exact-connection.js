const { Pool } = require('pg');

// Test with exact connection string from Supabase dashboard
const connectionString =
  'postgresql://postgres.wbrncnvgnoozshekeebc:Maha@secure@99@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable';

const pool = new Pool({
  connectionString: connectionString,
  ssl: false,
});

async function testExactConnection() {
  try {
    console.log('🔌 Testing with exact connection string from dashboard...');
    console.log('Connection string:', connectionString.replace('Maha@secure@99', '***HIDDEN***'));

    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('📅 Current time:', result.rows[0].current_time);

    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('📋 Existing tables:');
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found. You need to run the schema.sql script in Supabase!');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Check your Supabase password in the dashboard');
  } finally {
    await pool.end();
  }
}

testExactConnection();
