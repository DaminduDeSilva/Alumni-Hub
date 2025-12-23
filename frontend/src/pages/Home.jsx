import React, { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Home = () => {
  const {
    isAuthenticated,
    user,
    loginWithGoogle,
    refreshUser,
    refreshing,
  } = useAuth();
  const previousVerificationStatus = useRef(user?.is_verified);

  // Watch for verification status changes
  useEffect(() => {
    if (
      previousVerificationStatus.current !== undefined &&
      previousVerificationStatus.current !== user?.is_verified
    ) {
      if (!previousVerificationStatus.current && user?.is_verified) {
        toast.success("Account Verified Successfully");
      }
    }
    previousVerificationStatus.current = user?.is_verified;
  }, [user?.is_verified]);

  const handleStatusRefresh = async () => {
    try {
      await refreshUser();
    } catch (error) {
      toast.error("Failed to refresh status");
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <div className="mb-12 border-b border-gray-200 pb-8">
            <h1 className="text-4xl font-headings font-bold text-primary mb-2">
              Welcome, {user?.full_name?.split(" ")[0] || user?.email}
            </h1>
            <p className="text-lg text-text-muted font-body">
              {user?.role === "SUPER_ADMIN" &&
                "System Administrator Dashboard"}
              {user?.role === "FIELD_ADMIN" &&
                `${user?.assigned_field} Engineering Administrator`}
              {user?.role === "VERIFIED_USER" &&
                "Alumni Portal Access"}
              {user?.role === "UNVERIFIED" &&
                "Pending Membership Verification"}
            </p>
          </div>

          {/* Status & Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Role Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">
                Your Role
              </h3>
              <p className="text-xl font-bold text-primary capitalize">
                {user?.role?.toLowerCase().replace("_", " ")}
                {user?.assigned_field && ` - ${user?.assigned_field}`}
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">
                  Account Status
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${user?.is_verified ? "bg-green-600" : "bg-yellow-500"}`}></span>
                  <p className="text-xl font-bold text-primary">
                    {user?.is_verified ? "Verified Member" : "Pending Approval"}
                  </p>
                </div>
              </div>
              {!user?.is_verified && (
                <button
                  onClick={handleStatusRefresh}
                  disabled={refreshing}
                  className="p-2 text-primary hover:text-secondary transition-colors"
                  title="Refresh Status"
                >
                  <svg
                    className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
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
                </button>
              )}
            </div>

            {/* Access Level Card */}
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-2">
                  Access Level
                </h3>
                <p className="text-xl font-bold text-primary">
                  {user?.role === "SUPER_ADMIN" && "Full System Access"}
                  {user?.role === "FIELD_ADMIN" && "Department Management"}
                  {user?.role === "VERIFIED_USER" && "Directory & Events"}
                  {user?.role === "UNVERIFIED" && "Restricted"}
                </p>
            </div>
          </div>

          {/* Action Cards */}
          <h2 className="text-2xl font-headings font-bold text-primary mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Submit Data */}
            {user?.role === "UNVERIFIED" && (
              <Link
                to="/submit"
                className="group bg-white p-6 rounded-md shadow-sm border border-gray-200 hover:border-secondary transition-colors duration-300"
              >
                <div className="flex items-center mb-4 text-primary group-hover:text-secondary transition-colors">
                  <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-bold">Submit Details</h3>
                </div>
                <p className="text-text-muted">Provide your alumni information for verification.</p>
              </Link>
            )}

            {/* My Submissions */}
            {user?.role !== "SUPER_ADMIN" && (
              <Link
                to="/my-submissions"
                className="group bg-white p-6 rounded-md shadow-sm border border-gray-200 hover:border-secondary transition-colors duration-300"
              >
                 <div className="flex items-center mb-4 text-primary group-hover:text-secondary transition-colors">
                  <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-bold">My History</h3>
                </div>
                <p className="text-text-muted">View past submissions and application status.</p>
              </Link>
            )}

            {/* Admin Dashboard */}
            {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
              <Link
                to="/admin"
                className="group bg-white p-6 rounded-md shadow-sm border border-gray-200 hover:border-secondary transition-colors duration-300"
              >
                <div className="flex items-center mb-4 text-primary group-hover:text-secondary transition-colors">
                  <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-lg font-bold">Administration</h3>
                </div>
                <p className="text-text-muted">Manage members, approvals and system settings.</p>
              </Link>
            )}

            {/* Directory */}
            {user?.is_verified && (
               <Link
                to="/directory"
                className="group bg-white p-6 rounded-md shadow-sm border border-gray-200 hover:border-secondary transition-colors duration-300"
              >
                <div className="flex items-center mb-4 text-primary group-hover:text-secondary transition-colors">
                  <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="text-lg font-bold">Alumni Directory</h3>
                </div>
                <p className="text-text-muted">Search and connect with fellow alumni.</p>
              </Link>
            )}

            {/* Edit Profile */}
            {user?.is_verified && user?.role !== "SUPER_ADMIN" && (
              <Link
                to="/edit-profile"
                className="group bg-white p-6 rounded-md shadow-sm border border-gray-200 hover:border-secondary transition-colors duration-300"
              >
                <div className="flex items-center mb-4 text-primary group-hover:text-secondary transition-colors">
                  <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 className="text-lg font-bold">Edit Profile</h3>
                </div>
                <p className="text-text-muted">Keep your contact information up to date.</p>
              </Link>
            )}
          </div>

          {/* User Info Section */}
          <div className="mt-12 bg-gray-50 p-8 rounded-md border border-gray-200">
             <h2 className="text-xl font-headings font-bold text-primary mb-6">Account Details</h2>
             <dl className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <dt className="text-sm font-bold text-secondary uppercase">Email</dt>
                  <dd className="mt-1 text-lg text-primary">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-secondary uppercase">Member Since</dt>
                  <dd className="mt-1 text-lg text-primary">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-bold text-secondary uppercase">Last Login</dt>
                  <dd className="mt-1 text-lg text-primary">{new Date().toLocaleDateString()}</dd>
                </div>
             </dl>
          </div>
        </div>
      </div>
    );
  }

  // Public Landing Page
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
           <div className="w-20 h-20 bg-primary text-white rounded-md mx-auto flex items-center justify-center shadow-md mb-6">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
             </svg>
           </div>
           <h1 className="text-4xl font-headings font-bold text-primary mb-2">Alumni Hub</h1>
           <p className="text-lg text-text-muted font-body">Connect with your university network</p>
        </div>

        {/* Login Box */}
        <div className="bg-white p-8 rounded-md shadow-md border border-gray-200">
           <h2 className="text-2xl font-bold text-primary mb-2">Welcome Back</h2>
           <p className="text-text-muted mb-8">Please sign in to continue</p>
           
           <button
             onClick={loginWithGoogle}
             className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-700 font-bold rounded-md border-2 border-gray-200 hover:border-secondary hover:text-primary transition-all duration-200 group"
           >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
             </svg>
             <span>Sign in with Google</span>
           </button>
        </div>

        {/* Footer Link */}
        <div className="mt-8">
          <p className="text-text-muted text-sm">
            Committee Admin? <Link to="/committee-login" className="text-secondary hover:text-secondary-dark font-bold underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
