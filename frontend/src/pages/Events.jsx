import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const Events = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    max_attendees: "",
  });

  // Fetch events
  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data.events);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const response = await api.get("/events/user/events");
      setUserEvents(response.data.events);
    } catch (error) {
      console.error("Failed to fetch user events:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post("/events", formData);
      toast.success("Event created successfully");
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
        max_attendees: "",
      });
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create event");
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post("/events/register", { event_id: eventId });
      toast.success("Registered for event successfully");
      fetchUserEvents();
      fetchEvents();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to register for event"
      );
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      await api.post("/events/cancel-registration", { event_id: eventId });
      toast.success("Registration cancelled successfully");
      fetchUserEvents();
      fetchEvents();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to cancel registration"
      );
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        {isSuperAdmin && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {showCreateForm ? "Cancel" : "Create Event"}
          </button>
        )}
      </div>

      {/* Create Event Form */}
      {showCreateForm && isSuperAdmin && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
          <form onSubmit={handleCreateEvent}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Attendees
                </label>
                <input
                  type="number"
                  name="max_attendees"
                  value={formData.max_attendees}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Upcoming Events
        </h2>
        {events.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No upcoming events at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const userEvent = userEvents.find((ue) => ue.id === event.id);
              const isRegistered =
                userEvent && userEvent.attendance_status !== null;

              return (
                <div
                  key={event.id}
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-700">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        <span>{formatDate(event.event_date)}</span>
                      </div>

                      {event.event_time && (
                        <div className="flex items-center text-gray-700">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>{formatTime(event.event_time)}</span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center text-gray-700">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center text-gray-700">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          ></path>
                        </svg>
                        <span>{event.registered_count || 0} registered</span>
                        {event.max_attendees && (
                          <span> / {event.max_attendees} max</span>
                        )}
                      </div>
                    </div>

                    {user && !isSuperAdmin && (
                      <div className="mt-4">
                        {isRegistered ? (
                          <div className="flex items-center justify-between">
                            <span className="text-green-600 font-medium">
                              Registered
                            </span>
                            <button
                              onClick={() => handleCancelRegistration(event.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancel Registration
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(event.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                          >
                            Register for Event
                          </button>
                        )}
                      </div>
                    )}

                    {(isSuperAdmin || isAdmin) && (
                      <div className="mt-4 flex space-x-2">
                        {new Date(event.event_date).toDateString() ===
                          new Date().toDateString() && (
                          <button
                            onClick={() =>
                              navigate(`/events/${event.id}/attendance`)
                            }
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md"
                          >
                            Mark Attendance
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() =>
                              setShowEventDetails(
                                showEventDetails === event.id ? null : event.id
                              )
                            }
                            className="flex-1 text-blue-600 hover:text-blue-800 border border-blue-600 py-2 rounded-md"
                          >
                            {showEventDetails === event.id
                              ? "Hide Details"
                              : "View Details"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isSuperAdmin && showEventDetails === event.id && (
                    <div className="bg-gray-50 px-6 py-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Event Details
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Created by:</span>{" "}
                        {event.created_by_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Created at:</span>{" "}
                        {format(
                          new Date(event.created_at),
                          "MMMM d, yyyy h:mm a"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
