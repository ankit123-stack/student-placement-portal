const { v2: cloudinary } = require("cloudinary");

require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    signature_algorithm: "sha1",
    debug: true,
});

console.log("=== CLOUDINARY CONFIG CHECK ===");
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key:", process.env.CLOUDINARY_API_KEY);
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

// Safe diagnostic: generate a test signature.
// NEVER print the API secret.
const testParams = {
    folder: "student-placement-resumes",
    public_id: "diagnostic-test",
    timestamp: Math.floor(Date.now() / 1000),
};

const testSignature =
    cloudinary.utils.api_sign_request(
        testParams,
        process.env.CLOUDINARY_API_SECRET
    );

console.log("Diagnostic signature generated:", Boolean(testSignature));
console.log("Diagnostic signature length:", testSignature.length);
console.log("==============================");

module.exports = cloudinary;