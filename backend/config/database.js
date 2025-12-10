const { Pool } = require("pg");
require("dotenv").config();

// Database configuration that works for both local development and production
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        // Production: Use DATABASE_URL (Render provides this)
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        // Local development: Use individual DB_* variables
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

// Additional pool configuration
pool.options = {
  ...pool.options,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL: Connected successfully");

    // Create initial tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        auth_method VARCHAR(20) DEFAULT 'local',
        full_name VARCHAR(255),
        role VARCHAR(20) DEFAULT 'UNVERIFIED',
        assigned_field VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE,
        verification_status VARCHAR(20) DEFAULT 'PENDING',
        verified_by INTEGER,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ PostgreSQL: Users table ready");

    // Create batchmate_submissions table for pending submissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS batchmate_submissions (
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
    `);
    console.log("✅ PostgreSQL: Batchmate submissions table ready");

    // Update batchmates table structure for approved submissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS batchmates (
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
    `);
    console.log("✅ PostgreSQL: Batchmates table ready");

    // Create field_admins table for field-based admin assignment tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_admins (
        id SERIAL PRIMARY KEY,
        field VARCHAR(50) NOT NULL,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deactivated_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);
    console.log("✅ PostgreSQL: Field admins table ready");

    // Add constraint to ensure one active admin per field
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_active_field_admin 
      ON field_admins (field) 
      WHERE is_active = true;
    `);

    // Add constraint to ensure one active assignment per user
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_active_user_field 
      ON field_admins (user_id, field) 
      WHERE is_active = true;
    `);

    client.release();
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    return false;
  }
};

module.exports = { pool, testConnection };
