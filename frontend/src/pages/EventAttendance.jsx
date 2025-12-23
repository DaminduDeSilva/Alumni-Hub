import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const EventAttendance = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAdmin && !isSuperAdmin) {
      toast.error("Access denied");
      navigate("/events");
      return;
    }
    fetchEventDetails();
    fetchAttendees();
  }, [eventId, isAdmin, isSuperAdmin]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data.event);
    } catch (error) {
      toast.error("Failed to fetch event details");
    }
  };

  const fetchAttendees = async () => {
    try {
      const response = await api.get(`/events/${eventId}/attendees`);
      setAttendees(response.data.attendees);
    } catch (error) {
      toast.error("Failed to fetch attendees");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (userId, status) => {
    try {
      await api.post("/events/mark-attendance", {
        event_id: parseInt(eventId),
        user_id: userId,
        attendance_status: status,
      });
      toast.success(`Marked as ${status.toLowerCase()}`);
      fetchAttendees();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to mark attendance");
    }
  };

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      REGISTERED: "bg-blue-100 text-blue-800",
      ATTENDED: "bg-green-100 text-green-800",
      ABSENT: "bg-red-100 text-red-800",
    };
    return badges[status] || badges.REGISTERED;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-bold text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center p-8 bg-white shadow rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Event not found
          </h2>
          <button
            onClick={() => navigate("/events")}
            className="text-secondary hover:text-secondary-dark font-bold underline"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/events")}
            className="text-secondary hover:text-secondary-dark mb-4 flex items-center font-bold"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            Back to Events
          </button>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <h1 className="text-3xl font-headings font-bold text-primary mb-2">
              {event.title}
            </h1>
            <p className="text-text-muted mb-4 text-lg">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div className="flex items-center text-gray-700">
                <svg
                  className="w-5 h-5 mr-2 text-secondary"
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
                <span className="font-medium">{format(new Date(event.event_date), "MMMM d, yyyy")}</span>
              </div>

              {event.event_time && (
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-2 text-secondary"
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
                  <span className="font-medium">{event.event_time}</span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-2 text-secondary"
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
                  <span className="font-medium">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-primary font-headings">
              Attendees ({attendees.length})
            </h2>

            <div className="flex items-center space-x-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                  Registered:{" "}
                  {
                    attendees.filter((a) => a.attendance_status === "REGISTERED")
                      .length
                  }
                </span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 font-bold">
                  Attended:{" "}
                  {
                    attendees.filter((a) => a.attendance_status === "ATTENDED")
                      .length
                  }
                </span>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 font-bold">
                  Absent:{" "}
                  {
                    attendees.filter((a) => a.attendance_status === "ABSENT")
                      .length
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
            />
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500 font-medium"
                    >
                      No attendees found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {attendee.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {attendee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 capitalize">
                          {attendee.role.toLowerCase().replace("_", " ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusBadge(
                            attendee.attendance_status
                          )}`}
                        >
                          {attendee.attendance_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleMarkAttendance(attendee.user_id, "ATTENDED")
                            }
                            disabled={attendee.attendance_status === "ATTENDED"}
                            className={`px-3 py-1 rounded-md font-bold uppercase text-xs tracking-wider transition-colors ${
                              attendee.attendance_status === "ATTENDED"
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() =>
                              handleMarkAttendance(attendee.user_id, "ABSENT")
                            }
                            disabled={attendee.attendance_status === "ABSENT"}
                            className={`px-3 py-1 rounded-md font-bold uppercase text-xs tracking-wider transition-colors ${
                              attendee.attendance_status === "ABSENT"
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAttendance;
