-- Complete Database Schema for Gavith Build - Run this in Supabase SQL Editor
-- This will create all tables with the correct columns for your CSV data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 1. ORGANIZATIONS Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    subscription VARCHAR(20) CHECK (subscription IN ('free', 'basic', 'premium', 'enterprise')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SITES Table
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 3. VENDORS Table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- 4. MATERIALS Table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) DEFAULT 'Ton',
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- 5. VEHICLES Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    registration_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(100),
    model VARCHAR(100),
    capacity VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, registration_number)
);

-- 6. PURCHASES Table (for purchase records)
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, purchase_id)
);

-- 7. EXPENSES Table (for expense records)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    expense_id VARCHAR(100) NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(100),
    description TEXT,
    amount DECIMAL(15,2),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    rate DECIMAL(10,2),
    vehicle_info VARCHAR(255),
    status VARCHAR(50) DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, expense_id)
);

-- Create indexes for better performance
CREATE INDEX idx_purchases_organization_id ON purchases(organization_id);
CREATE INDEX idx_purchases_site_id ON purchases(site_id);
CREATE INDEX idx_purchases_vendor_id ON purchases(vendor_id);
CREATE INDEX idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX idx_expenses_organization_id ON expenses(organization_id);
CREATE INDEX idx_expenses_site_id ON expenses(site_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_vendors_organization_id ON vendors(organization_id);
CREATE INDEX idx_materials_organization_id ON materials(organization_id);
CREATE INDEX idx_vehicles_organization_id ON vehicles(organization_id);

-- Insert sample organization and site
INSERT INTO organizations (id, name, subscription, is_active) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Gavith Build', 'premium', true);

INSERT INTO sites (id, organization_id, name, location, status, description) 
VALUES ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Gudibande', 'Gudibande, Karnataka, India', 'active', 'Main construction site for Gavith Build');

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow service role to access all data
CREATE POLICY "Service role can do everything" ON organizations FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON sites FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON vendors FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON materials FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON vehicles FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON purchases FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON expenses FOR ALL USING (true);

-- Create policies for anonymous access (for frontend)
CREATE POLICY "Allow anonymous read access" ON organizations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON sites FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON vendors FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON materials FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON purchases FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read access" ON expenses FOR SELECT USING (true);

-- Verify tables were created
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
