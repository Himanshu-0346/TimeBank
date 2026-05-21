// config/cloudinary.js
// Cloudinary configuration for cloud image storage

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} folder - Cloudinary folder name
 * @param {Object} options - Additional upload options
 * @returns {Promise} - Cloudinary response
 */
const uploadToCloudinary = (fileBuffer, folder = 'timebank', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        quality: 'auto', // Auto-optimize quality
        fetch_format: 'auto', // Auto-format for browser
        ...options
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public ID
 * @param {string} publicId - The public ID of the file in Cloudinary
 * @returns {Promise}
 */
const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
