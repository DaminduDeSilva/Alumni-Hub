import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FieldAdmins = () => {
  const navigate = useNavigate();
  const [fieldAdmins, setFieldAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [fieldAdminsRes, usersRes] = await Promise.all([
        axios.get("/api/field-admins", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/field-admins/verified-users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (fieldAdminsRes.data.success) {
        setFieldAdmins(fieldAdminsRes.data.fieldAdmins);
      }

      if (usersRes.data.success) {
        setAllUsers(usersRes.data.users);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
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
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/field-admins/assign",
        {
          field: selectedField,
          userId: parseInt(selectedUser),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setSelectedField("");
        setSelectedUser("");
        loadData();
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
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/api/field-admins/${field}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessage(response.data.message);
        loadData();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to remove field admin");
    }
  };

  // Get current admin for a field
  const getCurrentAdmin = (field) => {
    const fieldAdmin = fieldAdmins.find((fa) => fa.field === field);
    return fieldAdmin?.admin || null;
  };

  // Get users available for assignment (not currently field admins)
  const getAvailableUsers = () => {
    return allUsers.filter((user) => user.role !== "FIELD_ADMIN");
  };

  // Get users by field (for field-specific display)
  const getUsersByField = (field) => {
    return allUsers.filter(
      (user) =>
        user.assigned_field === field ||
        (user.role !== "FIELD_ADMIN" && user.role !== "SUPER_ADMIN")
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p>Loading field admin data...</p>
        </div>
      </div>
    );
  }

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  };

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  };

  const buttonStyle = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#3498db",
    color: "white",
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#e74c3c",
    color: "white",
  };

  const formStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: "16px",
    alignItems: "end",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px",
  };

  const thStyle = {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #dee2e6",
    fontWeight: "600",
  };

  const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #dee2e6",
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={cardStyle}>
          <h1 style={titleStyle}>Field Admin Management</h1>
          <p style={{ color: "#666", marginBottom: "0" }}>
            Assign and manage field administrators for different engineering
            fields
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            style={{
              ...cardStyle,
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              color: "#155724",
              marginBottom: "16px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              ...cardStyle,
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              color: "#721c24",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* Assignment Form */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Assign New Field Admin
          </h2>
          <form onSubmit={handleAssignAdmin} style={formStyle}>
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
                onChange={(e) => setSelectedField(e.target.value)}
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

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                User to Assign:
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
                required
              >
                <option value="">Select User</option>
                {allUsers
                  .filter((user) => user.role !== "SUPER_ADMIN")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email} - {user.role}
                      {user.assigned_field
                        ? ` (Currently: ${user.assigned_field})`
                        : ""}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={assigning}
              style={{
                ...primaryButtonStyle,
                opacity: assigning ? 0.6 : 1,
              }}
            >
              {assigning ? "Assigning..." : "Assign Admin"}
            </button>
          </form>
        </div>

        {/* Current Assignments */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Current Field Assignments
          </h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Field</th>
                <th style={thStyle}>Current Admin</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Assigned Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ENGINEERING_FIELDS.map((field) => {
                const admin = getCurrentAdmin(field);
                return (
                  <tr key={field}>
                    <td style={{ ...tdStyle, fontWeight: "600" }}>{field}</td>
                    {admin ? (
                      <>
                        <td style={tdStyle}>{admin.full_name}</td>
                        <td style={tdStyle}>{admin.email}</td>
                        <td style={tdStyle}>
                          {new Date(admin.assigned_at).toLocaleDateString()}
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => handleRemoveAdmin(field)}
                            style={dangerButtonStyle}
                          >
                            Remove
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          style={{
                            ...tdStyle,
                            fontStyle: "italic",
                            color: "#666",
                          }}
                        >
                          Not assigned
                        </td>
                        <td style={tdStyle}>-</td>
                        <td style={tdStyle}>-</td>
                        <td style={tdStyle}>
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

        {/* Statistics */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Statistics</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                padding: "16px",
                backgroundColor: "#e3f2fd",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1976d2",
                }}
              >
                {ENGINEERING_FIELDS.length}
              </div>
              <div style={{ color: "#666" }}>Total Fields</div>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#e8f5e8",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#388e3c",
                }}
              >
                {fieldAdmins.filter((fa) => fa.admin).length}
              </div>
              <div style={{ color: "#666" }}>Assigned</div>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#fff3e0",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#f57c00",
                }}
              >
                {fieldAdmins.filter((fa) => !fa.admin).length}
              </div>
              <div style={{ color: "#666" }}>Unassigned</div>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#fce4ec",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#c2185b",
                }}
              >
                {allUsers.length}
              </div>
              <div style={{ color: "#666" }}>Total Users</div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={() => navigate("/admin")}
            style={{
              ...primaryButtonStyle,
              backgroundColor: "#6c757d",
            }}
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FieldAdmins;
