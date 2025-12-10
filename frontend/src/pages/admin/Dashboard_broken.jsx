import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (user?.role === "SUPER_ADMIN" || user?.role === "FIELD_ADMIN") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load pending submissions (API automatically filters by field for FIELD_ADMIN)
      const pendingRes = await api.get("/admin/submissions/pending");
      setPendingSubmissions(pendingRes.data.submissions);

      // Load all submissions (API automatically filters by field for FIELD_ADMIN)
      const allRes = await api.get("/admin/submissions");
      setAllSubmissions(allRes.data.submissions);

      // Load stats
      const statsRes = await api.get("/batchmates/stats/overview");
      setStats(statsRes.data.stats);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Load data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (submissionId, assignedField = null) => {
    try {
      setApproveLoading(true);

      await api.put(`/admin/submissions/${submissionId}/approve`, {
        assignedField,
      });

      toast.success("Submission approved successfully");
      loadData(); // Refresh data
      setSelectedSubmission(null);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to approve");
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async (submissionId) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setRejectLoading(true);

      await api.put(`/admin/submissions/${submissionId}/reject`, {
        reason: rejectReason,
      });

      toast.success("Submission rejected");
      loadData(); // Refresh data
      setSelectedSubmission(null);
      setRejectReason("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject");
    } finally {
      setRejectLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role !== "SUPER_ADMIN" && user?.role !== "FIELD_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-600 mt-2">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === "FIELD_ADMIN"
                ? `${user?.assigned_field} Engineering Dashboard`
                : "Alumni Management Center"}
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              {user?.role === "FIELD_ADMIN"
                ? "Review and approve alumni submissions for your specialized field"
                : "Comprehensive oversight of alumni submissions across all engineering disciplines"}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden border border-gray-100 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Review</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {pendingSubmissions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2v1a2 2 0 01-2-2V5zM3 5a3 3 0 013-3h8a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Submissions
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {allSubmissions.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {
                        allSubmissions.filter((s) => s.status === "APPROVED")
                          .length
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Rejected
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {
                        allSubmissions.filter((s) => s.status === "REJECTED")
                          .length
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-medium text-gray-900">
                  Pending Review ({pendingSubmissions.length})
                </h3>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="p-6 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    All caught up!
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No pending submissions to review.
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {pendingSubmissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      className={`p-4 ${
                        index !== pendingSubmissions.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {submission.full_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {submission.calling_name} • {submission.field}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {submission.email} • {submission.country}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {allSubmissions.slice(0, 5).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center text-sm"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        submission.status === "APPROVED"
                          ? "bg-green-500"
                          : submission.status === "REJECTED"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-gray-900 truncate flex-1">
                      {submission.full_name}
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        submission.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {submission.status.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Review Panel */}
          <div>
            <div className="bg-white rounded-lg shadow overflow-hidden sticky top-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">
                  {selectedSubmission ? "Review Submission" : "Quick Actions"}
                </h2>
              </div>

              <div className="p-6">
                {selectedSubmission ? (
                  <div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Applicant Details
                        </h4>
                        <p className="mt-1">{selectedSubmission.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {selectedSubmission.user_email}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Field
                        </h4>
                        <p className="mt-1 font-medium">
                          {selectedSubmission.field}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Contact
                        </h4>
                        <p className="mt-1">
                          {selectedSubmission.whatsapp_mobile}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedSubmission.email}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          Location
                        </h4>
                        <p className="mt-1">{selectedSubmission.country}</p>
                        {selectedSubmission.working_place && (
                          <p className="text-sm text-gray-600">
                            {selectedSubmission.working_place}
                          </p>
                        )}
                      </div>

                      {/* Photos */}
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSubmission.university_photo_url && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              University Photo
                            </h4>
                            <img
                              src={selectedSubmission.university_photo_url}
                              alt="University"
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}

                        {selectedSubmission.current_photo_url && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Current Photo
                            </h4>
                            <img
                              src={selectedSubmission.current_photo_url}
                              alt="Current"
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Approval Actions */}
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assign as Field Admin? (Optional)
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          onChange={(e) => {
                            // Update selected submission with assigned field
                            setSelectedSubmission({
                              ...selectedSubmission,
                              assignedField: e.target.value,
                            });
                          }}
                        >
                          <option value="">Regular Verified User</option>
                          <option value={selectedSubmission.field}>
                            Field Admin ({selectedSubmission.field})
                          </option>
                        </select>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleApprove(
                              selectedSubmission.id,
                              selectedSubmission.assignedField
                            )
                          }
                          disabled={approveLoading}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {approveLoading ? "Approving..." : "Approve"}
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt("Enter rejection reason:");
                            if (reason) {
                              setRejectReason(reason);
                              handleReject(selectedSubmission.id);
                            }
                          }}
                          disabled={rejectLoading}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedSubmission(null)}
                        className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel Review
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Select a submission from the list to review
                    </p>
                    <button
                      onClick={loadData}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Refresh Data
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">
                    Field Distribution
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {stats.byField.map((item) => (
                      <div key={item.field}>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.field}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(item.count / stats.total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
