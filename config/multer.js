// config/multer.js
// Multer configuration for file upload handling

const multer = require('multer');
const path = require('path');

// Use memory storage since we'll upload to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedMimes.join(', ')}`));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
