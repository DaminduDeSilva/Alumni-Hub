const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();

const { testConnection } = require("./config/database");
// Import both storage systems
const { initializeMinIO } = require("./config/minio");
const cloudinaryConfig =
  process.env.NODE_ENV === "production" ? require("./config/cloudinary") : null;

const authRoutes = require("./routes/auth");
const submissionRoutes = require("./routes/submissions");
const adminRoutes = require("./routes/admin");
const batchmateRoutes = require("./routes/batchmates");
const profileRoutes = require("./routes/profile");
const fieldAdminRoutes = require("./routes/fieldAdmins");
const { authenticateToken } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL]
      : ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Session configuration (for Passport)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Authentication routes
app.use("/api/auth", authRoutes);

// Phase 3 routes
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/batchmates", batchmateRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/field-admins", fieldAdminRoutes);

// Database inspection routes (for debugging)
const {
  inspectDatabase,
  checkAdmin,
  createAdmin,
} = require("./controllers/database");
const { debugEnv } = require("./controllers/debug");
app.get("/api/debug/database", inspectDatabase);
app.get("/api/debug/admin", checkAdmin);
app.post("/api/debug/create-admin", createAdmin);
app.get("/api/debug/setup-admin", createAdmin); // GET version for easy access
app.get("/api/debug/env", debugEnv); // Environment debug

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Alumni Hub Backend",
    version: "2.0.0", // Updated to force redeploy
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    endpoints: {
      health: "/api/health",
      database: "/api/debug/database",
      admin: "/api/debug/admin",
    },
  });
});

// Test database connection
app.get("/api/test/db", async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({
        success: true,
        message: "PostgreSQL database is connected and ready",
        database: process.env.DB_NAME,
        host: `${process.env.DB_HOST}:${process.env.DB_PORT}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database test error",
      error: error.message,
    });
  }
});

// Test MinIO connection
app.get("/api/test/minio", async (req, res) => {
  try {
    const { minioClient } = require("./config/minio");
    const buckets = await minioClient.listBuckets();

    res.json({
      success: true,
      message: "MinIO storage is connected and ready",
      buckets: buckets.map((b) => ({
        name: b.name,
        created: b.creationDate,
      })),
      endpoint: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
      console: `http://localhost:9001 (minioadmin/minioadmin)`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "MinIO connection failed",
      error: error.message,
    });
  }
});

// Check Docker containers status
app.get("/api/docker/status", (req, res) => {
  res.json({
    services: {
      postgresql: {
        status: "should be running",
        port: 5440,
        connection: `postgresql://${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      },
      minio: {
        status: "should be running",
        api_port: 9000,
        console_port: 9001,
        console: "http://localhost:9001",
        credentials: "minioadmin / minioadmin",
      },
    },
    check_commands: [
      "docker ps",
      "curl http://localhost:5000/api/health",
      "curl http://localhost:5000/api/test/db",
      "curl http://localhost:5000/api/test/minio",
    ],
  });
});

// Protected route example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "You have accessed a protected route",
    user: req.user,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.originalUrl} not found`,
    phase: "Phase 2 - Infrastructure + Authentication endpoints available",
  });
});

// Start server
const startServer = async () => {
  console.log("=".repeat(60));
  console.log("🚀 ALUMNI HUB - PHASE 1: INFRASTRUCTURE SETUP");
  console.log("=".repeat(60));

  // Test database connection
  console.log("🔌 Testing PostgreSQL connection...");
  const dbConnected = await testConnection();

  // Initialize storage (MinIO for local, Cloudinary for production)
  let storageInitialized = true;

  if (process.env.NODE_ENV === "production") {
    console.log("☁️ Using Cloudinary for production storage...");
    // Cloudinary doesn't need initialization, just verify config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.error("❌ Cloudinary credentials missing");
      storageInitialized = false;
    } else {
      console.log("✅ Cloudinary configured successfully");
    }
  } else {
    console.log("💾 Initializing MinIO storage...");
    storageInitialized = await initializeMinIO();
  }

  if (dbConnected && storageInitialized) {
    app.listen(PORT, () => {
      console.log("=".repeat(60));
      console.log(`✅ ALUMNI HUB BACKEND READY`);
      console.log(
        `📍 Backend API: ${
          process.env.NODE_ENV === "production"
            ? "Production"
            : `http://localhost:${PORT}`
        }`
      );
      console.log(
        `📊 Health check: ${
          process.env.NODE_ENV === "production"
            ? "/api/health"
            : `http://localhost:${PORT}/api/health`
        }`
      );
      console.log(
        `🗄️ Database: ${
          process.env.NODE_ENV === "production"
            ? "PostgreSQL (Render)"
            : `${process.env.DB_HOST}:${process.env.DB_PORT}`
        }`
      );
      console.log(
        `💾 Storage: ${
          process.env.NODE_ENV === "production" ? "Cloudinary" : "MinIO"
        }`
      );
      console.log("=".repeat(60));
    });
  } else {
    console.error("❌ Infrastructure setup failed");
    if (process.env.NODE_ENV !== "production") {
      console.log("💡 Troubleshooting:");
      console.log("1. Run: docker-compose up -d");
      console.log("2. Check: docker ps");
      console.log("3. Wait 30 seconds for containers to start");
    }
    process.exit(1);
  }
};

startServer();
