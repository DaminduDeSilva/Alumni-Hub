const { pool } = require("../config/database");

// Get notifications for logged in user
const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.user.id]
    );

    res.json({
      success: true,
      notifications: result.rows,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1",
      [req.user.id]
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete all notifications for user
const deleteAllNotifications = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM notifications WHERE user_id = $1",
      [req.user.id]
    );

    res.json({
      success: true,
      message: "All notifications deleted",
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete single notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
