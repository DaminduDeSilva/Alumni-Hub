// Database inspection endpoint
const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

const inspectDatabase = async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const tables = {};
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Get table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      // Get row count
      const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName};`);
      
      tables[tableName] = {
        columns: columnsResult.rows,
        rowCount: parseInt(countResult.rows[0].count)
      };
    }
    
    client.release();
    
    res.json({
      success: true,
      database: "alumni_hub",
      tables: tables
    });
  } catch (error) {
    console.error("Database inspection error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Check if admin user exists
const checkAdmin = async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, email, role, created_at 
      FROM users 
      WHERE role = 'SUPER_ADMIN' 
      ORDER BY created_at;
    `);
    client.release();
    
    res.json({
      success: true,
      adminUsers: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create admin user
const createAdmin = async (req, res) => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables"
      });
    }

    const client = await pool.connect();

    // Check if admin already exists
    const checkResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      client.release();
      return res.json({
        success: true,
        message: "Admin user already exists",
        admin: checkResult.rows[0]
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create SUPER_ADMIN
    const result = await client.query(
      `INSERT INTO users 
       (email, password_hash, auth_method, role, is_verified, verification_status, full_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, email, role, created_at`,
      [
        email,
        passwordHash,
        "local",
        "SUPER_ADMIN",
        true,
        "APPROVED",
        "System Administrator",
      ]
    );

    client.release();

    res.json({
      success: true,
      message: "Admin user created successfully",
      admin: result.rows[0]
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { inspectDatabase, checkAdmin, createAdmin };
