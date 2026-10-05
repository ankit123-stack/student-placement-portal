# 🎓 Student Placement Portal

A full-stack web application for managing student profiles, job opportunities, placement applications, application status tracking, notifications, and placement analytics.

## 🚀 Live Demo

**Frontend:**
https://student-placement-portal-ankit.vercel.app/

**Backend API:**
https://student-placement-portal-api.onrender.com/

---

## 📌 Project Overview

The **Student Placement Portal** provides separate dashboards for **Students** and **Administrators**.

Students can create and manage their profiles, upload resumes, browse available jobs, apply for positions, track application progress, view application history, and receive notifications.

Administrators can manage students, jobs, applications, resumes, application statuses, and placement analytics from a centralized dashboard.

---

## ✨ Features

### 👨‍🎓 Student Features

* Student registration and login
* Secure JWT-based authentication
* Student dashboard
* Profile management
* Education and skills information
* Resume upload and viewing
* Browse available job opportunities
* Job deadline tracking
* Apply for jobs
* Duplicate application prevention
* View submitted applications
* Application details
* Application status tracking
* Application status history
* Automatic placement status
* Notifications
* Read/unread notification system
* Mark individual notifications as read
* Mark all notifications as read
* Session persistence
* Secure logout

### 👨‍💼 Admin Features

* Secure admin authentication
* Admin dashboard
* Student management
* Student search and filtering
* Student profile details
* Student resume viewing
* Job creation
* Job editing
* Job activation/deactivation
* Job deletion
* Application management
* Application search and filtering
* Application details
* Update application status
* Application status history
* Placement analytics
* Applications by status
* Applications by company
* Selected applications by company
* Placement rate
* Application selection rate
* Selection funnel
* API access protection
* Admin-only route protection
* Security testing

### 🔐 Security

* JWT authentication
* Protected API routes
* Role-based authorization
* Admin-only API access
* Invalid JWT/session handling
* Student access restricted from admin APIs
* Environment variables for sensitive configuration
* `.env` excluded from Git
* Uploaded resumes excluded from Git

---

## 🛠️ Technologies Used

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3
* Responsive UI

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* Multer

### Database

* MongoDB
* MongoDB Atlas
* Mongoose

### Development & Deployment

* Git
* GitHub
* VS Code
* Nodemon
* Vercel
* Render

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │       Student       │
                    │      Browser        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Vercel        │
                    │   React + Vite UI   │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Render        │
                    │ Node.js + Express   │
                    │ JWT Authentication  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    MongoDB Atlas    │
                    │       Database      │
                    └─────────────────────┘
```

---

## 📁 Project Structure

```text
student-placement-portal/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

> **Note:** `.env` and uploaded resume files are excluded from Git using `.gitignore`.

---

## ⚙️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ankit123-stack/student-placement-portal.git
```

### 2. Open the Project

```bash
cd student-placement-portal
```

### 3. Install Backend Dependencies

Open a terminal inside the `backend` folder:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 4. Install Frontend Dependencies

Open another terminal and go to the frontend folder:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

## 🔑 Application Roles

### Student

Students can:

* Manage their profile
* Upload resumes
* Browse available jobs
* Apply for jobs
* Track applications
* View application history
* Receive notifications
* Monitor placement status

### Admin

Administrators can:

* Manage students
* Manage jobs
* Manage applications
* Update application statuses
* View student profiles
* View resumes
* Monitor placement analytics
* Manage the overall placement workflow

---

## 🔄 Application Workflow

```text
Student
   │
   ▼
Create / Update Profile
   │
   ▼
Upload Resume
   │
   ▼
Browse Available Jobs
   │
   ▼
Apply for Job
   │
   ▼
Application Created
   │
   ▼
Admin Reviews Application
   │
   ▼
Application Status Updated
   │
   ├───────────────┐
   ▼               ▼
Shortlisted     Rejected
   │
   ▼
Selected
   │
   ▼
Placement Status Updated
   │
   ▼
Student Receives Notification
```

---

## 📊 Placement Analytics

The admin dashboard provides analytics including:

* Total students
* Total jobs
* Total applications
* Applications by status
* Selected applications
* Shortlisted applications
* Rejected applications
* Placement rate
* Application selection rate
* Applications by company
* Selected applications by company
* Selection funnel
* Student placement summary

---

## 🔒 Authentication & Authorization

The application uses **JWT-based authentication**.

The authentication flow includes:

```text
User Login
    ↓
Credentials Verified
    ↓
JWT Token Generated
    ↓
Token Stored in Client Session
    ↓
Token Sent with Protected API Requests
    ↓
Backend Verifies JWT
    ↓
Role Checked
    ↓
Authorized Request Processed
```

Students and administrators have different access permissions.

Admin-only APIs are protected using role-based authorization.

---

## 🧪 Testing

The application has been tested for:

* Student authentication
* Admin authentication
* Protected routes
* Role-based authorization
* Job creation
* Job editing
* Job activation/deactivation
* Job applications
* Duplicate application prevention
* Application status updates
* Application status history
* Notifications
* Student management
* Resume viewing
* Placement analytics
* Invalid login handling
* Invalid JWT handling
* Backend unavailable handling
* Session persistence
* Logout
* Protected navigation
* Admin API protection

---

## ☁️ Deployment

The project is deployed using:

### Frontend

**Vercel**

```text
https://student-placement-portal-ankit.vercel.app/
```

### Backend

**Render**

```text
https://student-placement-portal-api.onrender.com/
```

### Database

**MongoDB Atlas**

The deployed backend connects to MongoDB Atlas for persistent application data.

---

## 📱 Responsive Design

The application is designed to work across different screen sizes, including:

* Desktop
* Laptop
* Tablet
* Mobile devices

---

## 🔮 Future Improvements

Possible future enhancements include:

* Email notifications
* Advanced admin analytics
* Automated placement reports
* Job recommendation system
* Company accounts
* Interview scheduling
* Offer letter management
* Advanced role and permission management
* Cloud-based resume storage
* Improved production file storage
* Automated deployment pipeline

---

## 👨‍💻 Author

**Ankit Kumar**

GitHub:
https://github.com/ankit123-stack

---

## 📄 License

This project is currently intended as a portfolio and learning project.
