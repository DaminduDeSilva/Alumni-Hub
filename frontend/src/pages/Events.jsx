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
  const [eventImage, setEventImage] = useState(null);
  const [attendeeModal, setAttendeeModal] = useState({
    isOpen: false,
    attendees: [],
    loading: false,
    eventName: "",
  });

  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" or "history"

  // Fetch events
  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserEvents();
    }
  }, [user, activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === "upcoming" ? "/events" : "/events/past";
      const response = await api.get(endpoint);
      setEvents(response.data.events);
    } catch (error) {
      toast.error(`Failed to fetch ${activeTab} events`);
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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEventImage(e.target.files[0]);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (eventImage) {
        data.append("image", eventImage);
      }

      await api.post("/events", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
      setEventImage(null);
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

  const fetchAttendees = async (eventId, eventName) => {
    setAttendeeModal({ ...attendeeModal, isOpen: true, loading: true, eventName });
    try {
      const response = await api.get(`/events/${eventId}/attendees`);
      setAttendeeModal({ 
        isOpen: true, 
        attendees: response.data.attendees, 
        loading: false, 
        eventName 
      });
    } catch (error) {
      toast.error("Failed to fetch attendees");
      setAttendeeModal({ ...attendeeModal, isOpen: false, loading: false });
    }
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-4xl font-headings font-bold text-primary mb-2">Events</h1>
            <p className="text-text-muted">
              {activeTab === "upcoming" 
                ? "Upcoming alumni gatherings and networking opportunities." 
                : "A history of our past gatherings and shared memories."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === "upcoming" 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-500 hover:text-primary"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === "history" 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-500 hover:text-primary"
                }`}
              >
                History
              </button>
            </div>
            {isSuperAdmin && activeTab === "upcoming" && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-sm whitespace-nowrap"
              >
                {showCreateForm ? "Cancel" : "Create Event"}
              </button>
            )}
          </div>
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
                <div>
                  <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-1">
                    Event Image
                  </label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
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
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center mt-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl text-gray-500 font-headings">
                {activeTab === "upcoming" ? "No upcoming events scheduled." : "No past events recorded."}
              </p>
              <p className="text-gray-400 mt-2">Check back later for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {events.map((event) => {
                const userEvent = userEvents.find((ue) => ue.id === event.id);
                const isRegistered =
                  userEvent && userEvent.attendance_status !== null;

                return (
                  <div
                    key={event.id}
                    className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden flex flex-col"
                  >
                    {event.image_url && (
                      <div className="h-48 w-full overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-primary font-headings leading-tight">
                          {event.title}
                        </h3>
                         <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide
                           ${activeTab === "upcoming" 
                             ? "bg-blue-50 text-blue-700" 
                             : "bg-gray-100 text-gray-600"
                           }`}>
                            {activeTab === "upcoming" ? "Upcoming" : "Completed"}
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

                      {user && !isSuperAdmin && activeTab === "upcoming" && (
                        <div className="mt-auto">
                          {isRegistered ? (
                            <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-100 mb-4">
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
                              className="w-full bg-primary hover:bg-primary-light text-white py-2 px-4 rounded-md font-semibold transition-colors duration-200 mb-4"
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
                            <>
                              <button
                                onClick={() => fetchAttendees(event.id, event.title)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-bold text-sm uppercase tracking-wider transition-colors"
                              >
                                {activeTab === "upcoming" ? "View Attendees" : "View Final Roll"}
                              </button>
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
                          </>
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

      {/* Attendee List Modal */}
      {attendeeModal.isOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 backdrop-blur-sm"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-2xl leading-6 font-bold text-primary font-headings border-b border-gray-100 pb-4 mb-4">
                      Attendees: {attendeeModal.eventName}
                    </h3>
                    <div className="mt-4 max-h-96 overflow-y-auto">
                      {attendeeModal.loading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : attendeeModal.attendees.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No one has registered for this event yet.</p>
                      ) : (
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {attendeeModal.attendees.map((attendee) => (
                                <tr key={attendee.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attendee.full_name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.email}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-800 uppercase">
                                      {attendee.role.replace('_', ' ')}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-bold text-white hover:bg-primary-light focus:outline-none sm:ml-3 sm:w-auto sm:text-sm uppercase tracking-wider"
                  onClick={() => setAttendeeModal({ ...attendeeModal, isOpen: false })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
