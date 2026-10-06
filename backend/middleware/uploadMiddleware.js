const multer = require("multer");

// Store uploaded files temporarily in memory.
// The file will then be uploaded to Cloudinary.
const storage = multer.memoryStorage();

// Allow only PDF files
const fileFilter = function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = upload;