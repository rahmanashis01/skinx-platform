const multer = require("multer");

// Configure memory storage (files stored in buffer, not disk)
const storage = multer.memoryStorage();

// File filter to validate image types
const fileFilter = (req, file, cb) => {
  // Accepted MIME types for images
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  // Check if file type is allowed
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file with error message
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`,
      ),
      false,
    );
  }
};

// Configure multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
    files: 3, // Maximum 3 files per request
  },
  fileFilter: fileFilter,
});

// Export upload middleware for use in routes
module.exports = upload;
