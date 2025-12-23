import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Directory() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [error, setError] = useState("");
  const [allCountries, setAllCountries] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fieldOptions = [
    "Computer",
    "Civil",
    "Electrical",
    "Mechanical",
    "Chemical",
    "Electronic",
    "Mining",
    "Textile",
    "Materials",
  ];

  // Move performSearch function before useEffect that uses it
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = "/batchmates";
      const params = new URLSearchParams();

      // If there's a search term, use search endpoint
      if (search.trim()) {
        endpoint = "/batchmates/search";
        params.append("q", search.trim());
      }

      if (selectedField) params.append("field", selectedField);
      if (selectedCountry) params.append("country", selectedCountry);

      const res = await api.get(`${endpoint}?${params.toString()}`);
      setAlumni(res.data.batchmates || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch alumni", err);
      setError("Failed to load alumni directory");
    } finally {
      setLoading(false);
    }
  }, [search, selectedField, selectedCountry]);

  useEffect(() => {
    // Initial load - fetch all alumni and countries
    const initialLoad = async () => {
      setLoading(true);
      try {
        const [alumniRes, statsRes] = await Promise.all([
          api.get("/batchmates"),
          api.get("/batchmates/stats/overview"),
        ]);

        setAlumni(alumniRes.data.batchmates || []);
        if (statsRes.data.stats && statsRes.data.stats.byCountry) {
          const countries = statsRes.data.stats.byCountry.map(
            (item) => item.country
          );
          setAllCountries(countries);
        }
        setError("");
      } catch (err) {
        console.error("Failed to load initial data", err);
        setError("Failed to load alumni directory");
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      performSearch();
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [search, selectedField, selectedCountry, performSearch]);

  const exportToExcel = () => {
    const exportData = alumni.map((alum) => ({
      "Full Name": alum.full_name,
      "Calling Name": alum.calling_name,
      Field: alum.field,
      Country: alum.country,
      Email: alum.email,
      "WhatsApp Mobile": alum.whatsapp_mobile,
      "Phone Mobile": alum.phone_mobile || "",
      "Working Place": alum.working_place || "",
      Address: alum.address || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Use field-specific sheet name for field admins
    const sheetName =
      user?.role === "FIELD_ADMIN" && user?.assigned_field
        ? `${user.assigned_field} Alumni`
        : "Alumni Directory";

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-resize columns
    const maxWidth = exportData.reduce((acc, row) => {
      Object.keys(row).forEach((key, index) => {
        const length = String(row[key]).length;
        acc[index] = Math.max(acc[index] || 10, length + 2);
      });
      return acc;
    }, []);

    worksheet["!cols"] = maxWidth.map((width) => ({ width }));

    // Use field-specific filename for field admins
    const baseFileName =
      user?.role === "FIELD_ADMIN" && user?.assigned_field
        ? `${user.assigned_field.toLowerCase()}-alumni`
        : "alumni-directory";

    const fileName = `${baseFileName}-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Add field-specific title
      const title =
        user?.role === "FIELD_ADMIN" && user?.assigned_field
          ? `${user.assigned_field} Alumni Directory`
          : "Alumni Directory";

      // Add title
      doc.setFontSize(16);
      doc.text(title, 20, 20);

      // Add date and field info for field admins
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Total Records: ${alumni.length}`, 20, 35);

      if (user?.role === "FIELD_ADMIN" && user?.assigned_field) {
        doc.text(`Engineering Field: ${user.assigned_field}`, 20, 40);
      }

      // Prepare table data
      const tableData = alumni.map((alum) => [
        alum.full_name,
        alum.calling_name,
        alum.field,
        alum.country,
        alum.email,
        alum.whatsapp_mobile || "",
        alum.working_place || "",
      ]);

      // Use autoTable function directly
      autoTable(doc, {
        head: [
          [
            "Full Name",
            "Calling Name",
            "Field",
            "Country",
            "Email",
            "Mobile",
            "Working Place",
          ],
        ],
        body: tableData,
        startY: user?.role === "FIELD_ADMIN" && user?.assigned_field ? 50 : 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 43, 76] }, // Primary Deep Navy
        alternateRowStyles: { fillColor: [248, 249, 250] },
      });

      // Use field-specific filename for field admins
      const baseFileName =
        user?.role === "FIELD_ADMIN" && user?.assigned_field
          ? `${user.assigned_field.toLowerCase()}-alumni`
          : "alumni-directory";

      const fileName = `${baseFileName}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Error exporting to PDF. Please try again or use Excel export.");
    }
  };

  // Handle viewing alumni details
  const handleViewDetails = (alumni) => {
    setSelectedAlumni(alumni);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAlumni(null);
  };

  // Determine available fields for FIELD_ADMIN
  const availableFields =
    user?.role === "FIELD_ADMIN"
      ? [user?.assigned_field].filter(Boolean)
      : fieldOptions;

  if (loading && alumni.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-8 border-b border-gray-200">
            <div className="flex items-center">
              <h1 className="text-3xl font-headings font-bold text-primary">
                Alumni Directory
                {user?.role === "FIELD_ADMIN" &&
                  ` - ${user.assigned_field} Field`}
              </h1>
            </div>
            <p className="text-text-muted mt-2">Find and connect with your batchmates.</p>
          </div>

          {/* Filters and Search */}
          <div className="p-8 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">
                  Search Alumni
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow text-sm"
                  />
                  {loading && search && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-secondary border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">
                  Field
                </label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow text-sm"
                >
                  <option value="">All Fields</option>
                  {availableFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-secondary uppercase tracking-wider mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow text-sm"
                >
                  <option value="">All Countries</option>
                  {allCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedField("");
                    setSelectedCountry("");
                  }}
                  className="w-full px-4 py-2 bg-text-main text-white font-bold rounded-md hover:bg-black transition-colors duration-200 shadow-sm text-sm uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm font-bold">{error}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : alumni.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-headings">
                  No Alumni Found
                </h3>
                <p className="text-text-muted">
                  Try adjusting your search criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 font-headings">
                    {alumni.length} Alumni Found
                  </h3>
                  {(user?.role === "SUPER_ADMIN" ||
                    user?.role === "FIELD_ADMIN") && (
                    <div className="flex space-x-3">
                      <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-green-700 text-white font-bold rounded-md hover:bg-green-800 transition-colors duration-200 shadow-sm flex items-center space-x-2 text-sm uppercase tracking-wider"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                        <span>Excel</span>
                      </button>
                      <button
                        onClick={exportToPDF}
                        className="px-4 py-2 bg-red-700 text-white font-bold rounded-md hover:bg-red-800 transition-colors duration-200 shadow-sm flex items-center space-x-2 text-sm uppercase tracking-wider"
                      >
                       <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alumni.map((alum) => (
                    <div
                      key={alum.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                          {alum.current_photo_url ? (
                            <img
                              src={alum.current_photo_url}
                              alt={alum.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg
                                className="w-8 h-8"
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
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-primary truncate font-headings">
                            {alum.full_name}
                          </h4>
                          <p className="text-sm text-text-muted mb-1">
                            {alum.calling_name}
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-bold text-secondary uppercase bg-blue-50 px-2 py-0.5 rounded">
                               {alum.field}
                             </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 flex items-center">
                            <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {alum.country}
                          </p>

                          {(user?.role === "SUPER_ADMIN" ||
                            user?.role === "FIELD_ADMIN") && (
                            <div className="mt-4">
                              <button
                                className="text-sm font-bold text-primary hover:text-secondary hover:underline"
                                onClick={() => handleViewDetails(alum)}
                              >
                                View Details &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alumni Details Modal */}
      {showModal && selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-secondary">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-4">
                <div>
                   <h3 className="text-2xl font-bold text-primary font-headings">
                    Alumni Details
                   </h3>
                   <p className="text-text-muted">Detailed profile information.</p>
                </div>
                
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* Alumni Information */}
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedAlumni.full_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        Calling Name
                      </label>
                      <p className="text-gray-900">
                        {selectedAlumni.calling_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {selectedAlumni.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        Phone Number
                      </label>
                      <p className="text-gray-900">
                        {selectedAlumni.phone_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        WhatsApp Mobile
                      </label>
                      <p className="text-gray-900">
                        {selectedAlumni.whatsapp_mobile || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        Country
                      </label>
                      <p className="text-gray-900">
                        {selectedAlumni.country || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        Field of Study
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedAlumni.field || "N/A"}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 gap-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        Working Place
                      </label>
                      <p className="text-gray-900">
                        {selectedAlumni.working_place || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase">
                        Position
                      </label>
                      <p className="text-gray-900">
                        {selectedAlumni.position || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Information */}
                {(selectedAlumni.linkedin_url ||
                  selectedAlumni.facebook_url) && (
                  <div>
                    <h4 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                      Social Media
                    </h4>
                    <div className="flex gap-4">
                      {selectedAlumni.linkedin_url && (
                        <a
                          href={selectedAlumni.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 font-bold text-sm"
                        >
                          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          LinkedIn
                        </a>
                      )}
                      {selectedAlumni.facebook_url && (
                        <a
                          href={selectedAlumni.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 font-bold text-sm"
                        >
                           <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-text-main text-white font-bold rounded-md hover:bg-black transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
