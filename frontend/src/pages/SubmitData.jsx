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

      if (response.data.success) {
        toast.success("Application submitted successfully!");
        navigate("/my-submissions");
      } else {
        toast.error(response.data.message || "Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error("Invalid data provided. Please check your inputs.");
      } else if (error.response?.status === 409) {
        toast.error("You have already submitted an application.");
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-bold text-gray-700">
            Loading form...
          </span>
        </div>
      </div>
    );
  }

  if (user?.role !== "UNVERIFIED") {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary text-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg
                  className="w-8 h-8"
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
            </div>
            <h1 className="text-3xl font-headings font-bold text-primary">
              Join the Alumni Directory
            </h1>
            <p className="text-text-muted text-lg mt-1">
              Connect with your fellow alumni around the world
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden"
        >
          {/* Form Header */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-headings font-bold text-primary">
              Personal Information
            </h2>
            <p className="text-text-muted mt-1">
              Your basic contact and professional details
            </p>
          </div>

          <div className="px-8 py-8 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-bold text-secondary uppercase tracking-wider mb-6 flex items-center border-b border-gray-200 pb-2">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="callingName"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Calling Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="callingName"
                    id="callingName"
                    value={formData.callingName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                    placeholder="e.g., John"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                    placeholder="e.g., John David Smith"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="nickName"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Nickname{" "}
                    <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="nickName"
                    id="nickName"
                    value={formData.nickName}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                    placeholder="e.g., Johnny"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-bold text-secondary uppercase tracking-wider mb-6 flex items-center border-b border-gray-200 pb-2">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="whatsappMobile"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    WhatsApp Mobile <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="whatsappMobile"
                      id="whatsappMobile"
                      value={formData.whatsappMobile}
                      onChange={handleInputChange}
                      className="block w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneMobile"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Phone Mobile{" "}
                    <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneMobile"
                    id="phoneMobile"
                    value={formData.phoneMobile}
                    onChange={handleInputChange}
                    className="block w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Location & Professional Information Section */}
            <div>
               <h3 className="text-lg font-bold text-secondary uppercase tracking-wider mb-6 flex items-center border-b border-gray-200 pb-2">
                Location & Professional Information
              </h3>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Country <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="country"
                    id="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
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

                <div>
                  <label
                    htmlFor="field"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Field of Study/Work <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="field"
                    id="field"
                    value={formData.field}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
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

                <div className="lg:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Address{" "}
                    <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow resize-none"
                    placeholder="Your current address"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label
                    htmlFor="workingPlace"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Current Workplace{" "}
                    <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="workingPlace"
                    id="workingPlace"
                    value={formData.workingPlace}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                    placeholder="e.g., Google, Microsoft, Freelancer"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div>
               <h3 className="text-lg font-bold text-secondary uppercase tracking-wider mb-6 flex items-center border-b border-gray-200 pb-2">
                Photo Uploads
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full font-normal italic lowercase border border-gray-200">
                  optional
                </span>
              </h3>
              
              <div className="bg-blue-50 rounded-md p-4 mb-6 border border-blue-100">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-blue-800">
                    Upload your university and current photos to help fellow
                    alumni recognize you in the directory.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="universityPhoto"
                    className="block text-sm font-bold text-gray-700 mb-3"
                  >
                    University Photo
                  </label>
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 text-center hover:border-secondary transition-all duration-200 bg-gray-50">
                      <div className="space-y-2">
                         <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        <div className="text-sm text-gray-600">
                          <label
                            htmlFor="universityPhoto"
                            className="cursor-pointer text-secondary hover:text-secondary-dark font-bold underline"
                          >
                            Click to upload
                          </label>
                          <span> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
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
                      <div className="mt-3 flex items-center text-sm text-green-700 font-medium">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {files.universityPhoto.name}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="currentPhoto"
                    className="block text-sm font-bold text-gray-700 mb-3"
                  >
                    Current Photo
                  </label>
                  <div className="relative">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 text-center hover:border-secondary transition-all duration-200 bg-gray-50">
                      <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        <div className="text-sm text-gray-600">
                          <label
                            htmlFor="currentPhoto"
                            className="cursor-pointer text-secondary hover:text-secondary-dark font-bold underline"
                          >
                            Click to upload
                          </label>
                          <span> or drag and drop</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
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
                      <div className="mt-3 flex items-center text-sm text-green-700 font-medium">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {files.currentPhoto.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-md shadow-sm uppercase tracking-wider transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitData;
