import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const EditProfile = () => {
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

  const [currentPhotos, setCurrentPhotos] = useState({
    universityPhotoUrl: "",
    currentPhotoUrl: "",
  });

  const [countries, setCountries] = useState([]);
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated or not verified
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (user?.role === "UNVERIFIED") {
      navigate("/submit");
      toast.error("Please submit your data for verification first");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Load profile data and dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load countries and fields
        const [countriesRes, fieldsRes, profileRes] = await Promise.all([
          api.get("/submissions/countries"),
          api.get("/submissions/fields"),
          api.get("/user/profile"),
        ]);

        setCountries(countriesRes.data.countries);
        setFields(fieldsRes.data.fields);

        if (profileRes.data.success) {
          const profile = profileRes.data.profile;
          setFormData({
            callingName: profile.callingName || "",
            fullName: profile.fullName || "",
            nickName: profile.nickName || "",
            address: profile.address || "",
            country: profile.country || "",
            workingPlace: profile.workingPlace || "",
            whatsappMobile: profile.whatsappMobile || "",
            phoneMobile: profile.phoneMobile || "",
            email: profile.email || "",
            field: profile.field || "",
          });

          setCurrentPhotos({
            universityPhotoUrl: profile.universityPhotoUrl || "",
            currentPhotoUrl: profile.currentPhotoUrl || "",
          });
        }
      } catch (error) {
        console.error("Load data error:", error);
        if (error.response?.status === 404) {
          toast.error("Profile not found. Please contact administrator.");
          navigate("/");
        } else {
          toast.error("Failed to load profile data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role !== "UNVERIFIED") {
      loadData();
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles((prev) => ({
        ...prev,
        [name]: fileList[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Add files if selected
      if (files.universityPhoto) {
        formDataToSend.append("universityPhoto", files.universityPhoto);
      }
      if (files.currentPhoto) {
        formDataToSend.append("currentPhoto", files.currentPhoto);
      }

      const response = await api.put("/user/profile", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Profile updated successfully!");

        // Update current photos if new ones were uploaded
        if (response.data.profile.universityPhotoUrl) {
          setCurrentPhotos((prev) => ({
            ...prev,
            universityPhotoUrl: response.data.profile.universityPhotoUrl,
          }));
        }
        if (response.data.profile.currentPhotoUrl) {
          setCurrentPhotos((prev) => ({
            ...prev,
            currentPhotoUrl: response.data.profile.currentPhotoUrl,
          }));
        }

        // Clear file inputs
        setFiles({
          universityPhoto: null,
          currentPhoto: null,
        });

        // Clear file input elements
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => (input.value = ""));
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="text-blue-100 mt-1">Update your alumni information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calling Name *
                  </label>
                  <input
                    type="text"
                    name="callingName"
                    value={formData.callingName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nick Name
                  </label>
                  <input
                    type="text"
                    name="nickName"
                    value={formData.nickName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Place
                    </label>
                    <input
                      type="text"
                      name="workingPlace"
                      value={formData.workingPlace}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Mobile *
                  </label>
                  <input
                    type="tel"
                    name="whatsappMobile"
                    value={formData.whatsappMobile}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Mobile
                  </label>
                  <input
                    type="tel"
                    name="phoneMobile"
                    value={formData.phoneMobile}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Academic Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field *
                </label>
                <select
                  name="field"
                  value={formData.field}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Field</option>
                  {fields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Photos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Photo
                  </label>
                  {currentPhotos.universityPhotoUrl && (
                    <div className="mb-3">
                      <img
                        src={currentPhotos.universityPhotoUrl}
                        alt="Current university photo"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current photo
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="universityPhoto"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep current photo
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Photo
                  </label>
                  {currentPhotos.currentPhotoUrl && (
                    <div className="mb-3">
                      <img
                        src={currentPhotos.currentPhotoUrl}
                        alt="Current photo"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current photo
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="currentPhoto"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep current photo
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
