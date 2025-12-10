const express = require("express");
const { pool } = require("../config/database");
const { authenticateToken, requireRole } = require("../middleware/auth");
const router = express.Router();

// List of valid engineering fields
const VALID_FIELDS = [
  "Chemical",
  "Civil",
  "Computer",
  "Electrical",
  "Electronics",
  "Material",
  "Mechanical",
  "Mining",
  "Textile",
];

// GET /api/field-admins - List all field admins
router.get(
  "/",
  authenticateToken,
  requireRole(["SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const query = `
      SELECT 
        fa.id,
        fa.field,
        fa.user_id,
        fa.assigned_at,
        fa.is_active,
        u.email,
        u.full_name,
        assigned_by_user.full_name as assigned_by_name
      FROM field_admins fa
      JOIN users u ON fa.user_id = u.id
      LEFT JOIN users assigned_by_user ON fa.assigned_by = assigned_by_user.id
      WHERE fa.is_active = true
      ORDER BY fa.field
    `;

      const result = await pool.query(query);

      // Create a complete list showing all fields with their assigned admins
      const fieldAdmins = VALID_FIELDS.map((field) => {
        const admin = result.rows.find((row) => row.field === field);
        return {
          field,
          admin: admin || null,
        };
      });

      res.json({
        success: true,
        fieldAdmins,
      });
    } catch (error) {
      console.error("Error fetching field admins:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch field admins",
        error: error.message,
      });
    }
  }
);

// POST /api/field-admins/assign - Assign user as field admin
router.post(
  "/assign",
  authenticateToken,
  requireRole(["SUPER_ADMIN"]),
  async (req, res) => {
    const { userId, field } = req.body;

    try {
      // Validate input
      if (!userId || !field) {
        return res.status(400).json({
          success: false,
          message: "User ID and field are required",
        });
      }

      if (!VALID_FIELDS.includes(field)) {
        return res.status(400).json({
          success: false,
          message: "Invalid field specified",
        });
      }

      // Check if user exists and is verified
      const userCheck = await pool.query(
        "SELECT id, email, full_name, role, is_verified FROM users WHERE id = $1",
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = userCheck.rows[0];

      if (!user.is_verified) {
        return res.status(400).json({
          success: false,
          message: "Only verified users can be assigned as field admins",
        });
      }

      if (user.role === "SUPER_ADMIN") {
        return res.status(400).json({
          success: false,
          message: "Super admin cannot be assigned as field admin",
        });
      }

      // Check if field already has an active admin (only prevent if it's the same user)
      const existingAdmin = await pool.query(
        "SELECT user_id FROM field_admins WHERE field = $1 AND is_active = true",
        [field]
      );

      if (
        existingAdmin.rows.length > 0 &&
        existingAdmin.rows[0].user_id === parseInt(userId)
      ) {
        return res.status(400).json({
          success: false,
          message: `User is already the active admin for ${field}`,
        });
      }

      // Check if user is already a field admin for another field
      const userFieldAdmin = await pool.query(
        "SELECT field FROM field_admins WHERE user_id = $1 AND is_active = true",
        [userId]
      );

      if (userFieldAdmin.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `User is already a field admin for ${userFieldAdmin.rows[0].field}`,
        });
      }

      // Begin transaction
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // If there's an active admin for this field, deactivate them first
        const currentActiveAdmin = await client.query(
          "SELECT user_id FROM field_admins WHERE field = $1 AND is_active = true",
          [field]
        );

        if (currentActiveAdmin.rows.length > 0) {
          const currentAdminId = currentActiveAdmin.rows[0].user_id;

          // Deactivate the current admin
          await client.query(
            "UPDATE field_admins SET is_active = false WHERE field = $1 AND user_id = $2",
            [field, currentAdminId]
          );

          // Update the old admin's role back to ALUMNI
          await client.query(
            "UPDATE users SET role = 'ALUMNI', assigned_field = NULL WHERE id = $1",
            [currentAdminId]
          );
        }

        // Check if there's an existing inactive record for this user-field combination
        const existingRecord = await client.query(
          "SELECT id FROM field_admins WHERE user_id = $1 AND field = $2",
          [userId, field]
        );

        if (existingRecord.rows.length > 0) {
          // Update existing record to active
          await client.query(
            `UPDATE field_admins 
             SET is_active = true, assigned_by = $1, assigned_at = CURRENT_TIMESTAMP 
             WHERE user_id = $2 AND field = $3`,
            [req.user.id, userId, field]
          );
        } else {
          // Insert new field admin record
          await client.query(
            `INSERT INTO field_admins (field, user_id, assigned_by, assigned_at, is_active)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, true)`,
            [field, userId, req.user.id]
          );
        }

        // Update user role and assigned field
        await client.query(
          "UPDATE users SET role = $1, assigned_field = $2 WHERE id = $3",
          ["FIELD_ADMIN", field, userId]
        );

        await client.query("COMMIT");

        res.json({
          success: true,
          message: `Successfully assigned ${user.full_name} as ${field} field admin`,
          fieldAdmin: {
            field,
            user: {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
            },
          },
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error assigning field admin:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign field admin",
        error: error.message,
      });
    }
  }
);

// DELETE /api/field-admins/:field - Remove field admin
router.delete(
  "/:field",
  authenticateToken,
  requireRole(["SUPER_ADMIN"]),
  async (req, res) => {
    const { field } = req.params;

    try {
      if (!VALID_FIELDS.includes(field)) {
        return res.status(400).json({
          success: false,
          message: "Invalid field specified",
        });
      }

      // Check if field has an active admin
      const existingAdmin = await pool.query(
        `SELECT fa.*, u.full_name, u.email 
       FROM field_admins fa
       JOIN users u ON fa.user_id = u.id
       WHERE fa.field = $1 AND fa.is_active = true`,
        [field]
      );

      if (existingAdmin.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No active admin found for ${field} field`,
        });
      }

      const admin = existingAdmin.rows[0];

      // Begin transaction
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // Deactivate field admin record
        await client.query(
          "UPDATE field_admins SET is_active = false WHERE field = $1 AND user_id = $2",
          [field, admin.user_id]
        );

        // Update user role back to VERIFIED_USER and clear assigned field
        await client.query(
          "UPDATE users SET role = $1, assigned_field = NULL WHERE id = $2",
          ["VERIFIED_USER", admin.user_id]
        );

        await client.query("COMMIT");

        res.json({
          success: true,
          message: `Successfully removed ${admin.full_name} as ${field} field admin`,
          removedAdmin: {
            field,
            user: {
              id: admin.user_id,
              email: admin.email,
              full_name: admin.full_name,
            },
          },
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error removing field admin:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove field admin",
        error: error.message,
      });
    }
  }
);

// GET /api/field-admins/verified-users - List verified users for assignment
router.get(
  "/verified-users",
  authenticateToken,
  requireRole(["SUPER_ADMIN"]),
  async (req, res) => {
    try {
      const query = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.assigned_field,
        fa.field as current_field_admin
      FROM users u
      LEFT JOIN field_admins fa ON u.id = fa.user_id AND fa.is_active = true
      WHERE u.is_verified = true 
        AND u.role != 'SUPER_ADMIN'
      ORDER BY u.full_name
    `;

      const result = await pool.query(query);

      res.json({
        success: true,
        users: result.rows,
      });
    } catch (error) {
      console.error("Error fetching verified users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch verified users",
        error: error.message,
      });
    }
  }
);

module.exports = router;
