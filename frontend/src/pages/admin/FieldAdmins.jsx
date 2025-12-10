import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const FieldAdmins = () => {
  const navigate = useNavigate();
  const [fieldAdmins, setFieldAdmins] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const ENGINEERING_FIELDS = [
    "Chemical",
    "Civil",
    "Computer",
    "Electrical",
    "Electronics",
    "Material",
    "Mechanical",
    "Mining",
    "Textile",
  ];

  useEffect(() => {
    loadFieldAdmins();
  }, []);

  const loadFieldAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get("/field-admins");
      if (response.data.success) {
        setFieldAdmins(response.data.fieldAdmins);
      }
    } catch (error) {
      console.error("Error loading field admins:", error);
      setError("Failed to load field admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = async (fieldValue) => {
    setSelectedField(fieldValue);
    setSelectedUser("");
    setAvailableUsers([]);
    setError("");

    if (fieldValue) {
      try {
        const response = await api.get(`/admin/users/available/${fieldValue}`);
        if (response.data.success) {
          setAvailableUsers(response.data.users);
          console.log(
            `Users available for ${fieldValue}:`,
            response.data.users
          );
        }
      } catch (error) {
        console.error("Error loading available users:", error);
        setError("Failed to load available users");
      }
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();

    if (!selectedField || !selectedUser) {
      setError("Please select both field and user");
      return;
    }

    setAssigning(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/field-admins/assign", {
        field: selectedField,
        userId: parseInt(selectedUser),
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setSelectedField("");
        setSelectedUser("");
        setAvailableUsers([]);
        loadFieldAdmins();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to assign field admin");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAdmin = async (field) => {
    if (!window.confirm(`Remove the admin for ${field} field?`)) return;

    try {
      const response = await api.delete(`/field-admins/${field}`);
      if (response.data.success) {
        setMessage(response.data.message);
        loadFieldAdmins();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to remove field admin");
    }
  };

  const getCurrentAdmin = (field) => {
    const fieldAdmin = fieldAdmins.find((fa) => fa.field === field);
    return fieldAdmin?.admin || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-semibold text-gray-700">
              Loading field admin data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-bl-full"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent">
                  Field Admin Management
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Assign and manage field administrators for different
                  engineering fields
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Messages */}
        {message && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-emerald-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Enhanced Assignment Form */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-bl-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              Assign New Field Admin
            </h2>

            <form
              onSubmit={handleAssignAdmin}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
            >
              {/* Enhanced Field Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Engineering Field
                </label>
                <select
                  value={selectedField}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90"
                  required
                >
                  <option value="">Select Field</option>
                  {ENGINEERING_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enhanced User Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Available Users
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={!selectedField || availableUsers.length === 0}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">
                    {!selectedField
                      ? "Select field first"
                      : availableUsers.length === 0
                      ? "No users available"
                      : "Select User"}
                  </option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={assigning || !selectedField || !selectedUser}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {assigning ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Assigning...</span>
                  </div>
                ) : (
                  "Assign Admin"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Enhanced Current Assignments Table */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
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
                    d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m4-6h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4-8v8m0 0V9a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              Current Field Assignments
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Field
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Current Admin
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Assigned Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ENGINEERING_FIELDS.map((field) => {
                  const currentAdmin = getCurrentAdmin(field);
                  return (
                    <tr
                      key={field}
                      className="hover:bg-gray-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">
                              {field.charAt(0)}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {field}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentAdmin ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {currentAdmin.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Field Administrator
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            No Admin Assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currentAdmin?.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {currentAdmin?.assigned_at
                          ? new Date(
                              currentAdmin.assigned_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {currentAdmin ? (
                          <button
                            onClick={() => handleRemoveAdmin(field)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove
                          </button>
                        ) : (
                          <span className="text-gray-400">
                            No action available
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldAdmins;
