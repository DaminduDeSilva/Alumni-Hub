const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const {
  authenticateToken,
  requireVerified,
  canViewAlumni,
  canSearchAlumni,
  requireRole,
} = require("../middleware/auth");

// Get own batchmate profile (for verified users)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.email as user_email FROM batchmates b JOIN users u ON b.user_id = u.id WHERE u.id = $1 LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Batchmate profile not found" });
    }

    res.json({ success: true, batchmate: result.rows[0] });
  } catch (error) {
    console.error("Get own batchmate error:", error);
    res.status(500).json({ error: "Failed to fetch own profile" });
  }
});

// Search endpoint (ADMIN only)
router.get("/search", authenticateToken, canSearchAlumni, async (req, res) => {
  try {
    const { q, field, fields, country } = req.query;

    let query = `SELECT * FROM batchmates WHERE 1=1`;
    const params = [];
    let paramCount = 0;

    // Handle multiple fields for reporting (fields comes as array when multiple values)
    const fieldsArray = fields
      ? Array.isArray(fields)
        ? fields
        : [fields]
      : null;

    if (fieldsArray && fieldsArray.length > 0) {
      paramCount++;
      const placeholders = fieldsArray
        .map((_, index) => `$${paramCount + index}`)
        .join(", ");
      query += ` AND field IN (${placeholders})`;
      params.push(...fieldsArray);
      paramCount += fieldsArray.length - 1;
    }
    // Handle single field filter (backward compatibility)
    else if (field) {
      paramCount++;
      query += ` AND field = $${paramCount}`;
      params.push(field);
    }

    if (country) {
      paramCount++;
      query += ` AND country = $${paramCount}`;
      params.push(country);
    }

    if (q) {
      paramCount++;
      query += ` AND (calling_name ILIKE $${paramCount} OR full_name ILIKE $${paramCount} OR nick_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${q}%`);
    }

    // If FIELD_ADMIN, restrict to their assigned field (overrides any field filters)
    if (req.user.role === "FIELD_ADMIN" && req.user.assigned_field) {
      // Remove any previous field conditions and add the restriction
      query = query
        .replace(/AND field = \$\d+/g, "")
        .replace(/AND field IN \([^)]+\)/g, "");
      paramCount++;
      query += ` AND field = $${paramCount}`;
      params.push(req.user.assigned_field);
    }

    query += ` ORDER BY field, full_name`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      batchmates: result.rows,
    });
  } catch (error) {
    console.error("Search batchmates error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get all batchmates (ADMIN only: SUPER_ADMIN or FIELD_ADMIN)
router.get(
  "/",
  authenticateToken,
  requireRole(["SUPER_ADMIN", "FIELD_ADMIN"]),
  async (req, res) => {
    try {
      const { field, fields, country, search } = req.query;

      let query = `
      SELECT * FROM batchmates 
      WHERE 1=1
    `;
      const params = [];
      let paramCount = 0;

      // Handle multiple fields for reporting (fields comes as array when multiple values)
      const fieldsArray = fields
        ? Array.isArray(fields)
          ? fields
          : [fields]
        : null;

      if (fieldsArray && fieldsArray.length > 0) {
        paramCount++;
        const placeholders = fieldsArray
          .map((_, index) => `$${paramCount + index}`)
          .join(", ");
        query += ` AND field IN (${placeholders})`;
        params.push(...fieldsArray);
        paramCount += fieldsArray.length - 1;
      }
      // Handle single field filter (backward compatibility)
      else if (field) {
        paramCount++;
        query += ` AND field = $${paramCount}`;
        params.push(field);
      }

      // Country filter
      if (country) {
        paramCount++;
        query += ` AND country = $${paramCount}`;
        params.push(country);
      }

      // Search filter
      if (search) {
        paramCount++;
        query += ` AND (
        calling_name ILIKE $${paramCount} OR
        full_name ILIKE $${paramCount} OR
        nick_name ILIKE $${paramCount} OR
        email ILIKE $${paramCount}
      )`;
        params.push(`%${search}%`);
      }

      // Restrict FIELD_ADMIN to their assigned field (overrides any field filters)
      if (req.user.role === "FIELD_ADMIN" && req.user.assigned_field) {
        // Remove any previous field conditions and add the restriction
        query = query
          .replace(/AND field = \$\d+/g, "")
          .replace(/AND field IN \([^)]+\)/g, "");
        // Reset params to remove field-related parameters
        const nonFieldParams = [];
        let newParamCount = 0;

        // Re-add country filter if exists
        if (country) {
          newParamCount++;
          query = query.replace(
            /AND country = \$\d+/g,
            ` AND country = $${newParamCount}`
          );
          nonFieldParams.push(country);
        }

        // Re-add search filter if exists
        if (search) {
          newParamCount++;
          const searchPattern = /AND \(.*ILIKE \$\d+.*\)/g;
          query = query.replace(
            searchPattern,
            ` AND (
        calling_name ILIKE $${newParamCount} OR
        full_name ILIKE $${newParamCount} OR
        nick_name ILIKE $${newParamCount} OR
        email ILIKE $${newParamCount}
      )`
          );
          nonFieldParams.push(`%${search}%`);
        }

        // Add field admin restriction
        newParamCount++;
        query += ` AND field = $${newParamCount}`;
        nonFieldParams.push(req.user.assigned_field);

        // Update params array
        params.length = 0;
        params.push(...nonFieldParams);
        paramCount = newParamCount;
      }

      query += ` ORDER BY field, full_name`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        count: result.rows.length,
        batchmates: result.rows,
      });
    } catch (error) {
      console.error("Get batchmates error:", error);
      res.status(500).json({ error: "Failed to fetch batchmates" });
    }
  }
);

// Get batchmate by ID (access controlled)
router.get("/:id", authenticateToken, canViewAlumni, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT b.*, u.email as user_email, u.full_name as user_full_name
       FROM batchmates b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Batchmate not found" });
    }

    res.json({
      success: true,
      batchmate: result.rows[0],
    });
  } catch (error) {
    console.error("Get batchmate error:", error);
    res.status(500).json({ error: "Failed to fetch batchmate" });
  }
});

// Get statistics
// Get statistics (ADMIN only)
router.get(
  "/stats/overview",
  authenticateToken,
  requireRole(["SUPER_ADMIN", "FIELD_ADMIN"]),
  async (req, res) => {
    try {
      // Field-wise count
      const fieldStats = await pool.query(`
      SELECT field, COUNT(*) as count 
      FROM batchmates 
      GROUP BY field 
      ORDER BY field
    `);

      // Country-wise count
      const countryStats = await pool.query(`
      SELECT country, COUNT(*) as count 
      FROM batchmates 
      GROUP BY country 
      ORDER BY count DESC
      LIMIT 10
    `);

      // Total count
      const totalResult = await pool.query("SELECT COUNT(*) FROM batchmates");
      const total = parseInt(totalResult.rows[0].count);

      res.json({
        success: true,
        stats: {
          total,
          byField: fieldStats.rows,
          byCountry: countryStats.rows,
        },
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  }
);

module.exports = router;
