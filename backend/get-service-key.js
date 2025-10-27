console.log('🔑 To get your Supabase Service Role Key:');
console.log('');
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select your project: wbrncnvgnoozshekeebc');
console.log('3. Go to Settings → API');
console.log('4. Copy the "service_role" key (not the anon key)');
console.log('5. Add it to your .env file as: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
console.log('');
console.log('⚠️  The service role key has full access to your database and should be kept secret!');
console.log('⚠️  Never commit this key to version control!');
console.log('');
console.log('📋 Your current .env file should look like this:');
console.log('');
console.log('SUPABASE_URL=https://wbrncnvgnoozshekeebc.supabase.co');
console.log(
  'SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTY2MjUsImV4cCI6MjA3Njg3MjYyNX0.lQ8f7W3yVHQEih427TXQ7_MLndnvxcBkJqm9077c8jE',
);
console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
console.log('');
console.log('Once you add the service role key, run: node scripts/import-csv-data.js');
