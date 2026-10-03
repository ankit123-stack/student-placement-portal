const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");


// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================
dotenv.config();


// ==========================================
// CREATE EXPRESS APP
// ==========================================
const app = express();


// ==========================================
// CONNECT MONGODB
// ==========================================
connectDB();


// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================
app.use(cors());

app.use(express.json());


// ==========================================
// SERVE UPLOADED FILES
// ==========================================
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
app.use(
    "/api/auth",
    authRoutes
);


// ==========================================
// PROTECTED ROUTES
// ==========================================
app.use(
    "/api",
    protectedRoutes
);


// ==========================================
// STUDENT PROFILE ROUTES
// ==========================================
app.use(
    "/api/student",
    studentProfileRoutes
);


// ==========================================
// JOB ROUTES
// ==========================================
app.use(
    "/api/jobs",
    jobRoutes
);


// ==========================================
// APPLICATION ROUTES
// ==========================================
app.use(
    "/api/applications",
    applicationRoutes
);


// ==========================================
// ADMIN ROUTES
// ==========================================
app.use(
    "/api/admin",
    adminRoutes
);


// ==========================================
// NOTIFICATION ROUTES
// ==========================================
app.use(
    "/api/notifications",
    notificationRoutes
);


// ==========================================
// HOME ROUTE
// ==========================================
app.get("/", (req, res) => {
    res.status(200).send(
        "Student Placement Portal API is running"
    );
});


// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});

