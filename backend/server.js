const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();

const { testConnection } = require("./config/database");
const { initializeMinIO } = require("./config/minio");
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
app.use(cors());
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Alumni Hub Infrastructure",
    phase: "1 - Database & Storage Setup",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      database: "/api/test/db",
      storage: "/api/test/minio",
      containers: "/api/docker/status",
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

  // Initialize MinIO
  console.log("💾 Initializing MinIO storage...");
  const minioInitialized = await initializeMinIO();

  if (dbConnected && minioInitialized) {
    app.listen(PORT, () => {
      console.log("=".repeat(60));
      console.log(`✅ INFRASTRUCTURE READY`);
      console.log(`📍 Backend API: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(
        `🗄️  PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}`
      );
      console.log(`💾 MinIO Console: http://localhost:9001`);
      console.log("=".repeat(60));
      console.log("📋 NEXT STEP: Phase 2 - Authentication");
      console.log("=".repeat(60));
    });
  } else {
    console.error("❌ Infrastructure setup failed");
    console.log("💡 Troubleshooting:");
    console.log("1. Run: docker-compose up -d");
    console.log("2. Check: docker ps");
    console.log("3. Wait 30 seconds for containers to start");
    process.exit(1);
  }
};

startServer();
