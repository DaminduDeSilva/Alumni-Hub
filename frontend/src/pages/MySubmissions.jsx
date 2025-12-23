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
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
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
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
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
        bgColor: "bg-red-50",
        textColor: "text-red-800",
        borderColor: "border-red-200",
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
        className={`inline-flex items-center px-3 py-1 rounded-full ${config.bgColor} border ${config.borderColor}`}
      >
        <span
          className={`text-sm font-bold uppercase tracking-wide ${config.textColor} flex items-center`}
        >
          {config.icon}
          <span className="ml-2">{config.label}</span>
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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-bold text-gray-700">
            Loading submissions...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center shadow-md mr-4">
               <svg
                  className="w-6 h-6"
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
              <h1 className="text-3xl font-headings font-bold text-primary">
                My Submissions
              </h1>
              <p className="text-text-muted text-lg mt-1">
                Track the status of your alumni data submissions
              </p>
            </div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <h3 className="text-2xl font-bold text-primary font-headings mb-3">
              No submissions yet
            </h3>
            <p className="text-text-muted text-lg mb-8">
              You haven't submitted any alumni data yet.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center px-8 py-3 bg-secondary text-white font-bold rounded-md hover:bg-secondary-dark transition-colors duration-200 uppercase tracking-wider"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Submit Your Data
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-gray-100 pb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary font-headings mb-2">
                        {submission.full_name} ({submission.calling_name})
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm font-medium">
                        <svg
                          className="w-4 h-4 mr-2 text-secondary"
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
                        <p className="text-sm font-bold text-gray-700 uppercase">
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
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4 border-b border-gray-200 pb-2">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-md flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4"
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
                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider">
                          Contact Information
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-gray-800 font-medium">
                            {submission.whatsapp_mobile}
                          </span>
                          <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 border border-green-200 rounded font-bold uppercase">
                            WhatsApp
                          </span>
                        </div>
                        {submission.phone_mobile && (
                          <div className="flex items-center">
                            <span className="text-gray-800 font-medium">
                              {submission.phone_mobile}
                            </span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded font-bold uppercase">
                              Phone
                            </span>
                          </div>
                        )}
                        <div className="flex items-center text-gray-800">
                           {submission.email}
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4 border-b border-gray-200 pb-2">
                        <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-md flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4"
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
                        <h4 className="text-sm font-bold text-primary uppercase tracking-wider">
                          Location
                        </h4>
                      </div>
                      <div className="space-y-3 font-medium text-gray-800">
                        {submission.address && (
                          <p className="flex items-start">
                            {submission.address}
                          </p>
                        )}
                        <p className="flex items-center font-bold">
                          {submission.country}
                        </p>
                        {submission.working_place && (
                          <p className="flex items-start">
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
                      <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                        Photos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {submission.university_photo_url && (
                          <div className="group/photo">
                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">
                              University Photo
                            </h5>
                            <div className="relative overflow-hidden rounded-md shadow border border-gray-200">
                              <img
                                src={submission.university_photo_url}
                                alt="University"
                                className="w-full h-56 object-cover"
                              />
                            </div>
                          </div>
                        )}

                        {submission.current_photo_url && (
                          <div className="group/photo">
                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">
                              Current Photo
                            </h5>
                            <div className="relative overflow-hidden rounded-md shadow border border-gray-200">
                              <img
                                src={submission.current_photo_url}
                                alt="Current"
                                className="w-full h-56 object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Status Messages */}
                  {submission.status === "PENDING" && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-md">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h5 className="text-lg font-bold text-yellow-800">
                          Under Review
                        </h5>
                      </div>
                      <p className="text-yellow-700 leading-relaxed font-medium">
                        Your submission is currently being reviewed by the
                        committee. You will be notified once it's approved.
                      </p>
                    </div>
                  )}

                  {submission.status === "APPROVED" && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-md">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h5 className="text-lg font-bold text-green-800">
                          Approved!
                        </h5>
                      </div>
                      <p className="text-green-700 leading-relaxed mb-2 font-medium">
                        Your submission has been approved! You now have access
                        to the alumni directory.
                      </p>
                      <p className="text-green-600 text-sm font-bold">
                        Approved on: {formatDate(submission.reviewed_at)}
                      </p>
                    </div>
                  )}

                  {submission.status === "REJECTED" && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-md">
                      <div className="flex items-center mb-3">
                         <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                         </div>
                        <h5 className="text-lg font-bold text-red-800">
                          Submission Rejected
                        </h5>
                      </div>
                      <div className="space-y-3">
                        <p className="text-red-700 leading-relaxed font-medium">
                          Your submission was rejected.
                          {submission.rejection_reason && (
                            <span className="block mt-2">
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
                          className="inline-flex items-center px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 uppercase tracking-wider text-sm"
                        >
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

        {/* Action Button */}
        {submissions.length > 0 &&
          submissions.every((s) => s.status !== "PENDING") && (
            <div className="mt-12 text-center">
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 inline-block">
                <h3 className="text-lg font-bold text-primary mb-4">
                  Ready for another submission?
                </h3>
                <Link
                  to="/submit"
                  className="inline-flex items-center px-8 py-3 bg-secondary text-white font-bold rounded-md hover:bg-secondary-dark transition-colors duration-200 uppercase tracking-wider"
                >
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
