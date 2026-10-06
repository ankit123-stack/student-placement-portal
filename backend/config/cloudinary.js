const { v2: cloudinary } = require("cloudinary");

require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Temporary safe diagnostic logs
console.log("=== CLOUDINARY CONFIG CHECK ===");

console.log(
    "Cloud name:",
    process.env.CLOUDINARY_CLOUD_NAME
);

console.log(
    "API key:",
    process.env.CLOUDINARY_API_KEY
);

console.log(
    "API secret configured:",
    Boolean(process.env.CLOUDINARY_API_SECRET)
);

console.log(
    "API secret length:",
    process.env.CLOUDINARY_API_SECRET
        ? process.env.CLOUDINARY_API_SECRET.length
        : 0
);

console.log("==============================");

module.exports = cloudinary;