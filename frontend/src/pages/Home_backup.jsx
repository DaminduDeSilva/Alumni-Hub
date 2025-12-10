import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { isAuthenticated, user, loginWithGoogle, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Welcome back, {user?.full_name?.split(" ")[0] || user?.email}
                </h1>
                <p className="text-lg text-gray-600 mt-3 max-w-2xl">
                  {user?.role === "SUPER_ADMIN" &&
                    "Oversee the entire alumni network ecosystem and manage system administrators"}
                  {user?.role === "FIELD_ADMIN" &&
                    `Lead and manage the ${user?.assigned_field} engineering alumni community`}
                  {user?.role === "VERIFIED_USER" &&
                    "Connect, collaborate, and grow with your engineering alumni network"}
                  {user?.role === "UNVERIFIED" &&
                    "Complete your verification to unlock the full alumni experience"}
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Role</h3>
                  <p className="text-xl font-bold text-gray-900 mt-1 capitalize">
                    {user?.role?.toLowerCase().replace("_", " ")}
                    {user?.assigned_field && ` - ${user?.assigned_field}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      user?.is_verified 
                        ? "bg-gradient-to-br from-green-500 to-green-600" 
                        : "bg-gradient-to-br from-amber-500 to-amber-600"
                    }`}
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {user?.is_verified ? "Verified" : "Pending Verification"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 8a6 6 0 01-7.743 5.743L10 14l-.257-.257A6 6 0 1118 8zM10 2a6 6 0 100 12 6 6 0 000-12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Access Level
                  </h3>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {user?.role === "SUPER_ADMIN" && "Full System"}
                    {user?.role === "FIELD_ADMIN" && "Field Management"}
                    {user?.role === "VERIFIED_USER" && "Alumni Directory"}
                    {user?.role === "UNVERIFIED" && "Limited"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-lg text-gray-600">Access your most important features</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Submit Data for unverified users */}
              {user?.role === "UNVERIFIED" && (
                <Link
                  to="/submit"
                  className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                      </div>
                      <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 mb-2 transition-colors duration-300">
                      Submit Alumni Data
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Complete your profile verification to unlock access to the alumni directory and network features
                    </p>
                  </div>
                </Link>
              )}

              {/* My Submissions for non-super admins */}
              {user?.role !== "SUPER_ADMIN" && (
                <Link
                  to="/my-submissions"
                  className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <div className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 mb-2 transition-colors duration-300">
                      My Submissions
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Track and manage your submission history and application status
                    </p>
                  </div>
                </Link>
              )}

              {/* Admin Dashboard for admins */}
              {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
                <Link
                  to="/admin/dashboard"
                  className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-red-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <div className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 mb-2 transition-colors duration-300">
                      Admin Dashboard
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Manage user submissions, approvals, and system administration
                    </p>
                  </div>
                </Link>
              )}

            {/* Alumni Directory for verified users */}
            {user?.is_verified && (
              <Link
                to="/dashboard"
                className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
                      Alumni Directory
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Browse and connect with alumni
                    </p>
                  </div>
                  <div className="text-green-600">
                    <svg
                      className="w-5 h-5"
              {user?.is_verified && user?.role !== "SUPER_ADMIN" && (
                <Link
                  to="/edit-profile"
                  className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </div>
                      <div className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 mb-2 transition-colors duration-300">
                      Edit Profile
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Update your personal information and preferences
                    </p>
                  </div>
                </Link>
              )}

              {user?.role === "SUPER_ADMIN" && (
                <Link
                  to="/admin/field-admins"
                  className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                      </div>
                      <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 mb-2 transition-colors duration-300">
                      Field Administrators
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Assign and manage field-specific administrators
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* User Info Panel */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">Email</p>
                <p className="font-semibold text-lg text-gray-900 mt-1">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">Member Since</p>
                <p className="font-semibold text-lg text-gray-900 mt-1">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">Last Login</p>
                <p className="font-semibold text-lg text-gray-900 mt-1">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Need assistance? Contact the alumni committee for support
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Alumni Hub
            </h1>
            <p className="text-gray-600">
              Connect with your batchmates and alumni community
            </p>
          </div>

          <div className="space-y-6">
            {/* Committee Login Section */}
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Committee / Admin Login
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                For committee members and administrators
              </p>
              <Link
                to="/committee-login"
                className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Login with Email & Password
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Alumni Login Section */}
            <div className="border-2 border-indigo-100 rounded-lg p-6 bg-indigo-50">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Alumni Login
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                For alumni members - Use your Google account
              </p>
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              <p className="text-xs text-gray-500 mt-4 text-center">
                Alumni must use Google login. No password required.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact the alumni committee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
