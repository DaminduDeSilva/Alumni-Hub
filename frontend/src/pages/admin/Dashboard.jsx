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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const statusConfig = {
      PENDING: {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
        label: "Pending",
      },
      APPROVED: {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
        label: "Approved",
      },
      REJECTED: {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
        label: "Rejected",
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-bold text-gray-700">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (user?.role !== "SUPER_ADMIN" && user?.role !== "FIELD_ADMIN") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5C3.57 18.333 4.532 20 6.072 20z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-headings font-bold text-red-700 mb-3">
            Access Denied
          </h1>
          <p className="text-text-muted text-lg">
            Administrator access required to view this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-headings font-bold text-primary">
                {user?.role === "FIELD_ADMIN"
                  ? `${user?.assigned_field} Engineering Administration`
                  : "Alumni Management Dashboard"}
              </h1>
              <p className="text-text-muted mt-2 text-lg">
                {user?.role === "FIELD_ADMIN"
                  ? "Review and approve alumni submissions for your field"
                  : "Manage alumni submissions across all engineering fields"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-yellow-400">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-50 p-3 rounded-md">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-bold text-gray-500 uppercase tracking-wide truncate">
                    Pending Review
                  </dt>
                  <dd className="text-2xl font-bold text-primary mt-1">
                    {pendingSubmissions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-400">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 p-3 rounded-md">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-bold text-gray-500 uppercase tracking-wide truncate">
                    Total Submissions
                  </dt>
                  <dd className="text-2xl font-bold text-primary mt-1">
                    {allSubmissions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-400">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 p-3 rounded-md">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-bold text-gray-500 uppercase tracking-wide truncate">
                    Approved
                  </dt>
                  <dd className="text-2xl font-bold text-primary mt-1">
                    {allSubmissions.filter((s) => s.status === "APPROVED").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-red-400">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-50 p-3 rounded-md">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-bold text-gray-500 uppercase tracking-wide truncate">
                    Rejected
                  </dt>
                  <dd className="text-2xl font-bold text-primary mt-1">
                    {allSubmissions.filter((s) => s.status === "REJECTED").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-headings font-bold text-primary">
                  Pending Review <span className="text-secondary ml-2">({pendingSubmissions.length})</span>
                </h3>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">All caught up!</h3>
                  <p className="text-text-muted">No pending submissions to review at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {pendingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                            <h4 className="text-base font-bold text-primary">
                              {submission.full_name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            <span className="font-bold text-secondary">
                              {submission.calling_name}
                            </span>{" "}
                            •
                            <span className="ml-1 text-gray-500">
                              {submission.field}
                            </span>
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                               <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                               </svg>
                               {submission.email}
                            </span>
                             <span className="flex items-center">
                               <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                               {submission.country}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setIsModalOpen(true);
                          }}
                          className="ml-4 flex-shrink-0 inline-flex items-center px-4 py-2 bg-secondary hover:bg-secondary-dark text-white text-sm font-bold rounded-md uppercase tracking-wide transition-colors duration-200 shadow-sm"
                        >
                           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden h-full">
               <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                 <h3 className="text-lg font-headings font-bold text-primary">
                  Recent Activity
                </h3>
               </div>
              <div className="p-4">
                 <div className="space-y-4">
                  {allSubmissions.slice(0, 8).map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors duration-200 border border-transparent hover:border-gray-200"
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {submission.full_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {submission.field}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Improved Modal */}
        {isModalOpen && selectedSubmission && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={() => setIsModalOpen(false)}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-200">
                <div className="bg-white px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-headings font-bold text-primary" id="modal-title">
                    Review Submission
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Applicant Info */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-1">Applicant</h4>
                          <p className="text-xl font-bold text-gray-900">{selectedSubmission.full_name}</p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          {getStatusBadge(selectedSubmission.status)}
                        </div>
                      </div>
                       <p className="text-sm text-gray-500">{selectedSubmission.user_email}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 border border-gray-200 rounded-md">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Field</span>
                        <span className="font-bold text-gray-900">{selectedSubmission.field}</span>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-md">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Calling Name</span>
                        <span className="font-medium text-gray-900">{selectedSubmission.calling_name}</span>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-md">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact</span>
                        <span className="font-medium text-gray-900 block">{selectedSubmission.whatsapp_mobile}</span>
                        <span className="text-gray-500 text-xs">{selectedSubmission.email}</span>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-md">
                        <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Submitted Date</span>
                        <span className="font-medium text-gray-900">
                           {new Date(selectedSubmission.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="p-3 border border-gray-200 rounded-md md:col-span-2">
                         <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Location / Country</span>
                         <span className="font-medium text-gray-900">{selectedSubmission.country}</span>
                      </div>
                    </div>

                    {/* Rejection Reason Input */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Rejection Reason <span className="text-gray-400 font-normal lowercase">(Optional, only if rejecting)</span>
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow resize-none bg-gray-50 text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-md hover:bg-gray-100 transition-colors uppercase tracking-wider text-sm"
                  >
                    Cancel
                  </button>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        handleReject(selectedSubmission.id);
                        setIsModalOpen(false);
                      }}
                      disabled={approveLoading || rejectLoading}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-md transition-colors uppercase tracking-wider text-sm shadow-sm disabled:opacity-50"
                    >
                      {rejectLoading ? "Rejecting..." : "Reject"}
                    </button>
                    <button
                      onClick={() => {
                         handleApprove(selectedSubmission.id);
                         setIsModalOpen(false);
                      }}
                      disabled={approveLoading || rejectLoading}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-md transition-colors uppercase tracking-wider text-sm shadow-sm disabled:opacity-50"
                    >
                      {approveLoading ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
