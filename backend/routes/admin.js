const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

// Middleware to check admin access (SUPER_ADMIN or FIELD_ADMIN)
const isAdmin = (req, res, next) => {
  if (!["SUPER_ADMIN", "FIELD_ADMIN"].includes(req.user.role)) {
    return res.status(403).json({
      error: "Admin access required",
      userRole: req.user.role,
    });
  }
  next();
};

// Middleware to check super admin access only
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      error: "Super admin access required",
      userRole: req.user.role,
    });
  }
  next();
};

// Get pending submissions (with field-based access)
router.get(
  "/submissions/pending",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      let query = `
      SELECT bs.*, 
             u.email as user_email, 
             u.full_name as user_full_name,
             u.role as user_role
      FROM batchmate_submissions bs
      JOIN users u ON bs.user_id = u.id
      WHERE bs.status = 'PENDING'
    `;

      const params = [];

      // If user is FIELD_ADMIN, restrict to their field
      if (req.user.role === "FIELD_ADMIN" && req.user.assigned_field) {
        query += ` AND bs.field = $1`;
        params.push(req.user.assigned_field);
      }
      // SUPER_ADMIN sees all (no restriction)

      query += ` ORDER BY bs.created_at DESC`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        submissions: result.rows,
        userRole: req.user.role,
        assignedField: req.user.assigned_field,
      });
    } catch (error) {
      console.error("Get pending submissions error:", error);
      res.status(500).json({ error: "Failed to fetch pending submissions" });
    }
  }
);

// Get all submissions with status filter
router.get("/submissions", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT bs.*, 
             u.email as user_email, 
             u.full_name as user_full_name,
             u.role as user_role,
             ru.email as reviewer_email
      FROM batchmate_submissions bs
      JOIN users u ON bs.user_id = u.id
      LEFT JOIN users ru ON bs.reviewed_by = ru.id
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` WHERE bs.status = $${paramCount}`;
      params.push(status);
    }

    // If user is FIELD_ADMIN, restrict to their field
    if (req.user.role === "FIELD_ADMIN" && req.user.assigned_field) {
      if (status) {
        paramCount++;
        query += ` AND bs.field = $${paramCount}`;
      } else {
        paramCount++;
        query += ` WHERE bs.field = $${paramCount}`;
      }
      params.push(req.user.assigned_field);
    }

    query += ` ORDER BY bs.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      submissions: result.rows,
      userRole: req.user.role,
      assignedField: req.user.assigned_field,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Approve submission (updated to handle FIELD_ADMIN)
router.put(
  "/submissions/:id/approve",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedField = null } = req.body;

      // Check if user has permission to approve this submission
      const submissionResult = await pool.query(
        `SELECT bs.*, u.role as user_role 
       FROM batchmate_submissions bs
       JOIN users u ON bs.user_id = u.id
       WHERE bs.id = $1 AND bs.status = 'PENDING'`,
        [id]
      );

      if (submissionResult.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Submission not found or already processed" });
      }

      const submission = submissionResult.rows[0];

      // FIELD_ADMIN can only approve submissions from their field
      if (
        req.user.role === "FIELD_ADMIN" &&
        req.user.assigned_field !== submission.field
      ) {
        return res.status(403).json({
          error: `You can only approve submissions for ${req.user.assigned_field} field`,
        });
      }

      // SUPER_ADMIN can assign as FIELD_ADMIN, FIELD_ADMIN cannot
      let userRole = "VERIFIED_USER";
      if (req.user.role === "SUPER_ADMIN" && assignedField) {
        userRole = "FIELD_ADMIN";
      }

      // Start transaction
      await pool.query("BEGIN");

      // Update submission status
      await pool.query(
        `UPDATE batchmate_submissions 
       SET status = 'APPROVED', 
           reviewed_by = $1, 
           reviewed_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
        [req.user.id, id]
      );

      // Update user
      await pool.query(
        `UPDATE users 
       SET role = $1, 
           assigned_field = $2, 
           is_verified = true, 
           verification_status = 'APPROVED',
           verified_by = $3,
           verified_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
        [userRole, assignedField, req.user.id, submission.user_id]
      );

      // Add to batchmates
      await pool.query(
        `INSERT INTO batchmates 
       (calling_name, full_name, nick_name, address, country, working_place,
        whatsapp_mobile, phone_mobile, email, university_photo_url,
        current_photo_url, field, user_id, approved_by, approved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)`,
        [
          submission.calling_name,
          submission.full_name,
          submission.nick_name,
          submission.address,
          submission.country,
          submission.working_place,
          submission.whatsapp_mobile,
          submission.phone_mobile,
          submission.email,
          submission.university_photo_url,
          submission.current_photo_url,
          submission.field,
          submission.user_id,
          req.user.id,
        ]
      );

      await pool.query("COMMIT");

      res.json({
        success: true,
        message: "Submission approved successfully",
        userRole: userRole,
        assignedField: assignedField,
        approvedBy: req.user.role,
      });
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Approve submission error:", error);
      res.status(500).json({ error: "Failed to approve submission" });
    }
  }
);

// Reject submission
router.put(
  "/submissions/:id/reject",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Check if user has permission to reject this submission
      if (req.user.role === "FIELD_ADMIN") {
        const submissionResult = await pool.query(
          `SELECT field FROM batchmate_submissions WHERE id = $1 AND status = 'PENDING'`,
          [id]
        );

        if (submissionResult.rows.length === 0) {
          return res
            .status(404)
            .json({ error: "Submission not found or already processed" });
        }

        if (submissionResult.rows[0].field !== req.user.assigned_field) {
          return res.status(403).json({
            error: `You can only reject submissions for ${req.user.assigned_field} field`,
          });
        }
      }

      const result = await pool.query(
        `UPDATE batchmate_submissions 
       SET status = 'REJECTED', 
           reviewed_by = $1, 
           reviewed_at = CURRENT_TIMESTAMP,
           rejection_reason = $2
       WHERE id = $3 AND status = 'PENDING'
       RETURNING *`,
        [req.user.id, reason, id]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Submission not found or already processed" });
      }

      res.json({
        success: true,
        message: "Submission rejected",
        submission: result.rows[0],
      });
    } catch (error) {
      console.error("Reject submission error:", error);
      res.status(500).json({ error: "Failed to reject submission" });
    }
  }
);

// Get verified users for field admin assignment (SUPER_ADMIN only)
router.get(
  "/users/verified",
  authenticateToken,
  isSuperAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, email, full_name, role, assigned_field
       FROM users 
       WHERE is_verified = true AND role != 'SUPER_ADMIN'
       ORDER BY full_name, email`
      );

      res.json({
        success: true,
        users: result.rows,
      });
    } catch (error) {
      console.error("Get verified users error:", error);
      res.status(500).json({ error: "Failed to fetch verified users" });
    }
  }
);

// Get users available for a specific field assignment (SUPER_ADMIN only)
router.get(
  "/users/available/:field",
  authenticateToken,
  isSuperAdmin,
  async (req, res) => {
    try {
      const { field } = req.params;

      // Get users who are not already field admin for this specific field
      // Only include users who are alumni from the same field (from batchmates table)
      const result = await pool.query(
        `SELECT u.id, u.email, u.full_name, u.role, u.assigned_field
         FROM users u
         WHERE u.is_verified = true 
           AND u.role != 'SUPER_ADMIN'
           AND NOT (u.role = 'FIELD_ADMIN' AND u.assigned_field = $1)
           AND u.id IN (
             SELECT b.user_id FROM batchmates b WHERE b.field = $1
           )
         ORDER BY u.full_name, u.email`,
        [field]
      );

      res.json({
        success: true,
        users: result.rows,
        field: field,
        message: `Users available for ${field} field assignment (from ${field} alumni)`,
      });
    } catch (error) {
      console.error("Get available users for field error:", error);
      res.status(500).json({ error: "Failed to fetch available users" });
    }
  }
);

module.exports = router;
