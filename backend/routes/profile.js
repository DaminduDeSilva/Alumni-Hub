const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { upload, uploadFile } = require("../utils/fileUpload");

// Get user profile
// Get user profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, assigned_field, 
              is_verified, verification_status, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get batchmate data if user is verified
    let batchmateData = null;
    if (result.rows[0].is_verified) {
      const batchmateResult = await pool.query(
        `SELECT * FROM batchmates WHERE user_id = $1 LIMIT 1`,
        [req.user.id]
      );

      if (batchmateResult.rows.length > 0) {
        batchmateData = batchmateResult.rows[0];
      }
    }

    res.json({
      success: true,
      profile: result.rows[0],
      batchmateData: batchmateData,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Alias: GET /me -> same as GET /
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, assigned_field, 
              is_verified, verification_status, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get batchmate data if user is verified
    let batchmateData = null;
    if (result.rows[0].is_verified) {
      const batchmateResult = await pool.query(
        `SELECT * FROM batchmates WHERE user_id = $1 LIMIT 1`,
        [req.user.id]
      );

      if (batchmateResult.rows.length > 0) {
        batchmateData = batchmateResult.rows[0];
      }
    }

    res.json({
      success: true,
      profile: result.rows[0],
      batchmateData: batchmateData,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile (limited fields for regular users)
router.put(
  "/",
  authenticateToken,
  upload.fields([
    { name: "universityPhoto", maxCount: 1 },
    { name: "currentPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { address, country, workingPlace, phoneMobile, nickName } =
        req.body;

      // Get current batchmate data
      const batchmateResult = await pool.query(
        `SELECT id FROM batchmates WHERE user_id = $1 LIMIT 1`,
        [req.user.id]
      );

      if (batchmateResult.rows.length === 0) {
        return res.status(404).json({ error: "No alumni data found" });
      }

      const batchmateId = batchmateResult.rows[0].id;

      // Upload new photos if provided
      let universityPhotoUrl = null;
      let currentPhotoUrl = null;

      if (req.files["universityPhoto"]) {
        const uploadResult = await uploadFile(
          req.files["universityPhoto"][0],
          "university-photos"
        );
        if (uploadResult.success) {
          universityPhotoUrl = uploadResult.url;
        }
      }

      if (req.files["currentPhoto"]) {
        const uploadResult = await uploadFile(
          req.files["currentPhoto"][0],
          "current-photos"
        );
        if (uploadResult.success) {
          currentPhotoUrl = uploadResult.url;
        }
      }

      // Build update query dynamically
      const updates = [];
      const params = [];
      let paramCount = 0;

      // Allowed fields for user to update
      if (address !== undefined) {
        paramCount++;
        updates.push(`address = $${paramCount}`);
        params.push(address);
      }

      if (country !== undefined) {
        paramCount++;
        updates.push(`country = $${paramCount}`);
        params.push(country);
      }

      if (workingPlace !== undefined) {
        paramCount++;
        updates.push(`working_place = $${paramCount}`);
        params.push(workingPlace);
      }

      if (phoneMobile !== undefined) {
        paramCount++;
        updates.push(`phone_mobile = $${paramCount}`);
        params.push(phoneMobile);
      }

      if (nickName !== undefined) {
        paramCount++;
        updates.push(`nick_name = $${paramCount}`);
        params.push(nickName);
      }

      if (universityPhotoUrl !== null) {
        paramCount++;
        updates.push(`university_photo_url = $${paramCount}`);
        params.push(universityPhotoUrl);
      }

      if (currentPhotoUrl !== null) {
        paramCount++;
        updates.push(`current_photo_url = $${paramCount}`);
        params.push(currentPhotoUrl);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      // Add batchmate ID as last parameter
      paramCount++;
      params.push(batchmateId);

      const query = `
      UPDATE batchmates 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        message: "Profile updated successfully",
        batchmate: result.rows[0],
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

// Alias: PUT /me -> same as PUT /
router.put(
  "/me",
  authenticateToken,
  upload.fields([
    { name: "universityPhoto", maxCount: 1 },
    { name: "currentPhoto", maxCount: 1 },
  ]),
  async (req, res, next) => {
    // delegate to original PUT handler by rewriting url and calling router.handle
    return router.handle({ ...req, url: "/" }, res, next);
  }
);

// Admin update (can update all fields) - SUPER_ADMIN only
router.put("/:userId/admin", authenticateToken, async (req, res) => {
  try {
    // Only SUPER_ADMIN can use this
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Super admin access required" });
    }

    const { userId } = req.params;
    const updates = req.body;

    // Get current data
    const currentResult = await pool.query(
      `SELECT * FROM batchmates WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build update query
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    // All fields allowed for admin (except user_id and created_at)
    const allowedFields = [
      "calling_name",
      "full_name",
      "nick_name",
      "address",
      "country",
      "working_place",
      "whatsapp_mobile",
      "phone_mobile",
      "email",
      "university_photo_url",
      "current_photo_url",
      "field",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        params.push(updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Add user_id as last parameter
    paramCount++;
    params.push(userId);

    const query = `
      UPDATE batchmates 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      message: "User data updated by admin",
      batchmate: result.rows[0],
    });
  } catch (error) {
    console.error("Admin update error:", error);
    res.status(500).json({ error: "Failed to update user data" });
  }
});

module.exports = router;
