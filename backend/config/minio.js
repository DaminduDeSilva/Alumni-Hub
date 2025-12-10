const Minio = require("minio");
require("dotenv").config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Initialize MinIO bucket
const initializeMinIO = async () => {
  try {
    const bucketName = process.env.MINIO_BUCKET_PHOTOS;

    // Check if bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);

    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`✅ MinIO: Created bucket '${bucketName}'`);
    } else {
      console.log(`✅ MinIO: Bucket '${bucketName}' already exists`);
    }

    // Set bucket policy to allow public read access to photos
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`✅ MinIO: Set public read policy for bucket '${bucketName}'`);

    return true;
  } catch (error) {
    console.error("❌ MinIO initialization failed:", error.message);
    return false;
  }
};

module.exports = { minioClient, initializeMinIO };
