import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-bold text-gray-700">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700"
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
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-headings font-bold text-primary mb-2">Profile not found</h2>
          <p className="text-text-muted">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-8">
              {/* Profile Photo */}
              <div className="flex-shrink-0 mb-6 md:mb-0">
                <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
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
                        <span className="text-xs font-medium uppercase">No Photo</span>
                      </div>
                    )}
                  
                  {/* Fallback for error */}
                  <div className="w-full h-full text-gray-400 text-xs hidden items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-10 h-10 mb-1"
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
                      <span className="text-center font-medium">Unavailable</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-headings font-bold text-primary mb-2">
                  {profile.full_name || user?.email}
                </h1>
                <p className="text-lg text-text-muted mb-4 font-body">{profile.email}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                  <span className="text-sm font-bold text-secondary uppercase tracking-wider self-center mr-2">
                    Role:
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                      profile.role === "SUPER_ADMIN"
                        ? "bg-red-50 text-red-800 border-red-200"
                        : profile.role === "FIELD_ADMIN"
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : profile.role === "VERIFIED_USER"
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-gray-50 text-gray-800 border-gray-200"
                    }`}
                  >
                    {profile.role === "FIELD_ADMIN"
                      ? `${profile.assigned_field} Admin`
                      : profile.role.replace("_", " ")}
                  </span>
                  
                  {profile.assigned_field && (
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-800 border border-blue-200">
                        {profile.assigned_field}
                     </span>
                  )}
                  
                   <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                      profile.is_verified
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-yellow-50 text-yellow-800 border-yellow-200"
                    }`}
                  >
                    {profile.is_verified
                      ? "Verified"
                      : profile.verification_status || "Pending"}
                  </span>
                </div>

                <div>
                  <Link
                    to="/edit-profile"
                    className="inline-flex items-center px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-light transition-colors duration-200 uppercase tracking-wider shadow-sm"
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
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            {batchmate && (
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-xl font-headings font-bold text-primary mb-6 flex items-center">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Info Cards */}
                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Full Name
                    </h3>
                    <p className="text-gray-900 font-medium font-body">
                      {batchmate.full_name || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Calling Name
                    </h3>
                    <p className="text-gray-900 font-medium font-body">
                      {batchmate.calling_name || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Engineering Field
                    </h3>
                    <p className="text-gray-900 font-medium font-body">
                      {batchmate.field || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Registration Number
                    </h3>
                    <p className="text-gray-900 font-medium font-body">
                      {batchmate.reg_no || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Country
                    </h3>
                    <p className="text-gray-900 font-medium font-body">
                      {batchmate.country || "-"}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Working Place
                    </h3>
                    <p className="text-gray-900 font-medium font-body">
                      {batchmate.working_place || "-"}
                    </p>
                  </div>

                  {batchmate.position && (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Position
                      </h3>
                      <p className="text-gray-900 font-medium font-body">
                        {batchmate.position}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                      Email
                    </h3>
                    <p className="text-gray-900 font-medium font-body break-all">
                      {batchmate.email || profile.email}
                    </p>
                  </div>

                  {batchmate.whatsapp_mobile && (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                        WhatsApp
                      </h3>
                      <p className="text-gray-900 font-medium font-body">
                        {batchmate.whatsapp_mobile}
                      </p>
                    </div>
                  )}

                  {batchmate.phone_number && (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Phone Number
                      </h3>
                      <p className="text-gray-900 font-medium font-body">
                        {batchmate.phone_number}
                      </p>
                    </div>
                  )}

                  {batchmate.address && (
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-secondary transition-colors duration-200 md:col-span-2 lg:col-span-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Address
                      </h3>
                      <p className="text-gray-900 font-medium font-body">
                        {batchmate.address}
                      </p>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {(batchmate.linkedin_url || batchmate.facebook_url) && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-headings font-bold text-primary mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                      </svg>
                      Social Media
                    </h3>

                    <div className="flex space-x-4">
                      {batchmate.linkedin_url && (
                        <a
                          href={batchmate.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-[#0077b5] text-white rounded-md hover:opacity-90 transition-opacity font-bold text-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                          </svg>
                          LinkedIn
                        </a>
                      )}

                      {batchmate.facebook_url && (
                        <a
                          href={batchmate.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-[#1877f2] text-white rounded-md hover:opacity-90 transition-opacity font-bold text-sm"
                        >
                           <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                           </svg>
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                {user?.role === "VERIFIED_USER" && (
                  <Link
                    to="/my-submissions"
                    className="inline-flex items-center px-5 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors duration-200 font-bold text-sm uppercase tracking-wide"
                  >
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                     </svg>
                    My Submissions
                  </Link>
                )}

                {(user?.role === "SUPER_ADMIN" ||
                  user?.role === "FIELD_ADMIN") && (
                  <>
                  <Link
                    to="/directory"
                    className="inline-flex items-center px-5 py-2 bg-primary text-white rounded-md hover:bg-primary-light transition-colors duration-200 font-bold text-sm uppercase tracking-wide"
                  >
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                     </svg>
                    Alumni Directory
                  </Link>
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-bold text-sm uppercase tracking-wide"
                  >
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                     </svg>
                    {user?.role === "FIELD_ADMIN" ? "Manage" : "Dashboard"}
                  </Link>
                  </>
                )}
              </div>
            </div>

            {/* No batchmate data message */}
            {!batchmate && profile && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 mt-8">
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
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  No detailed profile data
                </h3>
                <p className="text-text-muted">
                  {profile.is_verified
                    ? "Your detailed profile information is being processed."
                    : "Complete your profile submission to see detailed information here."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
