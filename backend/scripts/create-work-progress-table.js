const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createWorkProgressTable() {
  console.log('🏗️ Creating work_progress table...');

  try {
    // Create work_progress table
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS work_progress (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          work_date DATE NOT NULL,
          description TEXT NOT NULL,
          unit VARCHAR(50),
          length DECIMAL(10,2),
          width DECIMAL(10,2),
          thickness DECIMAL(10,2),
          quantity DECIMAL(10,2),
          steel_open DECIMAL(10,2) DEFAULT 0,
          steel_consumption DECIMAL(10,2) DEFAULT 0,
          steel_balance DECIMAL(10,2) DEFAULT 0,
          cement_open DECIMAL(10,2) DEFAULT 0,
          cement_consumption DECIMAL(10,2) DEFAULT 0,
          cement_balance DECIMAL(10,2) DEFAULT 0,
          remarks TEXT,
          status VARCHAR(50) DEFAULT 'completed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (error) {
      console.error('❌ Error creating work_progress table:', error);
      return;
    }

    console.log('✅ work_progress table created successfully');

    // Create indexes for better performance
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_work_progress_site_id ON work_progress(site_id);
        CREATE INDEX IF NOT EXISTS idx_work_progress_work_date ON work_progress(work_date);
        CREATE INDEX IF NOT EXISTS idx_work_progress_organization_id ON work_progress(organization_id);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

  } catch (error) {
    console.error('❌ Error in createWorkProgressTable:', error);
  }
}

// Run the function
if (require.main === module) {
  createWorkProgressTable();
}

module.exports = { createWorkProgressTable };
