import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const MySubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubmissions();
    }
  }, [user]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/submissions/my-submissions");
      setSubmissions(response.data.submissions);
    } catch (error) {
      toast.error("Failed to load submissions");
      console.error("Load submissions error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        gradient: "from-yellow-400 to-orange-500",
        bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
        textColor: "text-yellow-800",
        icon: (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        label: "Pending Review",
      },
      APPROVED: {
        gradient: "from-green-400 to-emerald-500",
        bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
        textColor: "text-green-800",
        icon: (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        label: "Approved",
      },
      REJECTED: {
        gradient: "from-red-400 to-pink-500",
        bgColor: "bg-gradient-to-r from-red-50 to-pink-50",
        textColor: "text-red-800",
        icon: (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ),
        label: "Rejected",
      },
    };

    const config = statusConfig[status];

    return (
      <div
        className={`inline-flex items-center px-4 py-2 rounded-full ${config.bgColor} border border-white/50 shadow-lg backdrop-blur-sm`}
      >
        <div
          className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} mr-2 animate-pulse`}
        ></div>
        <span
          className={`text-sm font-semibold ${config.textColor} flex items-center`}
        >
          {config.icon}
          <span className="ml-1">{config.label}</span>
        </span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-semibold text-gray-700">
              Loading submissions...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  My Submissions
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Track the status of your alumni data submissions
                </p>
              </div>
            </div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-500/5 to-blue-500/5 rounded-bl-3xl"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-3">
                No submissions yet
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                You haven't submitted any alumni data yet.
              </p>
              <Link
                to="/submit"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Submit Your Data
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative p-8">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 group-hover:h-2 transition-all duration-300"></div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
                        {submission.full_name} ({submission.calling_name})
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6z"
                          />
                        </svg>
                        {submission.field} • {submission.country}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {getStatusBadge(submission.status)}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          Submitted
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(submission.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Contact Information */}
                    <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-6 border border-blue-100/50">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Contact Information
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          <span className="text-gray-800 font-medium">
                            {submission.whatsapp_mobile}
                          </span>
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            WhatsApp
                          </span>
                        </div>
                        {submission.phone_mobile && (
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            <span className="text-gray-800 font-medium">
                              {submission.phone_mobile}
                            </span>
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              Phone
                            </span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                          <span className="text-gray-800 font-medium">
                            {submission.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-6 border border-purple-100/50">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Location
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {submission.address && (
                          <p className="text-gray-800 flex items-start">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                            {submission.address}
                          </p>
                        )}
                        <p className="text-gray-800 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          {submission.country}
                        </p>
                        {submission.working_place && (
                          <p className="text-gray-800 flex items-start">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                            <span>
                              <strong>Works at:</strong>{" "}
                              {submission.working_place}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Photos */}
                  {(submission.university_photo_url ||
                    submission.current_photo_url) && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Photos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {submission.university_photo_url && (
                          <div className="group/photo">
                            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              University Photo
                            </h5>
                            <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                              <img
                                src={submission.university_photo_url}
                                alt="University"
                                className="w-full h-56 object-cover group-hover/photo:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          </div>
                        )}

                        {submission.current_photo_url && (
                          <div className="group/photo">
                            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Current Photo
                            </h5>
                            <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                              <img
                                src={submission.current_photo_url}
                                alt="Current"
                                className="w-full h-56 object-cover group-hover/photo:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Status Messages */}
                  {submission.status === "PENDING" && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4 text-white animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </div>
                        <h5 className="text-lg font-semibold text-yellow-800">
                          Under Review
                        </h5>
                      </div>
                      <p className="text-yellow-700 leading-relaxed">
                        Your submission is currently being reviewed by the
                        committee. You will be notified once it's approved.
                      </p>
                    </div>
                  )}

                  {submission.status === "APPROVED" && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h5 className="text-lg font-semibold text-green-800">
                          Approved!
                        </h5>
                      </div>
                      <p className="text-green-700 leading-relaxed mb-2">
                        Your submission has been approved! You now have access
                        to the alumni directory.
                      </p>
                      <p className="text-green-600 text-sm">
                        Approved on: {formatDate(submission.reviewed_at)}
                      </p>
                    </div>
                  )}

                  {submission.status === "REJECTED" && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                        <h5 className="text-lg font-semibold text-red-800">
                          Submission Rejected
                        </h5>
                      </div>
                      <div className="space-y-3">
                        <p className="text-red-700 leading-relaxed">
                          Your submission was rejected.
                          {submission.rejection_reason && (
                            <span className="block mt-2 font-medium">
                              <strong>Reason:</strong>{" "}
                              {submission.rejection_reason}
                            </span>
                          )}
                        </p>
                        <p className="text-red-600 text-sm">
                          You can submit a new application with corrected
                          information.
                        </p>
                        <Link
                          to="/submit"
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 group"
                        >
                          <svg
                            className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Submit New Application
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Action Button */}
        {submissions.length > 0 &&
          submissions.every((s) => s.status !== "PENDING") && (
            <div className="mt-12 text-center">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 inline-block">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Ready for another submission?
                </h3>
                <Link
                  to="/submit"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Submit Another Application
                </Link>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default MySubmissions;
