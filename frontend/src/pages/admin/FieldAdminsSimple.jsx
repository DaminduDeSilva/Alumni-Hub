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
        // Backend filters users available for this specific field
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>Loading field admin data...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#333",
            }}
          >
            Field Admin Management
          </h1>
          <p style={{ color: "#666", marginBottom: "0" }}>
            Assign and manage field administrators for different engineering
            fields
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              color: "#155724",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              color: "#721c24",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* Assignment Form */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Assign New Field Admin
          </h2>

          <form
            onSubmit={handleAssignAdmin}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: "16px",
              alignItems: "end",
            }}
          >
            {/* Field Selection */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Engineering Field:
              </label>
              <select
                value={selectedField}
                onChange={(e) => handleFieldChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
                required
              >
                <option value="">Select Field</option>
                {ENGINEERING_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {field}{" "}
                    {getCurrentAdmin(field) ? "(Currently assigned)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* User Selection */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                User to Assign:
                {!selectedField && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      fontWeight: "normal",
                    }}
                  >
                    {" "}
                    (Select a field first)
                  </span>
                )}
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={!selectedField}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: !selectedField ? "#f5f5f5" : "#fff",
                  cursor: !selectedField ? "not-allowed" : "pointer",
                  opacity: !selectedField ? 0.6 : 1,
                }}
                required
              >
                <option value="">
                  {!selectedField ? "Select field first" : "Select User"}
                </option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email} - {user.role}
                    {user.assigned_field
                      ? ` (Currently: ${user.assigned_field})`
                      : " (Unassigned)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={assigning || !selectedField || !selectedUser}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor:
                  assigning || !selectedField || !selectedUser
                    ? "not-allowed"
                    : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: "#3498db",
                color: "white",
                opacity: assigning || !selectedField || !selectedUser ? 0.6 : 1,
              }}
            >
              {assigning
                ? "Assigning..."
                : !selectedField
                ? "Select Field First"
                : !selectedUser
                ? "Select User"
                : "Assign Admin"}
            </button>
          </form>
        </div>

        {/* Current Assignments Table */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Current Field Assignments
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "16px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                  }}
                >
                  Field
                </th>
                <th
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                  }}
                >
                  Current Admin
                </th>
                <th
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                  }}
                >
                  Assigned Date
                </th>
                <th
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ENGINEERING_FIELDS.map((field) => {
                const admin = getCurrentAdmin(field);
                return (
                  <tr key={field}>
                    <td
                      style={{
                        padding: "12px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      {field}
                    </td>
                    {admin ? (
                      <>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {admin.full_name}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {admin.email}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {new Date(admin.assigned_at).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <button
                            onClick={() => handleRemoveAdmin(field)}
                            style={{
                              padding: "10px 20px",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              backgroundColor: "#e74c3c",
                              color: "white",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #dee2e6",
                            fontStyle: "italic",
                            color: "#666",
                          }}
                        >
                          Not assigned
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          -
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          -
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <span style={{ color: "#666", fontSize: "14px" }}>
                            Use form above to assign
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Back Button */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={() => navigate("/admin")}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "#6c757d",
              color: "white",
            }}
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldAdmins;
