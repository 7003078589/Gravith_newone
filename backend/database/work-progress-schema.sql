-- Work Progress Table Schema
-- Run this in Supabase SQL Editor

-- Create work_progress table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_progress_site_id ON work_progress(site_id);
CREATE INDEX IF NOT EXISTS idx_work_progress_work_date ON work_progress(work_date);
CREATE INDEX IF NOT EXISTS idx_work_progress_organization_id ON work_progress(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_progress_status ON work_progress(status);

-- Add RLS (Row Level Security) policies
ALTER TABLE work_progress ENABLE ROW LEVEL SECURITY;

-- Policy for organization-based access
CREATE POLICY "Users can view work progress for their organization" ON work_progress
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM organizations WHERE id = organization_id
    )
  );

CREATE POLICY "Users can insert work progress for their organization" ON work_progress
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE id = organization_id
    )
  );

CREATE POLICY "Users can update work progress for their organization" ON work_progress
  FOR UPDATE USING (
    organization_id IN (
      SELECT id FROM organizations WHERE id = organization_id
    )
  );

CREATE POLICY "Users can delete work progress for their organization" ON work_progress
  FOR DELETE USING (
    organization_id IN (
      SELECT id FROM organizations WHERE id = organization_id
    )
  );
