const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
require("dotenv").config();

// Configure Passport Google Strategy
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        // Check if user exists
        const userResult = await pool.query(
          "SELECT * FROM users WHERE email = $1 OR google_id = $2",
          [email, id]
        );

        let user = userResult.rows[0];

        if (!user) {
          // Create new user (Alumni - unverified)
          const newUserResult = await pool.query(
            `INSERT INTO users 
           (email, google_id, auth_method, full_name, role, is_verified, verification_status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
            [email, id, "google", displayName, "UNVERIFIED", false, "PENDING"]
          );
          user = newUserResult.rows[0];
        } else if (user.google_id !== id) {
          // User exists but with different auth method
          await pool.query(
            "UPDATE users SET google_id = $1, auth_method = $2 WHERE id = $3",
            [id, "google", user.id]
          );
          user.google_id = id;
          user.auth_method = "google";
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize/Deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      assignedField: user.assigned_field,
      isVerified: user.is_verified,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 1. Committee Login (Email/Password)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND auth_method = $2",
      [email, "local"]
    );

    const user = result.rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid credentials or use Google login" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    // Update last login
    await pool.query(
      "UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        assignedField: user.assigned_field,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// 2. Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const token = generateToken(req.user);

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// 3. Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT id, email, role, full_name, assigned_field, is_verified, verification_status FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// 4. Logout
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// 5. Create admin user (one-time setup)
router.post("/setup-admin", async (req, res) => {
  try {
    // In production, remove or protect this route
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if admin already exists
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: "Admin already exists" });
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

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Setup admin error:", error);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// Logout endpoint
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // If using sessions, you might want to destroy session here
    // For JWT tokens, client just discards the token

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

module.exports = router;
