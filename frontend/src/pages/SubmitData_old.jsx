import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const SubmitData = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    callingName: "",
    fullName: "",
    nickName: "",
    address: "",
    country: "",
    workingPlace: "",
    whatsappMobile: "",
    phoneMobile: "",
    email: "",
    field: "",
  });

  const [files, setFiles] = useState({
    universityPhoto: null,
    currentPhoto: null,
  });

  const [countries, setCountries] = useState([]);
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated or already verified
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (user?.role !== "UNVERIFIED") {
      navigate("/");
      toast.error("Only unverified users can submit data");
    }
  }, [isAuthenticated, user, navigate]);

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load countries
        const countriesRes = await api.get("/submissions/countries");
        setCountries(countriesRes.data.countries);

        // Load fields
        const fieldsRes = await api.get("/submissions/fields");
        setFields(fieldsRes.data.fields);

        // Pre-fill email if available
        if (user?.email) {
          setFormData((prev) => ({ ...prev, email: user.email }));
        }
      } catch (error) {
        toast.error("Failed to load form data");
        console.error("Load data error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "UNVERIFIED") {
      loadData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const validateForm = () => {
    const required = [
      "callingName",
      "fullName",
      "whatsappMobile",
      "email",
      "country",
      "field",
    ];
    const missing = required.filter((field) => !formData[field]);

    if (missing.length > 0) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
      return false;
    }

    // REMOVED: Photo requirement check - photos are now optional

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Validate WhatsApp number (simple validation)
    if (formData.whatsappMobile.length < 8) {
      toast.error("Please enter a valid WhatsApp number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add files
      if (files.universityPhoto) {
        formDataToSend.append("universityPhoto", files.universityPhoto);
      }
      if (files.currentPhoto) {
        formDataToSend.append("currentPhoto", files.currentPhoto);
      }

      const response = await api.post("/submissions/submit", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Data submitted successfully! Waiting for admin approval.");
      navigate("/my-submissions");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Submission failed";
      toast.error(errorMsg);
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-semibold text-gray-700">Loading form...</span>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== "UNVERIFIED") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full"></div>
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Join the Alumni Directory
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Connect with your fellow alumni around the world
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-white">1</span>
                </div>
              </div>
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Submit Your Information
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Fill out your details to join our alumni network
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-600">In Progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Form Header */}
          <div className="relative px-8 py-8 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 border-b border-white/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Personal Information
                </h2>
                <p className="text-gray-600 mt-1">
                  Your basic contact and professional details
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="group">
                  <label
                    htmlFor="callingName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Calling Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="callingName"
                      id="callingName"
                      value={formData.callingName}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      placeholder="e.g., John"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      placeholder="e.g., John David Smith"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="nickName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nickname <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="nickName"
                      id="nickName"
                      value={formData.nickName}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      placeholder="e.g., Johnny"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      placeholder="john@example.com"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="group">
                  <label
                    htmlFor="whatsappMobile"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    WhatsApp Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097"/>
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="whatsappMobile"
                      id="whatsappMobile"
                      value={formData.whatsappMobile}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      placeholder="+1234567890"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="phoneMobile"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Mobile <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phoneMobile"
                      id="phoneMobile"
                      value={formData.phoneMobile}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      placeholder="+1234567890"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Professional Information Section */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Location & Professional Information
              </h3>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="group">
                  <label
                    htmlFor="country"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      name="country"
                      id="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      required
                    >
                      <option value="">Select your country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="field"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Field of Study/Work <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <select
                      name="field"
                      id="field"
                      value={formData.field}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      required
                    >
                      <option value="">Select your field</option>
                      {fields.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group lg:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Address <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm resize-none"
                      placeholder="Your current address"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group lg:col-span-2">
                  <label
                    htmlFor="workingPlace"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Current Workplace <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="workingPlace"
                      id="workingPlace"
                      value={formData.workingPlace}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 group-hover:shadow-md bg-white/80 backdrop-blur-sm"
                      placeholder="e.g., Google, Microsoft, Freelancer"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Photo Upload Section */}
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                Photo Uploads
                <span className="ml-2 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Optional</span>
              </h3>
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-6 border border-blue-100/50 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    Upload your university and current photos to help fellow alumni recognize you in the directory
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="group">
                  <label
                    htmlFor="universityPhoto"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    University Photo
                  </label>
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl px-6 py-8 text-center hover:border-blue-400 transition-all duration-200 group-hover:shadow-md bg-gradient-to-br from-gray-50/50 to-blue-50/50">
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 text-gray-400 flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="text-sm text-gray-600">
                          <label
                            htmlFor="universityPhoto"
                            className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium"
                          >
                            Click to upload
                          </label>
                          <span> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        name="universityPhoto"
                        id="universityPhoto"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {files.universityPhoto && (
                      <div className="mt-3 flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {files.universityPhoto.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="currentPhoto"
                    className="block text-sm font-semibold text-gray-700 mb-3"
                  >
                    Current Photo
                  </label>
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl px-6 py-8 text-center hover:border-blue-400 transition-all duration-200 group-hover:shadow-md bg-gradient-to-br from-gray-50/50 to-blue-50/50">
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 text-gray-400 flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="text-sm text-gray-600">
                          <label
                            htmlFor="currentPhoto"
                            className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium"
                          >
                            Click to upload
                          </label>
                          <span> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        name="currentPhoto"
                        id="currentPhoto"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {files.currentPhoto && (
                      <div className="mt-3 flex items-center text-sm text-green-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {files.currentPhoto.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Submit Button */}
          <div className="relative px-8 py-6 bg-gradient-to-r from-gray-50/50 via-blue-50/50 to-indigo-50/50 border-t border-white/20 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Your information is secure and will be reviewed before publication
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Application
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitData;
                >
                  Engineering Field <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    name="field"
                    id="field"
                    value={formData.field}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select your field</option>
                    {fields.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="whatsappMobile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="whatsappMobile"
                      id="whatsappMobile"
                      value={formData.whatsappMobile}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneMobile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phoneMobile"
                      id="phoneMobile"
                      value={formData.phoneMobile}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <select
                      name="country"
                      id="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select your country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Work Information
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="workingPlace"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Workplace
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="workingPlace"
                      id="workingPlace"
                      value={formData.workingPlace}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., ABC Engineering Ltd."
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Your current address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Photos (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your university and current photos to help fellow alumni
                recognize you
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="universityPhoto"
                    className="block text-sm font-medium text-gray-700"
                  >
                    University Photo
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      name="universityPhoto"
                      id="universityPhoto"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="currentPhoto"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Photo
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      name="currentPhoto"
                      id="currentPhoto"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitData;
