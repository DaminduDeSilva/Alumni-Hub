import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import ConfirmationModal from "../components/ConfirmationModal";

const Events = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(null);
  const [deleteEventId, setDeleteEventId] = useState(null);
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

  const handleDeleteEvent = (eventId) => {
    setDeleteEventId(eventId);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteEventId) return;
    
    try {
      await api.delete(`/events/${deleteEventId}`);
      toast.success("Event deleted successfully");
      fetchEvents();
      setDeleteEventId(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete event");
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
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-4xl font-headings font-bold text-primary mb-2">Events</h1>
            <p className="text-text-muted">Upcoming alumni gatherings and networking opportunities.</p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-md font-semibold transition-colors duration-200 shadow-sm"
            >
              {showCreateForm ? "Cancel" : "Create Event"}
            </button>
          )}
        </div>

        {/* Create Event Form */}
        {showCreateForm && isSuperAdmin && (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-headings font-bold text-primary mb-6">Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="event_time"
                    value={formData.event_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    name="max_attendees"
                    value={formData.max_attendees}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                  ></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="bg-secondary hover:bg-secondary-dark text-white px-8 py-3 rounded-md font-bold uppercase tracking-wider transition-colors duration-200 shadow-md"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="mb-8">
          {events.length === 0 ? (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl text-gray-500 font-headings">No upcoming events scheduled.</p>
              <p className="text-gray-400 mt-2">Check back later for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const userEvent = userEvents.find((ue) => ue.id === event.id);
                const isRegistered =
                  userEvent && userEvent.attendance_status !== null;

                return (
                  <div
                    key={event.id}
                    className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-primary font-headings leading-tight">
                          {event.title}
                        </h3>
                         <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">
                            Upcoming
                         </span>
                      </div>
                      
                      <p className="text-text-muted mb-6 text-sm leading-relaxed line-clamp-3">{event.description}</p>

                      <div className="space-y-3 mb-6 border-t border-gray-100 pt-4">
                        <div className="flex items-center text-text-main text-sm">
                          <svg
                            className="w-5 h-5 mr-3 text-secondary"
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
                          <span className="font-semibold">{formatDate(event.event_date)}</span>
                        </div>

                        {event.event_time && (
                          <div className="flex items-center text-text-main text-sm">
                            <svg
                              className="w-5 h-5 mr-3 text-secondary"
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
                          <div className="flex items-center text-text-main text-sm">
                            <svg
                              className="w-5 h-5 mr-3 text-secondary"
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

                        <div className="flex items-center text-text-main text-sm">
                          <svg
                            className="w-5 h-5 mr-3 text-secondary"
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
                          <span><span className="font-bold">{event.registered_count || 0}</span> attending</span>
                          {event.max_attendees && (
                            <span className="text-gray-400 ml-1"> / {event.max_attendees} max</span>
                          )}
                        </div>
                      </div>

                      {user && !isSuperAdmin && (
                        <div className="mt-auto">
                          {isRegistered ? (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-100">
                              <span className="text-green-700 font-bold text-sm flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                Registered
                              </span>
                              <button
                                onClick={() => handleCancelRegistration(event.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-semibold underline"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="w-full bg-primary hover:bg-primary-light text-white py-2 px-4 rounded-md font-semibold transition-colors duration-200"
                            >
                              Register Now
                            </button>
                          )}
                        </div>
                      )}

                      {(isSuperAdmin || isAdmin) && (
                        <div className="mt-auto space-y-2">
                          {new Date(event.event_date).toDateString() ===
                            new Date().toDateString() && (
                            <button
                              onClick={() =>
                                navigate(`/events/${event.id}/attendance`)
                              }
                              className="w-full bg-secondary hover:bg-secondary-dark text-white py-2 rounded-md font-bold text-sm uppercase tracking-wider mb-2"
                            >
                              Mark Attendance
                            </button>
                          )}
                          {isSuperAdmin && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  setShowEventDetails(
                                    showEventDetails === event.id
                                      ? null
                                      : event.id
                                  )
                                }
                                className="flex-1 text-primary hover:text-primary-light border border-primary hover:bg-blue-50 py-2 rounded-md text-sm font-semibold transition-colors"
                              >
                                {showEventDetails === event.id
                                  ? "Hide Info"
                                  : "Details"}
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 py-2 rounded-md text-sm font-semibold transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {isSuperAdmin && showEventDetails === event.id && (
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                        <h4 className="font-bold text-xs uppercase text-secondary mb-2 tracking-wider">
                          Internal Details
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold text-gray-900">Created by:</span>{" "}
                          {event.created_by_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">Created at:</span>{" "}
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

      <ConfirmationModal
        isOpen={!!deleteEventId}
        onClose={() => setDeleteEventId(null)}
        onConfirm={confirmDeleteEvent}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};

export default Events;
