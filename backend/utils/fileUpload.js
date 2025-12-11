const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Import storage services
const { minioClient } = require("../config/minio");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
    }
  },
});

// Production-ready upload function that chooses storage based on environment
const uploadFile = async (file, folder = "photos") => {
  if (process.env.NODE_ENV === "production") {
    // Use Cloudinary in production
    return await uploadToCloudinaryFile(file, folder);
  } else {
    // Use MinIO in development
    return await uploadToMinIO(file, folder);
  }
};

// Cloudinary upload function
const uploadToCloudinaryFile = async (file, folder = "photos") => {
  try {
    const cloudinary = require("cloudinary").v2;

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `alumni-hub/${folder}`,
            resource_type: "auto",
            transformation: [
              { width: 500, height: 500, crop: "fill" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              resolve({
                success: false,
                error: error.message,
              });
            } else {
              resolve({
                success: true,
                url: result.secure_url,
                public_id: result.public_id,
                fileName: result.public_id,
              });
            }
          }
        )
        .end(file.buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Upload file to MinIO
const uploadToMinIO = async (file, folder = "photos") => {
  try {
    const bucketName = process.env.MINIO_BUCKET_PHOTOS;
    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}${path.extname(file.originalname)}`;

    await minioClient.putObject(bucketName, fileName, file.buffer, file.size, {
      "Content-Type": file.mimetype,
    });

    // Generate public URL (adjust based on your MinIO setup)
    const publicUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;

    return {
      success: true,
      url: publicUrl,
      fileName: fileName,
    };
  } catch (error) {
    console.error("MinIO upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete file from MinIO
const deleteFromMinIO = async (fileName) => {
  try {
    const bucketName = process.env.MINIO_BUCKET_PHOTOS;
    await minioClient.removeObject(bucketName, fileName);
    return { success: true };
  } catch (error) {
    console.error("MinIO delete error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  upload,
  uploadFile, // New unified upload function
  uploadToMinIO,
  uploadToCloudinaryFile,
  deleteFromMinIO,
};
