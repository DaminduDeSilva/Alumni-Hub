import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allCountries, setAllCountries] = useState([]);
  const [reportData, setReportData] = useState(null);

  // Report filters
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

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

  useEffect(() => {
    loadCountries();

    // Set default field for field admins
    if (user?.role === "FIELD_ADMIN" && user?.assigned_field) {
      setSelectedFields([user.assigned_field]);
    }
  }, [user]);

  const loadCountries = async () => {
    try {
      const res = await api.get("/batchmates/stats/overview");
      if (res.data.stats && res.data.stats.byCountry) {
        const countries = res.data.stats.byCountry.map((item) => item.country);
        setAllCountries(countries);
      }
    } catch (error) {
      console.error("Failed to load countries", error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      // Add field filters as array parameter
      if (selectedFields.length > 0) {
        // For multiple fields, send as array
        selectedFields.forEach((field) => {
          params.append("fields", field);
        });
      }

      // Add country filter
      if (selectedCountry) {
        params.append("country", selectedCountry);
      }

      const res = await api.get(`/batchmates?${params.toString()}`);

      setReportData({
        alumni: res.data.batchmates || [],
        totalCount: res.data.count || 0,
        filters: {
          fields: selectedFields,
          country: selectedCountry,
        },
      });
    } catch (err) {
      console.error("Failed to generate report", err);
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;

    const exportData = reportData.alumni.map((alum) => ({
      "Full Name": alum.full_name,
      "Calling Name": alum.calling_name,
      Field: alum.field,
      Country: alum.country,
      Email: alum.email,
      "WhatsApp Mobile": alum.whatsapp_mobile || "",
      "Phone Number": alum.phone_number || "",
      "Working Place": alum.working_place || "",
      Position: alum.position || "",
      Address: alum.address || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    const sheetName = "Alumni_Report";
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

    const fieldsText =
      reportData.filters.fields.length > 0
        ? reportData.filters.fields.join("-")
        : "all-fields";
    const fileName = `alumni-report-${fieldsText}-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    if (!reportData) return;

    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text("Alumni Report", 20, 20);

      // Add report details
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      if (reportData.filters.fields.length > 0) {
        doc.text(`Fields: ${reportData.filters.fields.join(", ")}`, 20, 35);
      }
      if (reportData.filters.country) {
        doc.text(`Country: ${reportData.filters.country}`, 20, 40);
      }
      doc.text(`Total Records: ${reportData.totalCount}`, 20, 45);

      // Prepare table data
      const tableData = reportData.alumni.map((alum) => [
        alum.full_name,
        alum.calling_name,
        alum.field,
        alum.country,
        alum.email,
        alum.working_place || "",
      ]);

      autoTable(doc, {
        head: [
          [
            "Full Name",
            "Calling Name",
            "Field",
            "Country",
            "Email",
            "Working Place",
          ],
        ],
        body: tableData,
        startY: 55,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      const fieldsText =
        reportData.filters.fields.length > 0
          ? reportData.filters.fields.join("-")
          : "all-fields";
      const fileName = `alumni-report-${fieldsText}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Error exporting to PDF. Please try again or use Excel export.");
    }
  };

  const handleFieldChange = (field, checked) => {
    if (user?.role === "FIELD_ADMIN") {
      // Field admins can only select their assigned field
      return;
    }

    if (checked) {
      setSelectedFields([...selectedFields, field]);
    } else {
      setSelectedFields(selectedFields.filter((f) => f !== field));
    }
  };

  const handleAllFieldsChange = (checked) => {
    if (user?.role === "FIELD_ADMIN") {
      // Field admins can only select their assigned field
      return;
    }

    if (checked) {
      setSelectedFields([...fieldOptions]);
    } else {
      setSelectedFields([]);
    }
  };

  const isAllFieldsSelected = selectedFields.length === fieldOptions.length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Alumni Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Generate detailed reports with field and country filtering
          </p>
        </div>

        {/* Report Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Engineering Fields
            </label>
            {user?.role === "FIELD_ADMIN" ? (
              <div className="px-3 py-2 bg-gray-100 rounded-lg border">
                <span className="text-gray-800">{user.assigned_field}</span>
                <span className="text-xs text-gray-500 ml-2">
                  (Your assigned field)
                </span>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {/* All Fields Checkbox */}
                <label className="flex items-center space-x-2 p-1 border-b border-gray-200 pb-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isAllFieldsSelected}
                    onChange={(e) => handleAllFieldsChange(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    All Fields
                  </span>
                </label>

                {fieldOptions.map((field) => (
                  <label
                    key={field}
                    className="flex items-center space-x-2 p-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={(e) =>
                        handleFieldChange(field, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country (Residence)
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              {allCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="mb-8">
          <button
            onClick={generateReport}
            disabled={
              loading ||
              (user?.role === "SUPER_ADMIN" && selectedFields.length === 0)
            }
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </span>
            ) : (
              "Generate Report"
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Report Results */}
        {reportData && (
          <div className="space-y-6">
            {/* Report Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Report Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-blue-600">Total Alumni:</span>
                  <p className="text-2xl font-bold text-blue-800">
                    {reportData.totalCount}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Fields:</span>
                  <p className="font-medium text-blue-800">
                    {reportData.filters.fields.length > 0
                      ? reportData.filters.fields.join(", ")
                      : "All Fields"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-blue-600">Country:</span>
                  <p className="font-medium text-blue-800">
                    {reportData.filters.country || "All Countries"}
                  </p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="flex space-x-4">
              <button
                onClick={exportToExcel}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Export to Excel</span>
              </button>

              <button
                onClick={exportToPDF}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg flex items-center space-x-2"
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
                <span>Export to PDF</span>
              </button>
            </div>

            {/* Report Data Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">
                  Alumni Data
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Working Place
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.alumni.map((alum, index) => (
                      <tr key={alum.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {alum.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {alum.calling_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {alum.field}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {alum.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {alum.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {alum.working_place || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
