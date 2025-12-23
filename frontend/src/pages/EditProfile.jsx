import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";

const EditProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    address: "",
    country: "",
    workingPlace: "",
    phoneMobile: "",
    nickName: "",
  });

  const [files, setFiles] = useState({
    universityPhoto: null,
    currentPhoto: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    "Sri Lanka", "India", "USA", "UK", "Canada", "Australia", 
    "Germany", "France", "Japan", "Singapore", "Malaysia", 
    "UAE", "Qatar", "Saudi Arabia", "Bangladesh", "Pakistan", 
    "Nepal", "Maldives", "China", "South Korea"
  ];

  // Redirect if not authenticated or not verified
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    if (!user?.is_verified) {
      navigate("/");
      toast.error("Profile editing is available only for verified users");
      return;
    }

    loadProfile();
  }, [isAuthenticated, user, navigate]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/user");

      if (response.data.success && response.data.batchmateData) {
        const data = response.data.batchmateData;
        setProfileData(data);
        
        // Set editable fields only
        setFormData({
          address: data.address || "",
          country: data.country || "",
          workingPlace: data.working_place || "",
          phoneMobile: data.phone_mobile || "",
          nickName: data.nick_name || "",
        });
      } else {
        toast.error("Profile data not found");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to load profile data");
      console.error("Load profile error:", error);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.country) {
      toast.error("Country is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Add editable fields
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

      const response = await api.put("/user", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully!");
      loadProfile(); // Reload profile data
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to update profile";
      toast.error(errorMsg);
      console.error("Update error:", error);
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
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-headings font-bold text-primary">Edit Profile</h1>
            <p className="text-text-muted text-lg mt-1">
              Update your information (limited fields for data integrity)
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Read-Only Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-secondary uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                  Current Information (Read-Only)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="block font-bold text-gray-700 uppercase mb-1">Calling Name</span>
                    <span className="text-gray-900 font-medium">{profileData.calling_name}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-700 uppercase mb-1">Full Name</span>
                    <span className="text-gray-900 font-medium">{profileData.full_name}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-700 uppercase mb-1">Email</span>
                    <span className="text-gray-900 font-medium">{profileData.email}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-700 uppercase mb-1">Field</span>
                    <span className="text-gray-900 font-medium">{profileData.field}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-700 uppercase mb-1">WhatsApp</span>
                    <span className="text-gray-900 font-medium">{profileData.whatsapp_mobile}</span>
                  </div>
                </div>
              </div>

              {/* Editable Information */}
              <div>
                 <h3 className="text-lg font-bold text-secondary uppercase tracking-wider mb-6 border-b border-gray-200 pb-2">
                  Edit Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nick Name
                    </label>
                    <input
                      type="text"
                      name="nickName"
                      value={formData.nickName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                      placeholder="Optional nick name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow resize-none"
                      placeholder="Current address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Working Place
                    </label>
                    <input
                      type="text"
                      name="workingPlace"
                      value={formData.workingPlace}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                      placeholder="Current workplace"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneMobile"
                      value={formData.phoneMobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-shadow"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Current Photos Display */}
              {(profileData.university_photo_url || profileData.current_photo_url) && (
                <div>
                  <h3 className="text-lg font-bold text-secondary uppercase tracking-wider mb-6 border-b border-gray-200 pb-2">
                    Current Photos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData.university_photo_url && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                          University Photo
                        </label>
                        <div className="border border-gray-200 rounded-lg p-2 shadow-sm">
                          <img
                            src={profileData.university_photo_url}
                            alt="University"
                            className="w-full h-48 object-cover rounded-md"
                          />
                        </div>
                      </div>
                    )}

                    {profileData.current_photo_url && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                          Profile Photo
                        </label>
                        <div className="border border-gray-200 rounded-lg p-2 shadow-sm">
                          <img
                            src={profileData.current_photo_url}
                            alt="Current"
                            className="w-full h-48 object-cover rounded-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Photo Uploads */}
              <div>
                <h3 className="text-lg font-bold text-secondary uppercase tracking-wider mb-6 border-b border-gray-200 pb-2">
                  Update Photos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Update University Photo <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-secondary transition-colors bg-gray-50">
                      <input
                        type="file"
                        name="universityPhoto"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        id="universityPhoto"
                      />
                      <label htmlFor="universityPhoto" className="cursor-pointer flex flex-col items-center">
                         <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        {files.universityPhoto ? (
                          <div>
                            <p className="text-green-600 font-bold">
                              ✓ {files.universityPhoto.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Click to change</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-secondary font-bold underline hover:text-secondary-dark">Click to update photo</p>
                            <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Update Current Photo <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-secondary transition-colors bg-gray-50">
                      <input
                        type="file"
                        name="currentPhoto"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        id="currentPhoto"
                      />
                      <label htmlFor="currentPhoto" className="cursor-pointer flex flex-col items-center">
                         <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        {files.currentPhoto ? (
                          <div>
                            <p className="text-green-600 font-bold">
                              ✓ {files.currentPhoto.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Click to change</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-secondary font-bold underline hover:text-secondary-dark">Click to update photo</p>
                            <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-bold rounded-md hover:bg-gray-50 transition duration-200 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-light transition duration-200 disabled:opacity-50 uppercase tracking-wider shadow-sm"
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>

           {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6 rounded-r-md shadow-sm">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-800 font-medium">
                    <strong>Note:</strong> For data integrity, email, calling name, and field cannot be changed. 
                    Contact administrators if these need correction.
                  </p>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
};

export default EditProfile;
