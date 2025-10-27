-- Gavith Build Database Schema
-- Execute this script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    subscription VARCHAR(20) CHECK (subscription IN ('free', 'basic', 'premium', 'enterprise')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- 2. USERS Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('admin', 'user')) DEFAULT 'user',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_role VARCHAR(20) CHECK (organization_role IN ('owner', 'admin', 'manager', 'user')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SITES Table
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    expected_end_date DATE,
    budget DECIMAL(15,2) DEFAULT 0,
    spent DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TENDERS Table
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_number VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tender_amount DECIMAL(15,2) NOT NULL,
    emd_amount DECIMAL(15,2) NOT NULL,
    emd_paid BOOLEAN DEFAULT false,
    emd_paid_date DATE,
    emd_paid_reference VARCHAR(255),
    emd_returned BOOLEAN DEFAULT false,
    emd_return_date DATE,
    emd_return_reference VARCHAR(255),
    submission_date DATE NOT NULL,
    opening_date DATE,
    location VARCHAR(500),
    project_type VARCHAR(100),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('draft', 'submitted', 'under-evaluation', 'won', 'lost', 'closed')) DEFAULT 'draft',
    converted_to_site_id UUID REFERENCES sites(id),
    conversion_date DATE,
    description TEXT,
    evaluation_criteria TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TENDER_DOCUMENTS Table
CREATE TABLE tender_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    collected BOOLEAN DEFAULT false,
    collected_date DATE,
    file_url VARCHAR(500),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. MATERIALS Table (Master)
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Cement', 'Steel', 'Concrete', 'Bricks', 'Sand', 'Aggregate', 'Timber', 'Electrical', 'Plumbing', 'Paint', 'Other')),
    unit VARCHAR(50) NOT NULL,
    standard_rate DECIMAL(10,2),
    hsn VARCHAR(20),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. MATERIAL_PURCHASES Table
CREATE TABLE material_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    material_name VARCHAR(255) NOT NULL,
    site_id UUID REFERENCES sites(id),
    site_name VARCHAR(255),
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    vendor_invoice_number VARCHAR(255),
    purchase_date DATE NOT NULL,
    filled_weight DECIMAL(10,3),
    empty_weight DECIMAL(10,3),
    net_weight DECIMAL(10,3),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MATERIAL_RECEIPTS Table
CREATE TABLE material_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    vehicle_number VARCHAR(50),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    material_name VARCHAR(255) NOT NULL,
    filled_weight DECIMAL(10,3) NOT NULL,
    empty_weight DECIMAL(10,3) NOT NULL,
    net_weight DECIMAL(10,3) NOT NULL,
    linked_purchase_id UUID REFERENCES material_purchases(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. VENDORS Table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Materials', 'Equipment', 'Labour', 'Transport', 'Professional', 'Other')),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    gst_number VARCHAR(15),
    pan_number VARCHAR(10),
    bank_name VARCHAR(255),
    bank_branch VARCHAR(255),
    account_name VARCHAR(255),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    payment_terms VARCHAR(255),
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    total_paid DECIMAL(15,2) DEFAULT 0,
    pending_amount DECIMAL(15,2) DEFAULT 0,
    last_payment DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'blocked')) DEFAULT 'active',
    registration_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. VEHICLES Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_number VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    status VARCHAR(20) CHECK (status IN ('available', 'in-use', 'maintenance')) DEFAULT 'available',
    site_id UUID REFERENCES sites(id),
    operator VARCHAR(255),
    is_rental BOOLEAN DEFAULT false,
    fuel_capacity DECIMAL(8,2),
    current_fuel_level DECIMAL(8,2),
    mileage DECIMAL(8,2),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    insurance_expiry DATE,
    registration_expiry DATE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. VEHICLE_USAGE Table
CREATE TABLE vehicle_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    hours_worked DECIMAL(5,2),
    distance_covered DECIMAL(8,2),
    fuel_consumed DECIMAL(8,2),
    operator VARCHAR(255),
    work_description TEXT,
    recorded_by UUID REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. VEHICLE_REFUELING Table
CREATE TABLE vehicle_refueling (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    fuel_amount DECIMAL(8,2) NOT NULL,
    fuel_cost DECIMAL(10,2) NOT NULL,
    odometer_reading DECIMAL(10,2),
    fuel_station VARCHAR(255),
    receipt_number VARCHAR(255),
    recorded_by UUID REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. EXPENSES Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Labour', 'Materials', 'Equipment', 'Transport', 'Utilities', 'Other')) NOT NULL,
    subcategory VARCHAR(100),
    date DATE NOT NULL,
    vendor VARCHAR(255),
    site_id UUID REFERENCES sites(id),
    site_name VARCHAR(255),
    receipt VARCHAR(500),
    status VARCHAR(20) CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. PAYMENTS Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'overdue')) DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date DATE,
    site_id UUID REFERENCES sites(id),
    site_name VARCHAR(255),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. WORK_PROGRESS Table
CREATE TABLE work_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    site_name VARCHAR(255) NOT NULL,
    work_type VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    unit VARCHAR(50),
    length DECIMAL(10,3),
    breadth DECIMAL(10,3),
    thickness DECIMAL(10,3),
    total_quantity DECIMAL(10,3),
    labor_hours DECIMAL(8,2),
    progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,
    photos JSONB,
    status VARCHAR(20) CHECK (status IN ('In Progress', 'Completed', 'On Hold')) DEFAULT 'In Progress',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. SITE_LABOUR Table
CREATE TABLE site_labour (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    contact_no VARCHAR(20),
    daily_wage DECIMAL(10,2),
    hourly_rate DECIMAL(10,2),
    days_worked INTEGER DEFAULT 0,
    hours_worked DECIMAL(8,2) DEFAULT 0,
    skill_category VARCHAR(50) CHECK (skill_category IN ('Mason', 'Helper', 'Electrician', 'Plumber', 'Carpenter', 'Operator', 'Other')),
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. SITE_VEHICLES Table
CREATE TABLE site_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    vehicle_name VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('Excavator', 'Crane', 'Truck', 'Mixer', 'JCB', 'Loader', 'Compactor', 'Generator', 'Other')),
    registration_number VARCHAR(50),
    operator VARCHAR(255),
    rental_cost_per_day DECIMAL(10,2),
    fuel_cost_per_day DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    total_days INTEGER,
    total_cost DECIMAL(15,2),
    vendor VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('active', 'maintenance', 'idle', 'returned')) DEFAULT 'active',
    fuel_consumed DECIMAL(8,2) DEFAULT 0,
    last_maintenance_date DATE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_sites_organization_id ON sites(organization_id);
CREATE INDEX idx_tenders_organization_id ON tenders(organization_id);
CREATE INDEX idx_materials_organization_id ON materials(organization_id);
CREATE INDEX idx_vendors_organization_id ON vendors(organization_id);
CREATE INDEX idx_vehicles_organization_id ON vehicles(organization_id);
CREATE INDEX idx_expenses_organization_id ON expenses(organization_id);
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_work_progress_organization_id ON work_progress(organization_id);
CREATE INDEX idx_site_labour_organization_id ON site_labour(organization_id);
CREATE INDEX idx_site_vehicles_organization_id ON site_vehicles(organization_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_purchases_updated_at BEFORE UPDATE ON material_purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_receipts_updated_at BEFORE UPDATE ON material_receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_usage_updated_at BEFORE UPDATE ON vehicle_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_refueling_updated_at BEFORE UPDATE ON vehicle_refueling FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_progress_updated_at BEFORE UPDATE ON work_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_labour_updated_at BEFORE UPDATE ON site_labour FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_vehicles_updated_at BEFORE UPDATE ON site_vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
