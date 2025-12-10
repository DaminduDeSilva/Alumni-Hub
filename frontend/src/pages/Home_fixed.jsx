import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { isAuthenticated, user, loginWithGoogle, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name?.split(" ")[0] || user?.email}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === "SUPER_ADMIN" &&
                "Manage the alumni network and field administrators"}
              {user?.role === "FIELD_ADMIN" &&
                `Manage ${user?.assigned_field} engineering alumni`}
              {user?.role === "VERIFIED_USER" &&
                "Connect with your engineering alumni network"}
              {user?.role === "UNVERIFIED" &&
                "Complete your profile to join the alumni directory"}
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {user?.role?.toLowerCase().replace("_", " ")}
                    {user?.assigned_field && ` - ${user?.assigned_field}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      user?.is_verified ? "bg-green-100" : "bg-yellow-100"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        user?.is_verified ? "text-green-600" : "text-yellow-600"
                      }`}
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
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.is_verified ? "Verified" : "Pending Verification"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-600"
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
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Access Level
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Submit Data for unverified users */}
            {user?.role === "UNVERIFIED" && (
              <Link
                to="/submit"
                className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                      Submit Alumni Data
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Complete your profile to join the directory
                    </p>
                  </div>
                  <div className="text-blue-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            )}

            {/* My Submissions for non-super admins */}
            {user?.role !== "SUPER_ADMIN" && (
              <Link
                to="/my-submissions"
                className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700">
                      My Submissions
                    </h3>
                    <p className="text-gray-600 mt-1">
                      View your submission history
                    </p>
                  </div>
                  <div className="text-gray-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            )}

            {/* Admin Dashboard for admins */}
            {(user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") && (
              <Link
                to="/admin/dashboard"
                className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-red-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-red-600">
                      Admin Dashboard
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Manage submissions and users
                    </p>
                  </div>
                  <div className="text-red-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
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
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            )}

            {user?.is_verified && (
              <Link
                to="/edit-profile"
                className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-600">
                      Edit Profile
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Update your information
                    </p>
                  </div>
                  <div className="text-orange-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            )}

            {user?.role === "SUPER_ADMIN" && (
              <Link
                to="/admin/field-admins"
                className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600">
                      Field Administrators
                    </h3>
                    <p className="text-gray-600 mt-1">Manage field admins</p>
                  </div>
                  <div className="text-purple-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* User Info Panel */}
          <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
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
