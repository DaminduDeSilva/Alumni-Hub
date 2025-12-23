const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  isSuperAdmin,
  requireVerified,
} = require("../middleware/auth");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventAttendees,
  markAttendance,
  getUserEvents,
  cancelRegistration,
} = require("../controllers/events");

// Public routes (accessible to VERIFIED_USERS and FIELD_ADMINS)
router.get("/", authenticateToken, requireVerified, getEvents);
router.get("/:id", authenticateToken, requireVerified, getEventById);
router.get("/user/events", authenticateToken, requireVerified, getUserEvents);
router.get(
  "/:event_id/attendees",
  authenticateToken,
  requireVerified,
  getEventAttendees
);

// Registration routes
router.post("/register", authenticateToken, requireVerified, registerForEvent);
router.post(
  "/cancel-registration",
  authenticateToken,
  requireVerified,
  cancelRegistration
);

// SUPER_ADMIN only routes
router.post("/", authenticateToken, isSuperAdmin, createEvent);
router.put("/:id", authenticateToken, isSuperAdmin, updateEvent);
router.delete("/:id", authenticateToken, isSuperAdmin, deleteEvent);

// Attendance marking (SUPER_ADMIN and FIELD_ADMINS)
router.post(
  "/mark-attendance",
  authenticateToken,
  requireVerified,
  markAttendance
);

module.exports = router;
