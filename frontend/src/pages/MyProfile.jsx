import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function MyProfile() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [batchmate, setBatchmate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const res = await api.get("/user/me");
        console.log("Profile response:", res.data); // Debug log

        if (res.data && res.data.profile) {
          setProfile(res.data.profile);
        }
        if (res.data && res.data.batchmateData) {
          setBatchmate(res.data.batchmateData);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="text-gray-600">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
        {/* Header Section */}
        <div className="flex items-start space-x-8 mb-8">
          {/* Profile Photo */}
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
              {batchmate?.current_photo_url ? (
                <img
                  src={batchmate.current_photo_url}
                  alt="Profile Photo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If current photo fails, try university photo
                    if (batchmate?.university_photo_url) {
                      e.target.src = batchmate.university_photo_url;
                    } else {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : batchmate?.university_photo_url ? (
                <img
                  src={batchmate.university_photo_url}
                  alt="Profile Photo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}

              {!batchmate?.current_photo_url &&
                !batchmate?.university_photo_url && (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="w-12 h-12 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-xs text-center">No Photo</span>
                  </div>
                )}

              <div className="w-full h-full text-gray-400 text-xs hidden items-center justify-center">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-12 h-12 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-center">Photo unavailable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {profile.full_name || user?.email}
            </h1>
            <p className="text-lg text-gray-600 mt-1">{profile.email}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">Role:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    profile.role === "SUPER_ADMIN"
                      ? "bg-red-100 text-red-800"
                      : profile.role === "FIELD_ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : profile.role === "VERIFIED_USER"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {profile.role === "FIELD_ADMIN"
                    ? `${profile.assigned_field} Admin`
                    : profile.role.replace("_", " ")}
                </span>
              </div>

              {profile.assigned_field && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">
                    Assigned Field:
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {profile.assigned_field}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    profile.is_verified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {profile.is_verified
                    ? "Verified"
                    : profile.verification_status || "Pending"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/edit-profile"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </a>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        {batchmate && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Full Name
                </h3>
                <p className="text-gray-800 font-medium">
                  {batchmate.full_name || "-"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <h3 className="text-sm font-semibold text-green-800 mb-2">
                  Calling Name
                </h3>
                <p className="text-gray-800 font-medium">
                  {batchmate.calling_name || "-"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <h3 className="text-sm font-semibold text-purple-800 mb-2">
                  Engineering Field
                </h3>
                <p className="text-gray-800 font-medium">
                  {batchmate.field || "-"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  Registration Number
                </h3>
                <p className="text-gray-800 font-medium">
                  {batchmate.reg_no || "-"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100">
                <h3 className="text-sm font-semibold text-teal-800 mb-2">
                  Country
                </h3>
                <p className="text-gray-800 font-medium">
                  {batchmate.country || "-"}
                </p>
              </div>

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-100">
                <h3 className="text-sm font-semibold text-rose-800 mb-2">
                  Working Place
                </h3>
                <p className="text-gray-800 font-medium">
                  {batchmate.working_place || "-"}
                </p>
              </div>

              {batchmate.position && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                  <h3 className="text-sm font-semibold text-indigo-800 mb-2">
                    Position
                  </h3>
                  <p className="text-gray-800 font-medium">
                    {batchmate.position}
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Email
                </h3>
                <p className="text-gray-800 font-medium">
                  {batchmate.email || profile.email}
                </p>
              </div>

              {batchmate.whatsapp_mobile && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                  <h3 className="text-sm font-semibold text-emerald-800 mb-2">
                    WhatsApp
                  </h3>
                  <p className="text-gray-800 font-medium">
                    {batchmate.whatsapp_mobile}
                  </p>
                </div>
              )}

              {batchmate.phone_number && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">
                    Phone Number
                  </h3>
                  <p className="text-gray-800 font-medium">
                    {batchmate.phone_number}
                  </p>
                </div>
              )}

              {batchmate.address && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-100 md:col-span-2">
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">
                    Address
                  </h3>
                  <p className="text-gray-800 font-medium">
                    {batchmate.address}
                  </p>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            {(batchmate.linkedin_url || batchmate.facebook_url) && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Social Media
                </h3>

                <div className="flex space-x-4">
                  {batchmate.linkedin_url && (
                    <a
                      href={batchmate.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      LinkedIn
                    </a>
                  )}

                  {batchmate.facebook_url && (
                    <a
                      href={batchmate.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                {user?.role === "VERIFIED_USER" && (
                  <a
                    href="/my-submissions"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    My Submissions
                  </a>
                )}

                {(user?.role === "SUPER_ADMIN" ||
                  user?.role === "FIELD_ADMIN") && (
                  <a
                    href="/directory"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Alumni Directory
                  </a>
                )}

                {(user?.role === "SUPER_ADMIN" ||
                  user?.role === "FIELD_ADMIN") && (
                  <a
                    href="/admin"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    {user?.role === "FIELD_ADMIN" ? "Manage" : "Dashboard"}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No batchmate data message */}
        {!batchmate && profile && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No detailed profile data
            </h3>
            <p className="text-gray-600">
              {profile.is_verified
                ? "Your detailed profile information is being processed."
                : "Complete your profile submission to see detailed information here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
