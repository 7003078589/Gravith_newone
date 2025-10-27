const { query } = require('./config/database');

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');

    // Test basic connection
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('📅 Current time:', result.rows[0].current_time);

    // Test if tables exist
    const tablesResult = await query(`
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
    console.error('🔧 Make sure your .env file has the correct credentials');
  }
}

testConnection();
