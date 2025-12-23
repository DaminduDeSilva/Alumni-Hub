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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-bold text-gray-700">
            Loading field admin data...
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
          <h1 className="text-3xl font-headings font-bold text-primary mb-2">
            Field Admin Management
          </h1>
          <p className="text-text-muted text-lg">
            Assign and manage field administrators for different engineering fields
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6 shadow-sm flex items-center">
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
             </svg>
            <span className="font-bold">{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6 shadow-sm flex items-center">
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Assignment Form */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-primary mb-6 border-b border-gray-100 pb-2">
            Assign New Field Admin
          </h2>

          <form
            onSubmit={handleAssignAdmin}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
          >
            {/* Field Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Engineering Field
              </label>
              <select
                value={selectedField}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow bg-white"
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

            {/* User Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Available Users
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={!selectedField || availableUsers.length === 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow bg-white disabled:opacity-50 disabled:bg-gray-100"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={assigning || !selectedField || !selectedUser}
              className="px-6 py-3 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-md uppercase tracking-wider transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-[50px]"
            >
              {assigning ? "Assigning..." : "Assign Admin"}
            </button>
          </form>
        </div>

        {/* Current Assignments Table */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-primary">
              Current Field Assignments
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Current Admin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ENGINEERING_FIELDS.map((field) => {
                  const currentAdmin = getCurrentAdmin(field);
                  return (
                    <tr
                      key={field}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-bold mr-3 border border-blue-200">
                            {field.charAt(0)}
                          </span>
                          <span className="font-bold text-gray-900">
                            {field}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentAdmin ? (
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {currentAdmin.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Field Administrator
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentAdmin?.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                            className="text-red-600 hover:text-red-900 font-bold hover:underline"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-gray-400 cursor-default">
                            -
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

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center text-secondary hover:text-secondary-dark font-bold underline transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldAdmins;
