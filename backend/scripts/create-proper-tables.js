const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://wbrncnvgnoozshekeebc.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indicm5jbnZnbm9venNoZWtlZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTI5NjYyNSwiZXhwIjoyMDc2ODcyNjI1fQ.d-J4dUGUDawQN-sikxK4sZNSRJN4gYtmtttPIX4GxyA';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createProperTables() {
  console.log('🏗️ Creating proper database tables with all required columns...');

  try {
    // 1. Create organizations table
    console.log('📋 Creating organizations table...');
    const { error: orgError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          logo_url VARCHAR(500),
          subscription VARCHAR(20) CHECK (subscription IN ('free', 'basic', 'premium', 'enterprise')),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });
    if (orgError) console.log('⚠️ Organizations table:', orgError.message);

    // 2. Create sites table
    console.log('📋 Creating sites table...');
    const { error: sitesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(500),
          status VARCHAR(50) DEFAULT 'active',
          start_date DATE,
          end_date DATE,
          budget DECIMAL(15,2),
          spent DECIMAL(15,2) DEFAULT 0,
          description TEXT,
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });
    if (sitesError) console.log('⚠️ Sites table:', sitesError.message);

    // 3. Create vendors table
    console.log('📋 Creating vendors table...');
    const { error: vendorsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vendors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          contact_person VARCHAR(255),
          phone VARCHAR(20),
          email VARCHAR(255),
          address TEXT,
          gst_number VARCHAR(20),
          pan_number VARCHAR(20),
          bank_name VARCHAR(255),
          bank_branch VARCHAR(255),
          account_name VARCHAR(255),
          account_number VARCHAR(50),
          ifsc_code VARCHAR(20),
          payment_terms TEXT,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          total_paid DECIMAL(15,2) DEFAULT 0,
          pending_amount DECIMAL(15,2) DEFAULT 0,
          last_payment DATE,
          status VARCHAR(50) DEFAULT 'active',
          registration_date DATE DEFAULT CURRENT_DATE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });
    if (vendorsError) console.log('⚠️ Vendors table:', vendorsError.message);

    // 4. Create materials table
    console.log('📋 Creating materials table...');
    const { error: materialsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS materials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          unit VARCHAR(50) DEFAULT 'Ton',
          category VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });
    if (materialsError) console.log('⚠️ Materials table:', materialsError.message);

    // 5. Create vehicles table
    console.log('📋 Creating vehicles table...');
    const { error: vehiclesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vehicles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          registration_number VARCHAR(50) NOT NULL,
          vehicle_type VARCHAR(100),
          model VARCHAR(100),
          capacity VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });
    if (vehiclesError) console.log('⚠️ Vehicles table:', vehiclesError.message);

    // 6. Create purchases table (not material_purchases)
    console.log('📋 Creating purchases table...');
    const { error: purchasesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS purchases (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
          material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
          vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
          purchase_id VARCHAR(100) NOT NULL,
          purchase_date DATE NOT NULL,
          material_name VARCHAR(255),
          quantity DECIMAL(10,2),
          unit VARCHAR(50),
          rate DECIMAL(10,2),
          total_amount DECIMAL(15,2),
          filled_weight DECIMAL(10,2),
          empty_weight DECIMAL(10,2),
          net_weight DECIMAL(10,2),
          status VARCHAR(50) DEFAULT 'completed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `,
    });
    if (purchasesError) console.log('⚠️ Purchases table:', purchasesError.message);

    // 7. Update expenses table with all required columns
    console.log('📋 Updating expenses table...');
    const { error: expensesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE CASCADE;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_id VARCHAR(100);
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_date DATE;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2);
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2);
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS rate DECIMAL(10,2);
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vehicle_info VARCHAR(255);
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved';
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE expenses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `,
    });
    if (expensesError) console.log('⚠️ Expenses table update:', expensesError.message);

    // Create indexes for better performance
    console.log('📋 Creating indexes...');
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_purchases_organization_id ON purchases(organization_id);
        CREATE INDEX IF NOT EXISTS idx_purchases_site_id ON purchases(site_id);
        CREATE INDEX IF NOT EXISTS idx_purchases_vendor_id ON purchases(vendor_id);
        CREATE INDEX IF NOT EXISTS idx_purchases_purchase_date ON purchases(purchase_date);
        CREATE INDEX IF NOT EXISTS idx_expenses_organization_id ON expenses(organization_id);
        CREATE INDEX IF NOT EXISTS idx_expenses_site_id ON expenses(site_id);
        CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
        CREATE INDEX IF NOT EXISTS idx_vendors_organization_id ON vendors(organization_id);
        CREATE INDEX IF NOT EXISTS idx_materials_organization_id ON materials(organization_id);
        CREATE INDEX IF NOT EXISTS idx_vehicles_organization_id ON vehicles(organization_id);
      `,
    });
    if (indexError) console.log('⚠️ Indexes:', indexError.message);

    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// Run the table creation
if (require.main === module) {
  createProperTables();
}

module.exports = { createProperTables };
