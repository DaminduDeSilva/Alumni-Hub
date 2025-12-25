const { pool } = require("../config/database");
const { uploadFile } = require("../utils/fileUpload");

// Create a new event (SUPER_ADMIN only)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      event_date,
      event_time,
      location,
      max_attendees,
    } = req.body;

    // Validate required fields
    if (!title || !event_date) {
      return res
        .status(400)
        .json({ error: "Title and event date are required" });
    }

    // Handle image upload if provided
    let image_url = null;
    if (req.file) {
      const uploadResult = await uploadFile(req.file, "events");
      if (uploadResult.success) {
        image_url = uploadResult.url;
      }
    }

    const query = `
      INSERT INTO events (title, description, event_date, event_time, location, max_attendees, created_by, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      title,
      description,
      event_date,
      event_time,
      location,
      max_attendees,
      req.user.id,
      image_url,
    ];

    const result = await pool.query(query, values);
    const event = result.rows[0];

    // Create notifications for all verified users
    try {
      const verifiedUsers = await pool.query(
        "SELECT id FROM users WHERE is_verified = true AND id != $1",
        [req.user.id]
      );

      if (verifiedUsers.rows.length > 0) {
        const notificationPromises = verifiedUsers.rows.map((user) => {
          return pool.query(
            `INSERT INTO notifications (user_id, type, title, message, link)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              user.id,
              "event_created",
              "New Event Scheduled",
              `A new event "${title}" has been scheduled for ${event_date}.`,
              "/events",
            ]
          );
        });
        await Promise.all(notificationPromises);
      }
    } catch (notifError) {
      console.error("Error creating notifications for event:", notifError);
    }

    res.status(201).json({
      success: true,
      event: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all upcoming events (for VERIFIED_USERS and FIELD_ADMINS)
const getEvents = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.*,
        u.full_name as created_by_name,
        COUNT(ea.id) as registered_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.attendance_status = 'REGISTERED'
      WHERE e.event_date >= CURRENT_DATE
      GROUP BY e.id, u.full_name
      ORDER BY e.event_date ASC, e.event_time ASC
    `;

    const result = await pool.query(query);
    res.json({
      success: true,
      events: result.rows,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all past events (History)
const getPastEvents = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.*,
        u.full_name as created_by_name,
        COUNT(ea.id) as registered_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.attendance_status = 'REGISTERED'
      WHERE e.event_date < CURRENT_DATE
      GROUP BY e.id, u.full_name
      ORDER BY e.event_date DESC, e.event_time DESC
    `;

    const result = await pool.query(query);
    res.json({
      success: true,
      events: result.rows,
    });
  } catch (error) {
    console.error("Error fetching past events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        e.*,
        u.full_name as created_by_name,
        COUNT(ea.id) as registered_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.attendance_status = 'REGISTERED'
      WHERE e.id = $1
      GROUP BY e.id, u.full_name
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an event (SUPER_ADMIN only)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      event_date,
      event_time,
      location,
      max_attendees,
    } = req.body;

    // Check if event exists
    const existingEvent = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Handle new image upload if provided
    let image_url = existingEvent.rows[0].image_url;
    if (req.file) {
      const uploadResult = await uploadFile(req.file, "events");
      if (uploadResult.success) {
        image_url = uploadResult.url;
      }
    }

    const query = `
      UPDATE events 
      SET title = $1, description = $2, event_date = $3, event_time = $4, 
          location = $5, max_attendees = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      title,
      description,
      event_date,
      event_time,
      location,
      max_attendees,
      image_url,
      id,
    ];

    const result = await pool.query(query, values);
    res.json({
      success: true,
      event: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an event (SUPER_ADMIN only)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    await pool.query("DELETE FROM events WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Register for an event (VERIFIED_USERS and FIELD_ADMINS)
const registerForEvent = async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;

    // Check if event exists
    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      event_id,
    ]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = eventResult.rows[0];

    // Check if user is already registered
    const existingRegistration = await pool.query(
      "SELECT * FROM event_attendance WHERE event_id = $1 AND user_id = $2",
      [event_id, user_id]
    );

    if (existingRegistration.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "You are already registered for this event" });
    }

    // Check if event has reached maximum capacity
    if (event.max_attendees) {
      const attendeeCount = await pool.query(
        "SELECT COUNT(*) as count FROM event_attendance WHERE event_id = $1 AND attendance_status = 'REGISTERED'",
        [event_id]
      );

      if (parseInt(attendeeCount.rows[0].count) >= event.max_attendees) {
        return res
          .status(400)
          .json({ error: "This event has reached maximum capacity" });
      }
    }

    const query = `
      INSERT INTO event_attendance (event_id, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const values = [event_id, user_id];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      registration: result.rows[0],
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get event attendees (SUPER_ADMIN and FIELD_ADMINS)
const getEventAttendees = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Check if event exists
    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      event_id,
    ]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const query = `
      SELECT 
        ea.*,
        u.full_name,
        u.email,
        u.role
      FROM event_attendance ea
      JOIN users u ON ea.user_id = u.id
      WHERE ea.event_id = $1
      ORDER BY ea.registered_at DESC
    `;

    const result = await pool.query(query, [event_id]);

    res.json({
      success: true,
      attendees: result.rows,
    });
  } catch (error) {
    console.error("Error fetching event attendees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark attendance for an event (SUPER_ADMIN and FIELD_ADMINS on event day)
const markAttendance = async (req, res) => {
  try {
    const { event_id, user_id, attendance_status } = req.body;

    // Validate attendance status
    if (!["ATTENDED", "ABSENT"].includes(attendance_status)) {
      return res
        .status(400)
        .json({
          error: "Invalid attendance status. Must be 'ATTENDED' or 'ABSENT'",
        });
    }

    // Check if event exists
    const eventResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      event_id,
    ]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is registered for the event
    const registrationResult = await pool.query(
      "SELECT * FROM event_attendance WHERE event_id = $1 AND user_id = $2",
      [event_id, user_id]
    );

    if (registrationResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "User is not registered for this event" });
    }

    const query = `
      UPDATE event_attendance 
      SET attendance_status = $1, marked_by = $2, marked_at = CURRENT_TIMESTAMP
      WHERE event_id = $3 AND user_id = $4
      RETURNING *
    `;

    const values = [attendance_status, req.user.id, event_id, user_id];
    const result = await pool.query(query, values);

    res.json({
      success: true,
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get events for a specific user
const getUserEvents = async (req, res) => {
  try {
    const user_id = req.user.id;

    const query = `
      SELECT 
        e.*,
        u.full_name as created_by_name,
        ea.attendance_status,
        ea.registered_at
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.user_id = $1
      WHERE e.event_date >= CURRENT_DATE
      ORDER BY e.event_date ASC, e.event_time ASC
    `;

    const result = await pool.query(query, [user_id]);
    res.json({
      success: true,
      events: result.rows,
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cancel event registration
const cancelRegistration = async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;

    // Check if user is registered for the event
    const registrationResult = await pool.query(
      "SELECT * FROM event_attendance WHERE event_id = $1 AND user_id = $2",
      [event_id, user_id]
    );

    if (registrationResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "You are not registered for this event" });
    }

    await pool.query(
      "DELETE FROM event_attendance WHERE event_id = $1 AND user_id = $2",
      [event_id, user_id]
    );

    res.json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
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
  getPastEvents,
};
