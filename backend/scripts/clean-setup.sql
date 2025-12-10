-- CLEAN SETUP FOR ALUMNI HUB
-- Drops all tables and recreates with correct schema

-- Drop tables in correct order (due to foreign keys)
DROP TABLE IF EXISTS batchmate_submissions CASCADE;
DROP TABLE IF EXISTS batchmates CASCADE;
DROP TABLE IF EXISTS field_admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),  -- For SUPER_ADMIN only (others use Google)
  google_id VARCHAR(255) UNIQUE,
  auth_method VARCHAR(20) NOT NULL DEFAULT 'local',
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
  assigned_field VARCHAR(50),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'PENDING',
  verified_by INTEGER,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Batchmates table (approved alumni)
CREATE TABLE batchmates (
  id SERIAL PRIMARY KEY,
  calling_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  nick_name VARCHAR(100),
  address TEXT,
  country VARCHAR(100) NOT NULL,
  working_place VARCHAR(255),
  whatsapp_mobile VARCHAR(20) NOT NULL,
  phone_mobile VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  university_photo_url VARCHAR(500),
  current_photo_url VARCHAR(500),
  field VARCHAR(50) NOT NULL CHECK (
    field IN ('Chemical', 'Civil', 'Computer', 'Electrical', 'Electronics', 
              'Material', 'Mechanical', 'Mining', 'Textile')
  ),
  user_id INTEGER REFERENCES users(id) NOT NULL,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, field)
);

-- 3. Submissions table (pending approval)
CREATE TABLE batchmate_submissions (
  id SERIAL PRIMARY KEY,
  calling_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  nick_name VARCHAR(100),
  address TEXT,
  country VARCHAR(100) NOT NULL,
  working_place VARCHAR(255),
  whatsapp_mobile VARCHAR(20) NOT NULL,
  phone_mobile VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  university_photo_url VARCHAR(500),
  current_photo_url VARCHAR(500),
  field VARCHAR(50) NOT NULL CHECK (
    field IN ('Chemical', 'Civil', 'Computer', 'Electrical', 'Electronics', 
              'Material', 'Mechanical', 'Mining', 'Textile')
  ),
  user_id INTEGER REFERENCES users(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, field)
);

-- 4. Field Admins tracking table
CREATE TABLE field_admins (
  id SERIAL PRIMARY KEY,
  field VARCHAR(50) NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- One active admin per field
CREATE UNIQUE INDEX unique_active_field_admin 
ON field_admins (field) 
WHERE is_active = true;

-- 5. Insert ONLY SUPER_ADMIN (hardcoded)
INSERT INTO users (
  email, 
  password_hash, 
  auth_method, 
  full_name, 
  role, 
  is_verified, 
  verification_status
) VALUES (
  'admin@alumni.edu',
  '$2b$10$SW9qsfj/8rUdpz8uCOQRtex4pTM1rjT/VRlotkbRXjYs4S79KG/ni', -- Hash of 'Admin@123'
  'local',
  'System Administrator',
  'SUPER_ADMIN',
  true,
  'APPROVED'
);

-- Display setup status
SELECT '✅ Database setup completed' as message;
SELECT 'SUPER_ADMIN created: admin@alumni.edu / Admin@123' as credentials;
SELECT 'No FIELD_ADMINs created yet - SUPER_ADMIN will assign them' as note;

-- Show tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;