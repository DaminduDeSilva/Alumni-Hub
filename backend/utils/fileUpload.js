const multer = require("multer");
const { minioClient } = require("../config/minio");
const path = require("path");
require("dotenv").config();

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
  uploadToMinIO,
  deleteFromMinIO,
};
