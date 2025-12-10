const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");
require("dotenv").config();

async function setupAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
      process.exit(1);
    }

    // Check if admin already exists
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create SUPER_ADMIN
    const result = await pool.query(
      `INSERT INTO users 
       (email, password_hash, auth_method, role, is_verified, verification_status, full_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, email, role`,
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

    console.log("✅ Admin user created successfully:");
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Role: ${result.rows[0].role}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupAdmin();
