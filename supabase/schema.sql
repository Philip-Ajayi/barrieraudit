-- BARRIERAUDIT POSTGRESQL / SUPABASE PERSISTENCE SCHEMA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_id TEXT UNIQUE NOT NULL
);

-- Skin Scans Telemetry table
CREATE TABLE IF NOT EXISTS skin_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    redness_score NUMERIC(5,2) NOT NULL,
    moisture_score NUMERIC(5,2) NOT NULL,
    texture_score NUMERIC(5,2) NOT NULL,
    acne_score NUMERIC(5,2) NOT NULL,
    bir_score NUMERIC(5,2) NOT NULL,
    barrier_status TEXT NOT NULL, -- 'OPTIMAL', 'STRESSED', 'CRITICAL_BARRIER_COLLAPSE'
    mask_storage_url TEXT
);

-- User Shelf Products table
CREATE TABLE IF NOT EXISTS user_shelf_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    brand TEXT,
    detected_actives TEXT[] NOT NULL DEFAULT '{}',
    overall_hazard TEXT NOT NULL, -- 'SAFE_HYDRATING', 'MILD_ACTIVE', 'POTENT_ACTIVE', 'SEVERE_EXFOLIANT'
    is_quarantined BOOLEAN DEFAULT FALSE,
    quarantine_days_remaining INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE skin_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shelf_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts into skin_scans"
    ON skin_scans FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on skin_scans"
    ON skin_scans FOR SELECT USING (true);

CREATE POLICY "Allow public inserts into user_shelf_products"
    ON user_shelf_products FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on user_shelf_products"
    ON user_shelf_products FOR SELECT USING (true);
