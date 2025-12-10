# Alumni Hub - Phase 1: Infrastructure Setup

## 🎯 Goal

Set up PostgreSQL database and MinIO storage for the Alumni Hub application.

## 📁 Structure

```
alumni-hub/
└── backend/
    ├── config/
    │   ├── database.js    # PostgreSQL connection
    │   └── minio.js       # MinIO storage client
    ├── .env              # Environment variables
    ├── package.json      # Dependencies
    ├── server.js        # Express server with test endpoints
    └── docker-compose.yml # PostgreSQL + MinIO containers
```

## 🚀 Quick Start

### 1. Start Docker containers:

```bash
cd backend
docker-compose up -d
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Start the server:

```bash
npm run dev
```

### 4. Verify setup:

**Check endpoints:**

```bash
# Health check
curl http://localhost:5000/api/health

# Test database
curl http://localhost:5000/api/test/db

# Test storage
curl http://localhost:5000/api/test/minio

# Docker status
curl http://localhost:5000/api/docker/status
```

**Access services directly:**

- PostgreSQL: `localhost:5440` (user: postgres, password: postgres)
- MinIO Console: `http://localhost:9001` (minioadmin/minioadmin)

## ✅ Success Criteria

Phase 1 is complete when:

1. ✅ Docker containers are running (`docker ps` shows both)
2. ✅ Server starts without errors
3. ✅ `/api/health` returns status OK
4. ✅ `/api/test/db` shows database connected
5. ✅ `/api/test/minio` shows storage connected
6. ✅ Can access MinIO console at `http://localhost:9001`

## 🐛 Troubleshooting

### Database connection fails:

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs alumni-hub-db

# Restart container
docker-compose restart postgres
```

### MinIO connection fails:

```bash
# Wait for MinIO to initialize (takes 30+ seconds)
sleep 30

# Check MinIO logs
docker logs alumni-hub-storage
```

### Port conflicts:

Change ports in `.env` and `docker-compose.yml`

## 📋 Phase 2 Preview

Next phase will add:

- User authentication (email/password + Google OAuth)
- User model and routes
- Frontend login pages
- JWT token system

---

**Phase 1 Complete when all test endpoints return success.**
