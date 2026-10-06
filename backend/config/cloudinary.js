const { v2: cloudinary } = require("cloudinary");

require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    signature_algorithm: "sha1",
});

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

// Test signature generation locally
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

console.log(
    "Diagnostic signature generated:",
    Boolean(testSignature)
);

console.log(
    "Diagnostic signature length:",
    testSignature.length
);

// --------------------------------------------------
// DIRECT CLOUDINARY AUTHENTICATION TEST
// --------------------------------------------------

cloudinary.api.ping()
    .then((result) => {
        console.log("=== CLOUDINARY AUTH TEST ===");
        console.log("Cloudinary authentication: SUCCESS");
        console.log("Ping status:", result.status);
        console.log("============================");
    })
    .catch((error) => {
        console.error("=== CLOUDINARY AUTH TEST ===");
        console.error("Cloudinary authentication: FAILED");
        console.error("HTTP code:", error.http_code);
        console.error("Message:", error.message);
        console.error("============================");
    });

console.log("==============================");

module.exports = cloudinary;