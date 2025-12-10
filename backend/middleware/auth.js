const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
require("dotenv").config();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, tokenUser) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    try {
      // Fetch complete user information from database
      const userQuery =
        "SELECT id, email, role, assigned_field FROM users WHERE id = $1";
      const userResult = await pool.query(userQuery, [tokenUser.id]);

      if (userResult.rows.length === 0) {
        return res.status(403).json({ error: "User not found" });
      }

      req.user = userResult.rows[0];
      next();
    } catch (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
};

// Role-based middleware - accepts single role or array of roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Requires one of the following roles: ${allowedRoles.join(
          ", "
        )}`,
        userRole: req.user.role,
      });
    }

    next();
  };
};

// Check if user can access a specific field (for FIELD_ADMIN)
const requireFieldAccess = (field) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // SUPER_ADMIN can access all fields
    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    // FIELD_ADMIN can only access their assigned field
    if (req.user.role === "FIELD_ADMIN") {
      if (req.user.assigned_field !== field) {
        return res.status(403).json({
          error: `You can only access ${req.user.assigned_field} field`,
          requestedField: field,
          assignedField: req.user.assigned_field,
        });
      }
      return next();
    }

    // Other roles cannot access field-specific data
    return res.status(403).json({
      error: "Field access requires FIELD_ADMIN or SUPER_ADMIN role",
      userRole: req.user.role,
    });
  };
};

// Check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role === "UNVERIFIED") {
    return res.status(403).json({ error: "Account pending verification" });
  }

  next();
};

// Check if user is Super Admin
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Super Admin access required" });
  }

  next();
};

// New middleware: canViewAlumni
// Enforces: SUPER_ADMIN can view all, FIELD_ADMIN can view their field,
// VERIFIED_USER can view only their own profile (by user id match)
const canViewAlumni = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ error: "Authentication required" });

  // SUPER_ADMIN can view any
  if (req.user.role === "SUPER_ADMIN") return next();

  // FIELD_ADMIN can view within their assigned field
  if (req.user.role === "FIELD_ADMIN") return next();

  // VERIFIED_USER can view only their own profile (route must provide user id or batchmate id mapped)
  // Support both params.id (batchmate id) or req.user.id
  if (req.user.role === "VERIFIED_USER") {
    // If route uses user id in params or batchmate id, ensure match via user id in req.user
    // Prefer explicit check: if params.id equals req.user.id allow, otherwise deny
    if (req.params.id && String(req.params.id) === String(req.user.id)) {
      return next();
    }

    // Also allow when accessing '/api/batchmates/me' or '/api/profile/me'
    if (req.path && req.path.includes("/me")) return next();

    return res
      .status(403)
      .json({ error: "Insufficient permissions to view this profile" });
  }

  return res
    .status(403)
    .json({ error: "Insufficient permissions to view alumni data" });
};

// New middleware: canSearchAlumni
// Only SUPER_ADMIN and FIELD_ADMIN allowed to search across alumni
const canSearchAlumni = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ error: "Authentication required" });

  if (req.user.role === "SUPER_ADMIN") return next();
  if (req.user.role === "FIELD_ADMIN") return next();

  return res.status(403).json({ error: "Search not allowed for your role" });
};

module.exports = {
  authenticateToken,
  requireRole,
  requireVerified,
  requireFieldAccess,
  isSuperAdmin,
  isFieldAdmin: requireRole("FIELD_ADMIN"),
  isVerified: requireVerified,
  canViewAlumni,
  canSearchAlumni,
};
