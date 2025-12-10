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
    "Chemical", "Civil", "Computer", "Electrical", "Electronics",
    "Material", "Mechanical", "Mining", "Textile"
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const [fieldAdminsRes, usersRes] = await Promise.all([
        axios.get("/api/field-admins", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/api/field-admins/verified-users", { headers: { Authorization: `Bearer ${token}` } })
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
      const response = await axios.post("/api/field-admins/assign", {
        field: selectedField,
        userId: parseInt(selectedUser)
      }, { headers: { Authorization: `Bearer ${token}` } });

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
        headers: { Authorization: `Bearer ${token}` }
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
    const fieldAdmin = fieldAdmins.find(fa => fa.field === field);
    return fieldAdmin?.admin || null;
  };

  // Get users available for assignment (not currently field admins)
  const getAvailableUsers = () => {
    return allUsers.filter(user => user.role !== 'FIELD_ADMIN');
  };

  // Get users by field (for field-specific display)
  const getUsersByField = (field) => {
    return allUsers.filter(user => 
      user.assigned_field === field || 
      (user.role !== 'FIELD_ADMIN' && user.role !== 'SUPER_ADMIN')
    );
  };

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading field admin data...</p>
        </div>
      </div>
    );
  }

  const handleRemoveAdmin = async (field) => {
    if (
      !window.confirm(
        `Are you sure you want to remove the field admin for ${field}?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/api/field-admins/${field}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessage(response.data.message);
        fetchFieldAdmins();
        fetchVerifiedUsers();
      }
    } catch (error) {
      console.error("Error removing field admin:", error);
      setError(error.response?.data?.message || "Failed to remove field admin");
    }
  };

  const getAvailableFields = () => {
    const assignedFields = fieldAdmins
      .filter((fa) => fa.admin)
      .map((fa) => fa.field);

    return ENGINEERING_FIELDS.filter(
      (field) => !assignedFields.includes(field)
    );
  };

  const getAvailableUsers = () => {
    return verifiedUsers.filter((user) => user.role !== "FIELD_ADMIN");
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading field admin data...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Field Admin Management</h1>
        <p>
          Assign and manage field administrators for different engineering
          fields
        </p>
      </div>

      {message && <div className="success-message">{message}</div>}

      {error && <div className="error-message">{error}</div>}

      {/* Assignment Form */}
      <div className="admin-section">
        <h2>Assign New Field Admin</h2>
        <form onSubmit={handleAssignAdmin} className="assignment-form">
          <div className="form-row">
            <div className="form-group">
              <label>Engineering Field:</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                required
              >
                <option value="">Select Field</option>
                {getAvailableFields().map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Verified User:</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
              >
                <option value="">Select User</option>
                {getAvailableUsers().map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={assigning} className="assign-btn">
              {assigning ? "Assigning..." : "Assign Admin"}
            </button>
          </div>
        </form>
      </div>

      {/* Field Admins Table */}
      <div className="admin-section">
        <h2>Current Field Assignments</h2>
        <div className="field-admins-table">
          <table>
            <thead>
              <tr>
                <th>Engineering Field</th>
                <th>Current Admin</th>
                <th>Email</th>
                <th>Assigned Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fieldAdmins.map((fieldAdmin) => (
                <tr key={fieldAdmin.field}>
                  <td className="field-name">
                    <strong>{fieldAdmin.field}</strong>
                  </td>
                  {fieldAdmin.admin ? (
                    <>
                      <td>{fieldAdmin.admin.full_name}</td>
                      <td>{fieldAdmin.admin.email}</td>
                      <td>
                        {new Date(
                          fieldAdmin.admin.assigned_at
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveAdmin(fieldAdmin.field)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="no-admin">Not assigned</td>
                      <td>-</td>
                      <td>-</td>
                      <td>
                        <span className="assign-hint">
                          Use form above to assign
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-section">
        <h2>Assignment Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Fields</h3>
            <p>{ENGINEERING_FIELDS.length}</p>
          </div>
          <div className="stat-card">
            <h3>Assigned</h3>
            <p>{fieldAdmins.filter((fa) => fa.admin).length}</p>
          </div>
          <div className="stat-card">
            <h3>Unassigned</h3>
            <p>{fieldAdmins.filter((fa) => !fa.admin).length}</p>
          </div>
          <div className="stat-card">
            <h3>Available Users</h3>
            <p>{getAvailableUsers().length}</p>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <button onClick={() => navigate("/admin")} className="secondary-btn">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default FieldAdmins;
