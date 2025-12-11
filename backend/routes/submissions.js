const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { upload, uploadFile } = require("../utils/fileUpload");

// List of countries for dropdown
const COUNTRIES = [
  "Sri Lanka",
  "India",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "Malaysia",
  "UAE",
  "Qatar",
  "Saudi Arabia",
  "Bangladesh",
  "Pakistan",
  "Nepal",
  "Maldives",
  "China",
  "South Korea",
];

// Submit alumni data (for UNVERIFIED users)
router.post(
  "/submit",
  authenticateToken,
  upload.fields([
    { name: "universityPhoto", maxCount: 1 },
    { name: "currentPhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Check if user is UNVERIFIED
      if (req.user.role !== "UNVERIFIED") {
        return res
          .status(400)
          .json({ error: "Only unverified users can submit data" });
      }

      const {
        callingName,
        fullName,
        nickName,
        address,
        country,
        workingPlace,
        whatsappMobile,
        phoneMobile,
        email,
        field,
      } = req.body;

      // Validate mandatory fields
      if (
        !callingName ||
        !fullName ||
        !whatsappMobile ||
        !email ||
        !country ||
        !field
      ) {
        return res
          .status(400)
          .json({ error: "All mandatory fields are required" });
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Validate field
      const validFields = [
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
      if (!validFields.includes(field)) {
        return res.status(400).json({ error: "Invalid field selection" });
      }

      // Check if user already submitted for this field
      const existingSubmission = await pool.query(
        "SELECT * FROM batchmate_submissions WHERE user_id = $1 AND field = $2",
        [req.user.id, field]
      );

      if (existingSubmission.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "You have already submitted data for this field" });
      }

      // Upload photos
      let universityPhotoUrl = null;
      let currentPhotoUrl = null;

      if (req.files["universityPhoto"]) {
        const uploadResult = await uploadFile(
          req.files["universityPhoto"][0],
          "university-photos"
        );
        if (uploadResult.success) {
          universityPhotoUrl = uploadResult.url;
        } else {
          return res
            .status(500)
            .json({ error: "Failed to upload university photo" });
        }
      }

      if (req.files["currentPhoto"]) {
        const uploadResult = await uploadFile(
          req.files["currentPhoto"][0],
          "current-photos"
        );
        if (uploadResult.success) {
          currentPhotoUrl = uploadResult.url;
        } else {
          return res
            .status(500)
            .json({ error: "Failed to upload current photo" });
        }
      }

      // Create submission
      const result = await pool.query(
        `INSERT INTO batchmate_submissions 
         (calling_name, full_name, nick_name, address, country, working_place, 
          whatsapp_mobile, phone_mobile, email, university_photo_url, 
          current_photo_url, field, user_id, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING') 
         RETURNING *`,
        [
          callingName,
          fullName,
          nickName || null,
          address || null,
          country,
          workingPlace || null,
          whatsappMobile,
          phoneMobile || null,
          email,
          universityPhotoUrl,
          currentPhotoUrl,
          field,
          req.user.id,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Submission received and pending approval",
        submission: result.rows[0],
      });
    } catch (error) {
      console.error("Submission error:", error);
      res.status(500).json({ error: "Failed to submit data" });
    }
  }
);

// Get user's submission status
router.get("/my-submissions", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM batchmate_submissions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      submissions: result.rows,
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Get countries list
router.get("/countries", (req, res) => {
  res.json({
    success: true,
    countries: COUNTRIES.sort(),
  });
});

// Get fields list
router.get("/fields", (req, res) => {
  const fields = [
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
  res.json({
    success: true,
    fields: fields.sort(),
  });
});

module.exports = router;
