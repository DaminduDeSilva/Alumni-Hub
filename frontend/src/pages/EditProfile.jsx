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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-700 p-6">
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="text-orange-100 mt-2">
              Update your information (limited fields for data integrity)
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Read-Only Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Current Information (Read-Only)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Calling Name:</span>
                    <span className="ml-2">{profileData.calling_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Full Name:</span>
                    <span className="ml-2">{profileData.full_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="ml-2">{profileData.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Field:</span>
                    <span className="ml-2">{profileData.field}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">WhatsApp:</span>
                    <span className="ml-2">{profileData.whatsapp_mobile}</span>
                  </div>
                </div>
              </div>

              {/* Editable Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nick Name
                  </label>
                  <input
                    type="text"
                    name="nickName"
                    value={formData.nickName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional nick name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Current address"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Current workplace"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneMobile"
                    value={formData.phoneMobile}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {/* Current Photos Display */}
              {(profileData.university_photo_url || profileData.current_photo_url) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.university_photo_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current University Photo
                      </label>
                      <div className="border rounded-lg p-4">
                        <img
                          src={profileData.university_photo_url}
                          alt="University"
                          className="w-full max-h-48 object-cover rounded"
                        />
                      </div>
                    </div>
                  )}

                  {profileData.current_photo_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Profile Photo
                      </label>
                      <div className="border rounded-lg p-4">
                        <img
                          src={profileData.current_photo_url}
                          alt="Current"
                          className="w-full max-h-48 object-cover rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Photo Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update University Photo <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      name="universityPhoto"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      id="universityPhoto"
                    />
                    <label htmlFor="universityPhoto" className="cursor-pointer">
                      {files.universityPhoto ? (
                        <div>
                          <p className="text-green-600 font-medium">
                            ✓ {files.universityPhoto.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600">Click to update photo</p>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Current Photo <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      name="currentPhoto"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      id="currentPhoto"
                    />
                    <label htmlFor="currentPhoto" className="cursor-pointer">
                      {files.currentPhoto ? (
                        <div>
                          <p className="text-green-600 font-medium">
                            ✓ {files.currentPhoto.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Click to change</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600">Click to update photo</p>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> For data integrity, email, calling name, and field cannot be changed. 
                  Contact administrators if these need correction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
