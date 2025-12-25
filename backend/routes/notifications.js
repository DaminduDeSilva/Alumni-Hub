const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notifications");

router.get("/", authenticateToken, getNotifications);
router.put("/mark-all-read", authenticateToken, markAllAsRead);
router.put("/:id/read", authenticateToken, markAsRead);
router.delete("/:id", authenticateToken, deleteNotification);
router.delete("/", authenticateToken, deleteAllNotifications);

module.exports = router;
