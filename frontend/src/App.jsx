import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://student-placement-portal-api.onrender.com";

// =============================================================
// DEFAULT DATA
// =============================================================

const emptyProfile = {
  phone: "",
  college: "",
  course: "",
  branch: "",
  graduationYear: "",
  cgpa: "",
  skills: "",
  resume: "",
  placementStatus: "Not Placed",
};

const emptyJob = {
  company: "",
  title: "",
  description: "",
  location: "",
  salary: "",
  applicationDeadline: "",
};

// =============================================================
// AUTH TOKEN HELPER
// =============================================================

function getStoredToken() {
  return localStorage.getItem("token") || "";
}

// =============================================================
// API REQUEST
// =============================================================

async function apiRequest(url, options = {}) {
  const storedToken = getStoredToken();

  const headers = new Headers(options.headers || {});

  if (
    storedToken &&
    !headers.has("Authorization")
  ) {
    headers.set(
      "Authorization",
      `Bearer ${storedToken}`
    );
  }

  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE}${url}`,
      {
        ...options,
        headers,
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the deployed backend server. Please check your internet connection and try again."
    );
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let data;

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch {
    data = "";
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
        data?.error ||
        "Something went wrong";

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// =============================================================
// HELPERS
// =============================================================

function formatDate(date) {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Not specified";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatDateTime(date) {
  if (!date) {
    return "Not specified";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Not specified";
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function isDeadlinePassed(date) {
  if (!date) {
    return false;
  }

  const deadline = new Date(date);

  if (
    Number.isNaN(
      deadline.getTime()
    )
  ) {
    return false;
  }

  deadline.setHours(
    23,
    59,
    59,
    999
  );

  return new Date() > deadline;
}

// =============================================================
// APPLICATION ID VALIDATION
// =============================================================

function isValidMongoId(id) {
  if (!id) {
    return false;
  }

  return /^[a-fA-F0-9]{24}$/.test(
    String(id)
  );
}

// =============================================================
// STATUS BADGE
// =============================================================

function StatusBadge({ status }) {
  const normalized = String(
    status || "Pending"
  ).toLowerCase();

  let className =
    "badge pending";

  if (
    normalized === "shortlisted"
  ) {
    className =
      "badge shortlisted";
  }

  if (
    normalized === "selected"
  ) {
    className =
      "badge selected";
  }

  if (
    normalized === "rejected"
  ) {
    className =
      "badge rejected";
  }

  if (
    normalized === "applied"
  ) {
    className =
      "badge applied";
  }

  if (
    normalized === "open"
  ) {
    className = "badge open";
  }

  if (
    normalized === "closed"
  ) {
    className = "badge closed";
  }

  if (
    normalized === "placed"
  ) {
    className =
      "badge selected";
  }

  if (
    normalized === "not placed"
  ) {
    className =
      "badge pending";
  }

  if (
    normalized ===
    "looking for opportunity"
  ) {
    className =
      "badge shortlisted";
  }

  return (
    <span className={className}>
      {status || "Pending"}
    </span>
  );
}

// =============================================================
// BUTTON
// =============================================================

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variant}`}
    >
      {children}
    </button>
  );
}

// =============================================================
// CARD
// =============================================================

function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={`card ${className}`}
    >
      {children}
    </div>
  );
}

// =============================================================
// FIELD
// =============================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  options,
}) {
  return (
    <div className="field">
      <label>{label}</label>

      {options ? (
        <select
          value={value}
          onChange={onChange}
          required={required}
        >
          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}

// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

// =============================================================
// SECTION TITLE
// =============================================================

function SectionTitle({
  title,
  description,
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>

        {description && (
          <p>{description}</p>
        )}
      </div>
    </div>
  );
}

// =============================================================
// ANALYTICS BAR
// =============================================================

function AnalyticsBar({
  label,
  count,
  total,
  type,
}) {
  const percentage =
    total > 0
      ? Math.round(
        (count / total) * 100
      )
      : 0;

  return (
    <div className="analytics-bar-item">
      <div className="analytics-bar-header">
        <div className="analytics-label">
          <span
            className={`analytics-dot ${type}`}
          ></span>

          <strong>{label}</strong>
        </div>

        <span>
          {count}{" "}
          <small>
            ({percentage}%)
          </small>
        </span>
      </div>

      <div className="analytics-track">
        <div
          className={`analytics-progress ${type}`}
          style={{
            width: `${percentage}%`,
          }}
        ></div>
      </div>
    </div>
  );
}

// =============================================================
// APPLICATION STATUS HISTORY
// =============================================================

function ApplicationHistory({
  history = [],
}) {
  if (!history.length) {
    return (
      <div className="history-empty">
        No status history available.
      </div>
    );
  }

  return (
    <div className="status-history">
      {history.map(
        (item, index) => {
          const status =
            item?.status ||
            "Applied";

          const normalized =
            String(status)
              .toLowerCase();

          const isLast =
            index ===
            history.length - 1;

          return (
            <div
              className="history-item"
              key={
                item?._id ||
                `${status}-${item?.changedAt || index}`
              }
            >
              <div className="history-line-area">
                <div
                  className={`history-dot ${normalized}`}
                >
                  {isLast
                    ? "✓"
                    : ""}
                </div>

                {!isLast && (
                  <div className="history-line"></div>
                )}
              </div>

              <div className="history-content">
                <div className="history-main">
                  <div>
                    <strong>
                      {status}
                    </strong>

                    <small>
                      {formatDateTime(
                        item?.changedAt
                      )}
                    </small>
                  </div>

                  <StatusBadge
                    status={status}
                  />
                </div>

                {item?.changedBy && (
                  <p>
                    Changed by:{" "}
                    {item.changedBy.name ||
                      item.changedBy.email ||
                      "Administrator"}
                  </p>
                )}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}

// =============================================================
// APP
// =============================================================

function App() {
  // ===========================================================
  // AUTH STATE
  // ===========================================================

  const [user, setUser] =
    useState(() => {
      const savedUser =
        localStorage.getItem(
          "user"
        );

      try {
        return savedUser
          ? JSON.parse(
            savedUser
          )
          : null;
      } catch {
        return null;
      }
    });

  const [token, setToken] =
    useState(
      () =>
        localStorage.getItem(
          "token"
        ) || ""
    );

  const [authMode, setAuthMode] =
    useState("login");

  const [authForm, setAuthForm] =
    useState({
      name: "",
      email: "",
      password: "",
      role: "student",
    });

  const [authMessage, setAuthMessage] =
    useState("");

  // ===========================================================
  // STUDENT STATE
  // ===========================================================

  const [profile, setProfile] =
    useState(emptyProfile);

  const [jobs, setJobs] =
    useState([]);

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [jobSearch, setJobSearch] =
    useState("");

  const [jobLoading, setJobLoading] =
    useState(false);

  const [resumeFile, setResumeFile] =
    useState(null);

  const [
    resumeMessage,
    setResumeMessage,
  ] = useState("");

  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");

  const [
    securityMessage,
    setSecurityMessage,
  ] = useState("");

  // ===========================================================
  // ADMIN STATE
  // ===========================================================

  const [
    adminDashboard,
    setAdminDashboard,
  ] = useState(null);

  const [
    adminApplications,
    setAdminApplications,
  ] = useState([]);

  const [students, setStudents] =
    useState([]);

  const [jobForm, setJobForm] =
    useState(emptyJob);

  const [
    editingJobId,
    setEditingJobId,
  ] = useState(null);

  const [jobMessage, setJobMessage] =
    useState("");

  const [
    studentSearch,
    setStudentSearch,
  ] = useState("");

  // ===========================================================
  // APPLICATION FILTERS
  // ===========================================================

  const [studentStatusFilter, setStudentStatusFilter] = useState("All");
  const [studentCourseFilter, setStudentCourseFilter] = useState("All");

  const [applicationSearch, setApplicationSearch] = useState("");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("All");
  const [applicationCompanyFilter, setApplicationCompanyFilter] = useState("All");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProfileModal, setStudentProfileModal] = useState(false);

  // ===========================================================
  // APPLICATION DETAILS STATE
  // ===========================================================

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState(null);

  const [
    applicationDetailsLoading,
    setApplicationDetailsLoading,
  ] = useState(false);

  const [
    applicationDetailsError,
    setApplicationDetailsError,
  ] = useState("");

  // ===========================================================
  // COMMON STATE
  // ===========================================================

  const [loading, setLoading] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  // ===========================================================
  // NOTIFICATION STATE
  // ===========================================================

  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // ===========================================================
  // GET AUTH HEADERS
  // ===========================================================

  const getAuthHeaders = () => {
    const currentToken =
      localStorage.getItem(
        "token"
      ) ||
      token ||
      "";

    if (!currentToken) {
      return {};
    }

    return {
      Authorization: `Bearer ${currentToken}`,
    };
  };

  // ===========================================================
  // NOTIFICATIONS
  // ===========================================================

  const loadNotifications = async (showLoading = false) => {
    if (!user || user.role !== "student") {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    try {
      if (showLoading) setNotificationLoading(true);

      const data = await apiRequest("/api/notifications", {
        headers: getAuthHeaders(),
      });

      const receivedNotifications = Array.isArray(data)
        ? data
        : data?.notifications || [];

      // Ignore legacy notifications created for the initial Applied status.
      // New backend code should not create these notifications.
      const visibleNotifications = receivedNotifications.filter(
        (notification) => {
          const type = String(notification?.type || "").toLowerCase();
          const message = String(notification?.message || "").toLowerCase();

          return !(
            type === "application" &&
            message.includes("changed to applied")
          );
        }
      );

      setNotifications(visibleNotifications);

      const unreadFromList = visibleNotifications.filter(
        (notification) => !notification?.isRead
      ).length;

      setUnreadNotificationCount(unreadFromList);

      try {
        const unreadData = await apiRequest(
          "/api/notifications/unread-count",
          { headers: getAuthHeaders() }
        );
        // Use the filtered list so legacy Applied notifications do not
        // reappear in the unread badge.
        setUnreadNotificationCount(unreadFromList);
      } catch (countError) {
        if (!handleProtectedError(countError)) {
          setUnreadNotificationCount(unreadFromList);
        }
      }
    } catch (error) {
      if (!handleProtectedError(error)) {
        console.error("Notification loading:", error?.message);
      }
    } finally {
      if (showLoading) setNotificationLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!notificationId) return;

    try {
      const notification = notifications.find(
        (item) => String(item?._id) === String(notificationId)
      );

      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      setNotifications((previous) =>
        previous.map((item) =>
          String(item?._id) === String(notificationId)
            ? { ...item, isRead: true }
            : item
        )
      );

      if (notification && !notification.isRead) {
        setUnreadNotificationCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (error) {
      if (!handleProtectedError(error)) {
        setErrorMessage(
          error?.message || "Unable to update notification."
        );
      }
    }
  };

  // Open the application connected to a notification.
  const handleNotificationClick = async (notification) => {
    if (!notification?._id) return;

    try {
      if (!notification?.isRead) {
        await markNotificationAsRead(notification._id);
      }

      setNotificationOpen(false);
      setApplicationDetailsError("");

      const relatedApplication =
        notification?.application &&
          typeof notification.application === "object"
          ? notification.application
          : null;

      const applicationId =
        relatedApplication?._id ||
        notification?.application;

      if (!isValidMongoId(applicationId)) {
        setApplicationDetailsError(
          "The application linked to this notification could not be found."
        );
        return;
      }

      if (user?.role === "student") {
        let application = Array.isArray(applications)
          ? applications.find(
            (item) =>
              String(item?._id) === String(applicationId)
          )
          : null;

        if (!application) {
          const data = await apiRequest(
            "/api/applications/my",
            { headers: getAuthHeaders() }
          );

          const studentApplications = Array.isArray(data)
            ? data
            : Array.isArray(data?.applications)
              ? data.applications
              : [];

          setApplications(studentApplications);

          application = studentApplications.find(
            (item) =>
              String(item?._id) === String(applicationId)
          );
        }

        if (!application) {
          setApplicationDetailsError(
            "The application linked to this notification could not be found."
          );
          return;
        }

        const studentUser =
          application?.student &&
            typeof application.student === "object"
            ? application.student
            : {};

        setSelectedApplication({
          ...application,
          student: {
            ...studentUser,
            ...(profile || {}),
            name:
              studentUser?.name ||
              application?.studentName ||
              user?.name ||
              "",
            email:
              studentUser?.email ||
              application?.email ||
              user?.email ||
              "",
          },
          studentProfile: {
            ...(application?.studentProfile || {}),
            ...(profile || {}),
          },
        });
        return;
      }

      await loadApplicationDetails(applicationId);
    } catch (error) {
      console.error("Notification click error:", error);

      if (!handleProtectedError(error)) {
        setApplicationDetailsError(
          error?.message ||
          "Unable to open application details."
        );
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!unreadNotificationCount) return;

    try {
      await apiRequest("/api/notifications/read-all", {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadNotificationCount(0);
    } catch (error) {
      if (!handleProtectedError(error)) {
        setErrorMessage(
          error?.message || "Unable to mark notifications as read."
        );
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (String(type || "general").toLowerCase()) {
      case "shortlisted": return "🔎";
      case "selected": return "🏆";
      case "rejected": return "❌";
      case "application": return "📄";
      default: return "🔔";
    }
  };

  const getNotificationTime = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    const diff = Math.max(0, Date.now() - parsedDate.getTime());
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  // ===========================================================
  // NAVIGATION
  // ===========================================================

  const scrollToSection = (
    id
  ) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // ===========================================================
  // LOGOUT
  // ===========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "token"
    );

    setUser(null);
    setToken("");

    setProfile(emptyProfile);
    setJobs([]);
    setApplications([]);

    setAdminDashboard(null);
    setAdminApplications([]);
    setStudents([]);

    setResumeFile(null);

    setSelectedApplication(null);
    setApplicationDetailsError("");

    setNotifications([]);
    setUnreadNotificationCount(0);
    setNotificationOpen(false);

    setErrorMessage("");
    setAuthMessage("");
    setProfileMessage("");
    setResumeMessage("");
    setSecurityMessage("");
  };

  // ===========================================================
  // AUTH ERROR HANDLER
  // ===========================================================

  const handleProtectedError = (
    error
  ) => {
    const message = String(
      error?.message || ""
    ).toLowerCase();

    const isAuthError =
      error?.status === 401 ||
      message.includes(
        "no token provided"
      ) ||
      message.includes(
        "token expired"
      ) ||
      message.includes(
        "invalid token"
      ) ||
      message.includes(
        "jwt expired"
      );

    if (isAuthError) {
      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "token"
      );

      setUser(null);
      setToken("");

      setErrorMessage(
        "Your login session has expired. Please login again."
      );

      return true;
    }

    return false;
  };

  // ===========================================================
  // AUTH
  // ===========================================================

  const handleAuthSubmit =
    async (event) => {
      event.preventDefault();

      setLoading(true);
      setAuthMessage("");
      setErrorMessage("");

      try {
        const endpoint =
          authMode === "login"
            ? "/api/auth/login"
            : "/api/auth/register";

        const body =
          authMode === "login"
            ? {
              email:
                authForm.email,
              password:
                authForm.password,
            }
            : authForm;

        const data =
          await apiRequest(
            endpoint,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                body
              ),
            }
          );

        if (
          authMode === "login"
        ) {
          const loggedInUser =
            data?.user ||
            data;

          const receivedToken =
            data?.token ||
            data?.accessToken ||
            data?.jwt ||
            loggedInUser?.token ||
            "";

          if (!receivedToken) {
            throw new Error(
              "Login succeeded, but the server did not return an authentication token."
            );
          }

          localStorage.setItem(
            "user",
            JSON.stringify(
              loggedInUser
            )
          );

          localStorage.setItem(
            "token",
            receivedToken
          );

          setUser(loggedInUser);
          setToken(receivedToken);

          setAuthMessage(
            "Login successful."
          );
        } else {
          setAuthMode("login");

          setAuthMessage(
            "Registration successful. Please login."
          );

          setAuthForm({
            name: "",
            email:
              authForm.email,
            password: "",
            role: "student",
          });
        }
      } catch (error) {
        setAuthMessage(
          error?.message ||
          "Authentication failed."
        );
      } finally {
        setLoading(false);
      }
    };

  // ===========================================================
  // LOAD JOBS
  // ===========================================================

  const loadJobs = async () => {
    try {
      setJobLoading(true);

      const data =
        await apiRequest(
          "/api/jobs"
        );

      const receivedJobs =
        Array.isArray(data)
          ? data
          : data?.jobs || [];

      setJobs(receivedJobs);
    } catch (error) {
      if (
        !handleProtectedError(
          error
        )
      ) {
        setErrorMessage(
          error?.message ||
          "Unable to load jobs."
        );
      }
    } finally {
      setJobLoading(false);
    }
  };

  // ===========================================================
  // LOAD STUDENT PROFILE
  // ===========================================================

  const loadProfile =
    async () => {
      try {
        const data =
          await apiRequest(
            "/api/student/profile",
            {
              headers:
                getAuthHeaders(),
            }
          );

        setProfile({
          ...emptyProfile,
          ...(data?.profile ||
            data),
        });
      } catch (error) {
        console.log(
          "Profile loading:",
          error?.message
        );

        handleProtectedError(
          error
        );
      }
    };

  // ===========================================================
  // SAVE STUDENT PROFILE
  // ===========================================================

  const saveProfile =
    async (event) => {
      event.preventDefault();

      setProfileMessage("");

      try {
        await apiRequest(
          "/api/student/profile",
          {
            method: "POST",
            headers: {
              ...getAuthHeaders(),
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              profile
            ),
          }
        );

        setProfileMessage(
          "Profile updated successfully."
        );

        await loadProfile();
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          setProfileMessage(
            error?.message ||
            "Unable to update profile."
          );
        }
      }
    };

  // ===========================================================
  // RESUME UPLOAD
  // ===========================================================

  const uploadResume =
    async () => {
      if (!resumeFile) {
        setResumeMessage(
          "Please select a PDF file first."
        );

        return;
      }

      if (
        resumeFile.type !==
        "application/pdf"
      ) {
        setResumeMessage(
          "Only PDF files are allowed."
        );

        return;
      }

      if (
        resumeFile.size >
        5 * 1024 * 1024
      ) {
        setResumeMessage(
          "Resume must be less than 5 MB."
        );

        return;
      }

      const formData =
        new FormData();

      formData.append(
        "resume",
        resumeFile
      );

      try {
        setResumeMessage(
          "Uploading resume..."
        );

        const data =
          await apiRequest(
            "/api/student/resume",
            {
              method: "POST",
              headers:
                getAuthHeaders(),
              body: formData,
            }
          );

        const resumePath =
          data?.resume ||
          data?.resumeUrl ||
          data?.file ||
          data?.url ||
          "";

        setProfile(
          (previous) => ({
            ...previous,
            resume: resumePath,
          })
        );

        setResumeFile(null);

        setResumeMessage(
          "Resume uploaded successfully."
        );

        await loadProfile();
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          setResumeMessage(
            error?.message ||
            "Resume upload failed."
          );
        }
      }
    };

  // ===========================================================
  // LOAD MY APPLICATIONS
  // ===========================================================

  const loadMyApplications =
    async () => {
      try {
        const data =
          await apiRequest(
            "/api/applications/my",
            {
              headers:
                getAuthHeaders(),
            }
          );

        const receivedApplications =
          Array.isArray(data)
            ? data
            : data?.applications ||
            [];

        setApplications(
          receivedApplications
        );
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          setErrorMessage(
            error?.message ||
            "Unable to load applications."
          );
        }
      }
    };

  // ===========================================================
  // CHECK ALREADY APPLIED
  // ===========================================================

  const hasApplied = (
    jobId
  ) => {
    return applications.some(
      (application) => {
        const applicationJob =
          application?.job;

        let appliedJobId = "";

        if (
          typeof applicationJob ===
          "string"
        ) {
          appliedJobId =
            applicationJob;
        } else if (
          applicationJob &&
          typeof applicationJob ===
          "object"
        ) {
          appliedJobId =
            applicationJob._id ||
            applicationJob.id ||
            "";
        }

        if (!appliedJobId) {
          appliedJobId =
            application?.jobId ||
            application?.job_id ||
            "";
        }

        return (
          String(appliedJobId) ===
          String(jobId)
        );
      }
    );
  };

  // ===========================================================
  // APPLY FOR JOB
  // ===========================================================

  const applyForJob =
    async (job) => {
      if (!job?._id) {
        alert("Invalid job.");
        return;
      }

      if (
        !isValidMongoId(
          job._id
        )
      ) {
        alert(
          "Invalid job ID. Please contact the administrator."
        );

        return;
      }

      if (
        hasApplied(job._id)
      ) {
        alert(
          "You have already applied for this job."
        );

        return;
      }

      const jobStatus =
        String(
          job.status || "Open"
        ).toLowerCase();

      if (
        jobStatus === "closed"
      ) {
        alert(
          "Applications for this job are closed."
        );

        return;
      }

      if (
        job.applicationDeadline &&
        isDeadlinePassed(
          job.applicationDeadline
        )
      ) {
        alert(
          "The application deadline for this job has passed."
        );

        return;
      }

      try {
        await apiRequest(
          `/api/applications/${job._id}`,
          {
            method: "POST",
            headers:
              getAuthHeaders(),
          }
        );

        alert(
          "Application submitted successfully."
        );

        await loadMyApplications();
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          const message =
            String(
              error?.message || ""
            ).toLowerCase();

          if (
            message.includes(
              "already applied"
            )
          ) {
            alert(
              "You have already applied for this job."
            );
          } else if (
            message.includes(
              "invalid application"
            ) ||
            message.includes(
              "invalid job"
            ) ||
            message.includes(
              "invalid id"
            )
          ) {
            alert(
              "The application could not be submitted because the job ID is invalid."
            );
          } else {
            alert(
              error?.message ||
              "Unable to apply for this job."
            );
          }
        }
      }
    };

  // ===========================================================
  // ADMIN DASHBOARD
  // ===========================================================

  const loadAdminDashboard =
    async () => {
      try {
        const data =
          await apiRequest(
            "/api/admin/dashboard",
            {
              headers:
                getAuthHeaders(),
            }
          );

        setAdminDashboard(
          data?.stats || {}
        );
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          setErrorMessage(
            error?.message ||
            "Unable to load admin dashboard."
          );
        }
      }
    };

  // ===========================================================
  // ADMIN APPLICATIONS
  // ===========================================================

  const loadAdminApplications =
    async () => {
      try {
        const data =
          await apiRequest(
            "/api/admin/applications",
            {
              headers:
                getAuthHeaders(),
            }
          );

        const receivedApplications =
          Array.isArray(data)
            ? data
            : data?.applications ||
            [];

        setAdminApplications(
          receivedApplications
        );
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          setErrorMessage(
            error?.message ||
            "Unable to load admin applications."
          );
        }
      }
    };

  // ===========================================================
  // LOAD APPLICATION DETAILS
  // ===========================================================

  const loadApplicationDetails =
    async (
      applicationId
    ) => {
      if (!isValidMongoId(applicationId)) {
        setApplicationDetailsError(
          "Invalid application ID. Please refresh the applications list and try again."
        );
        return null;
      }

      setApplicationDetailsLoading(true);
      setApplicationDetailsError("");

      try {
        // STUDENT: use /api/applications/my because
        // /api/applications/:id is admin-only.
        if (user?.role === "student") {
          let studentApplications = Array.isArray(applications)
            ? applications
            : [];

          let application = studentApplications.find(
            (item) => String(item?._id) === String(applicationId)
          );

          // Refresh the student's applications if the application is
          // not already present in state.
          if (!application) {
            const data = await apiRequest(
              "/api/applications/my",
              { headers: getAuthHeaders() }
            );

            studentApplications = Array.isArray(data)
              ? data
              : Array.isArray(data?.applications)
                ? data.applications
                : [];

            setApplications(studentApplications);

            application = studentApplications.find(
              (item) => String(item?._id) === String(applicationId)
            );
          }

          if (!application) {
            throw new Error("Application not found.");
          }

          // Student applications contain the User record, while the
          // education fields live in StudentProfile. Merge both so the
          // details modal always has a complete student object.
          const studentUser =
            application?.student &&
              typeof application.student === "object"
              ? application.student
              : {};

          const mergedStudent = {
            ...studentUser,
            ...(profile || {}),
            name:
              studentUser?.name ||
              application?.studentName ||
              user?.name ||
              "",
            email:
              studentUser?.email ||
              application?.email ||
              user?.email ||
              "",
          };

          const completeApplication = {
            ...application,
            student: mergedStudent,
            studentProfile: {
              ...(application?.studentProfile || {}),
              ...(profile || {}),
            },
          };

          setSelectedApplication(completeApplication);
          return completeApplication;
        }

        // ADMIN: use the applications already loaded from
        // GET /api/admin/applications.
        // The backend does not provide GET /api/admin/applications/:id.
        let application = Array.isArray(adminApplications)
          ? adminApplications.find(
            (item) =>
              String(item?._id) === String(applicationId)
          )
          : null;

        // If it is not currently in state, refresh the admin
        // applications list and search again.
        if (!application) {
          const data = await apiRequest(
            "/api/admin/applications",
            {
              headers: getAuthHeaders(),
            }
          );

          const refreshedApplications =
            Array.isArray(data)
              ? data
              : data?.applications || [];

          setAdminApplications(
            refreshedApplications
          );

          application = refreshedApplications.find(
            (item) =>
              String(item?._id) === String(applicationId)
          );
        }

        if (!application) {
          throw new Error(
            "Application details were not found."
          );
        }

        // Admin application list already contains the
        // application information. Merge the matching
        // student record when available.
        const studentUser =
          application?.student &&
            typeof application.student === "object"
            ? application.student
            : {};

        const matchingStudent =
          Array.isArray(students)
            ? students.find((student) =>
              (studentUser?._id &&
                String(student?._id) ===
                String(studentUser._id)) ||
              (studentUser?.email &&
                String(student?.email).toLowerCase() ===
                String(studentUser.email).toLowerCase()) ||
              (application?.studentId &&
                String(student?._id) ===
                String(application.studentId))
            )
            : null;

        const completeApplication = {
          ...application,
          student: {
            ...studentUser,
            ...(application?.studentProfile || {}),
            ...(matchingStudent || {}),
            name:
              studentUser?.name ||
              application?.studentName ||
              matchingStudent?.name ||
              "",
            email:
              studentUser?.email ||
              application?.email ||
              matchingStudent?.email ||
              "",
          },
        };

        setSelectedApplication(
          completeApplication
        );

        return completeApplication;
      } catch (error) {
        console.error(
          "Load application details error:",
          error
        );

        if (!handleProtectedError(error)) {
          setApplicationDetailsError(
            error?.message ||
            "Unable to load application details."
          );
        }

        return null;
      } finally {
        setApplicationDetailsLoading(false);
      }
    };

  // ===========================================================
  // OPEN APPLICATION DETAILS
  // ===========================================================

  const openApplicationDetails =
    (applicationId) => {
      if (
        !isValidMongoId(
          applicationId
        )
      ) {
        alert(
          "Invalid application ID. Cannot view application details."
        );

        return;
      }

      setSelectedApplication(
        null
      );

      setApplicationDetailsError(
        ""
      );

      loadApplicationDetails(
        applicationId
      );
    };

  // ===========================================================
  // CLOSE APPLICATION DETAILS
  // ===========================================================

  const closeApplicationDetails =
    () => {
      setSelectedApplication(
        null
      );

      setApplicationDetailsError(
        ""
      );
    };

  // ===========================================================
  // ADMIN STUDENTS
  // ===========================================================

  const loadStudents =
    async () => {
      try {
        const data =
          await apiRequest(
            "/api/admin/students",
            {
              headers:
                getAuthHeaders(),
            }
          );

        const receivedStudents =
          Array.isArray(data)
            ? data
            : data?.students || [];

        setStudents(
          receivedStudents
        );
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          setSecurityMessage(
            `Admin protection working: ${error?.message ||
            "Access denied"
            }`
          );
        }
      }
    };

  // ===========================================================
  // SECURITY TEST
  // ===========================================================

  const testStudentSecurity =
    async () => {
      try {
        await apiRequest(
          "/api/admin/students",
          {
            headers:
              getAuthHeaders(),
          }
        );

        setSecurityMessage(
          "Security test completed. Admin endpoint is accessible."
        );
      } catch (error) {
        if (
          error?.status === 403 ||
          error?.status === 401
        ) {
          setSecurityMessage(
            `Admin protection working: ${error?.message ||
            "Access denied"
            }`
          );
        } else {
          setSecurityMessage(
            error?.message ||
            "Security test failed."
          );
        }
      }
    };

  // ===========================================================
  // STUDENT PROFILE MODAL
  // ===========================================================

  const openStudentProfile = (student) => {
    setSelectedStudent(student);
    setStudentProfileModal(true);
  };

  const closeStudentProfile = () => {
    setSelectedStudent(null);
    setStudentProfileModal(false);
  };

  const getResumeUrl = (resume) => {
    if (!resume) return "";
    const value = String(resume);
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${API_BASE}${value.startsWith("/") ? value : `/${value}`}`;
  };

  // ===========================================================
  // CREATE / UPDATE JOB
  // ===========================================================

  const handleJobSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setJobMessage("");

        const requiredFields = {
          company: jobForm.company,
          title: jobForm.title,
          location: jobForm.location,
          salary: jobForm.salary,
          applicationDeadline: jobForm.applicationDeadline,
          description: jobForm.description,
        };

        const hasMissingField = Object.values(requiredFields).some(
          (value) => !String(value || "").trim()
        );

        if (hasMissingField) {
          setJobMessage("Please fill in all required fields.");
          return;
        }

        if (editingJobId) {
          if (
            !isValidMongoId(
              editingJobId
            )
          ) {
            setJobMessage(
              "Invalid job ID. Cannot update this job."
            );

            return;
          }

          await apiRequest(
            `/api/jobs/${editingJobId}`,
            {
              method: "PUT",
              headers: {
                ...getAuthHeaders(),
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                jobForm
              ),
            }
          );

          setJobMessage(
            "Job updated successfully."
          );
        } else {
          await apiRequest(
            "/api/jobs",
            {
              method: "POST",
              headers: {
                ...getAuthHeaders(),
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                jobForm
              ),
            }
          );

          setJobMessage(
            "Job created successfully."
          );
        }

        setJobForm({
          ...emptyJob,
        });

        setEditingJobId(null);

        await loadJobs();
        await loadAdminDashboard();
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          setJobMessage(
            error?.message ||
            "Unable to save job."
          );
        }
      }
    };

  // ===========================================================
  // EDIT JOB
  // ===========================================================

  const startEditJob = (
    job
  ) => {
    if (!job?._id) {
      alert("Invalid job ID.");
      return;
    }

    if (
      !isValidMongoId(job._id)
    ) {
      alert(
        "Invalid job ID. Cannot edit this job."
      );

      return;
    }

    setEditingJobId(
      job._id
    );

    setJobForm({
      company:
        job.company || "",

      title:
        job.title ||
        job.jobTitle ||
        "",

      description:
        job.description || "",

      location:
        job.location || "",

      salary:
        job.salary || "",

      applicationDeadline:
        job.applicationDeadline
          ? new Date(
            job.applicationDeadline
          )
            .toISOString()
            .split("T")[0]
          : "",
    });

    scrollToSection(
      "job-form"
    );
  };

  // ===========================================================
  // DELETE JOB
  // ===========================================================

  const deleteJob =
    async (jobId) => {
      if (
        !isValidMongoId(jobId)
      ) {
        alert(
          "Invalid job ID. Cannot delete this job."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this job?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await apiRequest(
          `/api/jobs/${jobId}`,
          {
            method: "DELETE",
            headers:
              getAuthHeaders(),
          }
        );

        await loadJobs();
        await loadAdminDashboard();
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          alert(
            error?.message ||
            "Unable to delete job."
          );
        }
      }
    };

  // ===========================================================
  // TOGGLE JOB STATUS
  // ===========================================================

  const toggleJobStatus =
    async (job) => {
      if (!job?._id) {
        alert("Invalid job.");
        return;
      }

      if (
        !isValidMongoId(job._id)
      ) {
        alert(
          "Invalid job ID. Cannot update status."
        );

        return;
      }

      const currentStatus =
        String(
          job.status || "Open"
        ).toLowerCase();

      const newStatus =
        currentStatus === "open"
          ? "Closed"
          : "Open";

      try {
        await apiRequest(
          `/api/jobs/${job._id}`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              ...job,
              status: newStatus,
            }),
          }
        );

        await loadJobs();
        await loadAdminDashboard();
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          alert(
            error?.message ||
            "Unable to update job status."
          );
        }
      }
    };

  // ===========================================================
  // CLOSE STUDENT PROFILE WITH ESCAPE
  // ===========================================================

  useEffect(() => {
    if (!studentProfileModal) return;
    const handleStudentProfileKeyDown = (event) => {
      if (event.key === "Escape") closeStudentProfile();
    };
    window.addEventListener("keydown", handleStudentProfileKeyDown);
    return () => window.removeEventListener("keydown", handleStudentProfileKeyDown);
  }, [studentProfileModal]);

  // ===========================================================
  // UPDATE APPLICATION STATUS
  // ===========================================================

  const updateApplicationStatus =
    async (
      applicationId,
      status
    ) => {
      if (
        !isValidMongoId(
          applicationId
        )
      ) {
        alert(
          "Invalid application ID. The application cannot be updated."
        );

        return;
      }

      const allowedStatuses = [
        "Applied",
        "Shortlisted",
        "Rejected",
        "Selected",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        alert(
          "Invalid application status."
        );

        return;
      }

      try {
        await apiRequest(
          `/api/applications/${applicationId}/status`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status,
            }),
          }
        );

        await loadAdminApplications();
        await loadAdminDashboard();
        await loadStudents();

        // Refresh currently opened details
        if (
          selectedApplication?._id &&
          String(
            selectedApplication._id
          ) ===
          String(applicationId)
        ) {
          await loadApplicationDetails(
            applicationId
          );
        }
      } catch (error) {
        if (
          !handleProtectedError(
            error
          )
        ) {
          const message =
            String(
              error?.message || ""
            ).toLowerCase();

          if (
            message.includes(
              "invalid application"
            ) ||
            message.includes(
              "invalid id"
            ) ||
            message.includes(
              "application id"
            )
          ) {
            alert(
              "Invalid application ID. Please refresh the applications list and try again."
            );
          } else {
            alert(
              error?.message ||
              "Unable to update application status."
            );
          }
        }
      }
    };

  // ===========================================================
  // NOTIFICATION LOAD / AUTO REFRESH
  // ===========================================================

  useEffect(() => {
    if (!user || user.role !== "student") {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    loadNotifications(true);

    const notificationInterval = window.setInterval(() => {
      loadNotifications(false);
    }, 30000);

    return () => window.clearInterval(notificationInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ===========================================================
  // CLOSE NOTIFICATIONS WITH ESCAPE
  // ===========================================================

  useEffect(() => {
    if (!notificationOpen) return;

    const handleNotificationKeyDown = (event) => {
      if (event.key === "Escape") setNotificationOpen(false);
    };

    window.addEventListener("keydown", handleNotificationKeyDown);
    return () => window.removeEventListener(
      "keydown",
      handleNotificationKeyDown
    );
  }, [notificationOpen]);

  // ===========================================================
  // INITIAL DATA LOAD
  // ===========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentToken =
      localStorage.getItem(
        "token"
      ) ||
      token ||
      "";

    if (!currentToken) {
      return;
    }

    loadJobs();

    if (
      user.role ===
      "student"
    ) {
      loadProfile();
      loadMyApplications();
    }

    if (
      user.role === "admin"
    ) {
      loadAdminDashboard();
      loadAdminApplications();
      loadStudents();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ===========================================================
  // FILTERED JOBS
  // ===========================================================

  const filteredJobs =
    useMemo(() => {
      const search =
        jobSearch
          .toLowerCase()
          .trim();

      if (!search) {
        return jobs;
      }

      return jobs.filter(
        (job) => {
          return (
            String(
              job.company || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              job.title ||
              job.jobTitle ||
              ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              job.location || ""
            )
              .toLowerCase()
              .includes(search)
          );
        }
      );
    }, [jobs, jobSearch]);

  // ===========================================================
  // FILTERED STUDENTS
  // ===========================================================

  const studentCourses = useMemo(() => {
    return [...new Set(students.map((student) => String(student?.course || "").trim()).filter(Boolean))].sort();
  }, [students]);

  const getStudentApplicationStats = (student) => {
    const studentId = String(student?._id || student?.id || "");
    const studentEmail = String(student?.email || "").toLowerCase();
    const relatedApplications = adminApplications.filter((application) => {
      const applicationStudent = application?.student || application?.user || {};
      const applicationStudentId = String(applicationStudent?._id || applicationStudent?.id || application?.studentId || application?.userId || "");
      const applicationEmail = String(applicationStudent?.email || application?.studentEmail || application?.email || "").toLowerCase();
      return (studentId && applicationStudentId && studentId === applicationStudentId) || (studentEmail && applicationEmail && studentEmail === applicationEmail);
    });
    return {
      total: relatedApplications.length,
      selected: relatedApplications.filter((application) => application?.status === "Selected").length,
      shortlisted: relatedApplications.filter((application) => application?.status === "Shortlisted").length,
      rejected: relatedApplications.filter((application) => application?.status === "Rejected").length,
      applied: relatedApplications.filter((application) => application?.status === "Applied").length,
    };
  };

  const filteredStudents = useMemo(() => {
    const search = studentSearch.trim().toLowerCase();
    return students.filter((student) => {
      const name = String(student?.name || "").toLowerCase();
      const email = String(student?.email || "").toLowerCase();
      const college = String(student?.college || "").toLowerCase();
      const course = String(student?.course || "").toLowerCase();
      const branch = String(student?.branch || "").toLowerCase();
      const placementStatus = String(student?.placementStatus || "Not Placed");
      const matchesSearch = !search || name.includes(search) || email.includes(search) || college.includes(search) || course.includes(search) || branch.includes(search);
      const matchesStatus = studentStatusFilter === "All" || placementStatus === studentStatusFilter;
      const matchesCourse = studentCourseFilter === "All" || String(student?.course || "") === studentCourseFilter;
      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [students, studentSearch, studentStatusFilter, studentCourseFilter]);

  // ===========================================================
  // FILTERED ADMIN APPLICATIONS
  // ===========================================================

  const applicationCompanies = useMemo(() => {
    const companies = adminApplications
      .map(
        (application) =>
          application?.job?.company ||
          application?.company ||
          ""
      )
      .filter(Boolean);

    return [...new Set(companies)].sort();
  }, [adminApplications]);

  const filteredAdminApplications = useMemo(() => {
    const search = applicationSearch.trim().toLowerCase();

    return adminApplications.filter((application) => {
      const studentName = String(
        application?.student?.name ||
        application?.user?.name ||
        application?.studentName ||
        ""
      );

      const studentEmail = String(
        application?.student?.email ||
        application?.user?.email ||
        application?.studentEmail ||
        application?.email ||
        ""
      );

      const jobTitle = String(
        application?.job?.title ||
        application?.job?.jobTitle ||
        application?.jobTitle ||
        ""
      );

      const company = String(
        application?.job?.company ||
        application?.company ||
        ""
      );

      const status = String(
        application?.status ||
        "Applied"
      );

      const matchesSearch =
        !search ||
        studentName.toLowerCase().includes(search) ||
        studentEmail.toLowerCase().includes(search) ||
        jobTitle.toLowerCase().includes(search) ||
        company.toLowerCase().includes(search);

      const matchesStatus =
        applicationStatusFilter === "All" ||
        status === applicationStatusFilter;

      const matchesCompany =
        applicationCompanyFilter === "All" ||
        company === applicationCompanyFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCompany
      );
    });
  }, [
    adminApplications,
    applicationSearch,
    applicationStatusFilter,
    applicationCompanyFilter,
  ]);

  // ===========================================================
  // PROFILE COMPLETION
  // ===========================================================

  const profileCompletion =
    useMemo(() => {
      const fields = [
        profile.phone,
        profile.college,
        profile.course,
        profile.branch,
        profile.graduationYear,
        profile.cgpa,
        profile.skills,
        profile.resume,
      ];

      const completed =
        fields.filter(
          (field) =>
            field !==
            undefined &&
            field !== null &&
            String(field).trim() !==
            ""
        ).length;

      return Math.round(
        (completed /
          fields.length) *
        100
      );
    }, [profile]);

  // ===========================================================
  // AVAILABLE JOB COUNT
  // ===========================================================

  const availableJobCount =
    useMemo(() => {
      return jobs.filter(
        (job) => {
          const closed =
            String(
              job.status || "Open"
            ).toLowerCase() ===
            "closed";

          const expired =
            isDeadlinePassed(
              job.applicationDeadline
            );

          return !closed && !expired;
        }
      ).length;
    }, [jobs]);

  // ===========================================================
  // ADMIN ANALYTICS
  // ===========================================================

  const analytics =
    useMemo(() => {
      const total =
        adminApplications.length;

      const applied =
        adminApplications.filter(
          (application) =>
            String(
              application.status ||
              "Applied"
            ).toLowerCase() ===
            "applied"
        ).length;

      const shortlisted =
        adminApplications.filter(
          (application) =>
            String(
              application.status ||
              ""
            ).toLowerCase() ===
            "shortlisted"
        ).length;

      const rejected =
        adminApplications.filter(
          (application) =>
            String(
              application.status ||
              ""
            ).toLowerCase() ===
            "rejected"
        ).length;

      const selected =
        adminApplications.filter(
          (application) =>
            String(
              application.status ||
              ""
            ).toLowerCase() ===
            "selected"
        ).length;

      const companyMap = {};

      jobs.forEach((job) => {
        const company =
          String(
            job.company ||
            "Unknown"
          ).trim() ||
          "Unknown";

        companyMap[company] =
          (companyMap[company] ||
            0) + 1;
      });

      const companyData =
        Object.entries(
          companyMap
        )
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .slice(0, 6);

      const applicationCompanyMap = {};
      const selectedCompanyMap = {};

      adminApplications.forEach((application) => {
        const company =
          String(
            application?.job?.company ||
            application?.company ||
            "Unknown"
          ).trim() || "Unknown";

        applicationCompanyMap[company] =
          (applicationCompanyMap[company] || 0) + 1;

        if (
          String(application?.status || "")
            .toLowerCase() === "selected"
        ) {
          selectedCompanyMap[company] =
            (selectedCompanyMap[company] || 0) + 1;
        }
      });

      const companyApplicationData =
        Object.entries(applicationCompanyMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6);

      const companySelectedData =
        Object.entries(selectedCompanyMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6);

      const placedStudents = students.filter(
        (student) =>
          String(student?.placementStatus || "")
            .toLowerCase() === "placed"
      ).length;

      const lookingStudents = students.filter(
        (student) =>
          String(student?.placementStatus || "")
            .toLowerCase() === "looking for opportunity"
      ).length;

      const notPlacedStudents = students.filter(
        (student) =>
          ![
            "placed",
            "looking for opportunity",
          ].includes(
            String(student?.placementStatus || "not placed")
              .toLowerCase()
          )
      ).length;

      const activeApplications =
        shortlisted + selected;

      // Placement Rate = placed students / total students.
      // Application Selection Rate = selected applications / total applications.
      const placementRate =
        students.length > 0
          ? Math.round(
            (placedStudents / students.length) * 100
          )
          : 0;

      const selectionRate =
        total > 0
          ? Math.round(
            (selected / total) * 100
          )
          : 0;

      return {
        total,
        applied,
        shortlisted,
        rejected,
        selected,
        placementRate,
        selectionRate,
        activeApplications,
        companyData,
        companyApplicationData,
        companySelectedData,
        placedStudents,
        lookingStudents,
        notPlacedStudents,
      };
    }, [
      adminApplications,
      jobs,
      students,
    ]);

  // ===========================================================
  // LOGIN / REGISTER SCREEN
  // ===========================================================

  if (!user) {
    return (
      <>
        <style>{styles}</style>

        <div className="auth-page">
          <div className="auth-left">
            <div className="brand-large">
              <div className="brand-logo">
                SP
              </div>

              <div>
                <strong>
                  Student Placement
                </strong>

                <span>
                  Portal
                </span>
              </div>
            </div>

            <div className="auth-content">
              <span className="eyebrow">
                CAREER MANAGEMENT
                PLATFORM
              </span>

              <h1>
                Build your career.
                <br />
                Find your opportunity.
              </h1>

              <p>
                A centralized
                platform for
                students,
                recruiters and
                placement
                administrators.
              </p>

              <div className="feature-list">
                <div>
                  ✓ Student profile
                  management
                </div>

                <div>
                  ✓ Resume management
                </div>

                <div>
                  ✓ Job applications
                </div>

                <div>
                  ✓ Placement tracking
                </div>
              </div>
            </div>
          </div>

          <div className="auth-right">
            <div className="auth-card">
              <div className="auth-header">
                <h2>
                  {authMode ===
                    "login"
                    ? "Welcome back"
                    : "Create your account"}
                </h2>

                <p>
                  {authMode ===
                    "login"
                    ? "Login to continue to your dashboard."
                    : "Register to start using the placement portal."}
                </p>
              </div>

              <form
                onSubmit={
                  handleAuthSubmit
                }
              >
                {authMode ===
                  "register" && (
                    <Field
                      label="Full Name"
                      value={
                        authForm.name
                      }
                      placeholder="Enter your name"
                      required
                      onChange={(e) =>
                        setAuthForm({
                          ...authForm,
                          name: e.target
                            .value,
                        })
                      }
                    />
                  )}

                <Field
                  label="Email"
                  type="email"
                  value={
                    authForm.email
                  }
                  placeholder="you@example.com"
                  required
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      email:
                        e.target
                          .value,
                    })
                  }
                />

                <Field
                  label="Password"
                  type="password"
                  value={
                    authForm.password
                  }
                  placeholder="Enter your password"
                  required
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      password:
                        e.target
                          .value,
                    })
                  }
                />

                {authMode ===
                  "register" && (
                    <Field
                      label="Account Type"
                      value={
                        authForm.role
                      }
                      options={[
                        "student",
                        "admin",
                      ]}
                      onChange={(e) =>
                        setAuthForm({
                          ...authForm,
                          role: e.target
                            .value,
                        })
                      }
                    />
                  )}

                {authMessage && (
                  <div className="message">
                    {authMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : authMode ===
                      "login"
                      ? "Login"
                      : "Create Account"}
                </Button>
              </form>

              <div className="auth-switch">
                {authMode ===
                  "login" ? (
                  <>
                    Don't have an
                    account?

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(
                          "register"
                        );

                        setAuthMessage(
                          ""
                        );
                      }}
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an
                    account?

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(
                          "login"
                        );

                        setAuthMessage(
                          ""
                        );
                      }}
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ===========================================================
  // MAIN APPLICATION
  // ===========================================================

  return (
    <>
      <style>{styles}</style>

      <div className="app">

        {/* HEADER */}

        <header className="topbar">
          <div className="topbar-inner">

            <div
              className="brand"
              onClick={() =>
                scrollToSection(
                  "dashboard"
                )
              }
            >
              <div className="brand-logo">
                SP
              </div>

              <div className="brand-text">
                <strong>
                  Student Placement
                </strong>

                <span>
                  Portal
                </span>
              </div>
            </div>

            <nav className="nav">

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "dashboard"
                  )
                }
              >
                Dashboard
              </button>

              {user.role ===
                "student" ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "profile"
                      )
                    }
                  >
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "jobs"
                      )
                    }
                  >
                    Jobs
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "applications"
                      )
                    }
                  >
                    Applications
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "jobs"
                      )
                    }
                  >
                    Jobs
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "applications"
                      )
                    }
                  >
                    Applications
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        "students"
                      )
                    }
                  >
                    Students
                  </button>
                </>
              )}

            </nav>

            <div className="user-area">

              {user.role === "student" && (
                <div className="notification-wrapper">
                  <button
                    type="button"
                    className={`notification-button ${notificationOpen ? "active" : ""}`}
                    onClick={() => {
                      const nextOpen = !notificationOpen;
                      setNotificationOpen(nextOpen);
                      if (nextOpen) loadNotifications(true);
                    }}
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <span className="notification-bell">🔔</span>
                    {unreadNotificationCount > 0 && (
                      <span className="notification-badge">
                        {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="notification-dropdown">
                      <div className="notification-dropdown-header">
                        <div>
                          <strong>Notifications</strong>
                          <span>
                            {unreadNotificationCount > 0
                              ? `${unreadNotificationCount} unread`
                              : "All caught up"}
                          </span>
                        </div>

                        {unreadNotificationCount > 0 && (
                          <button
                            type="button"
                            className="notification-mark-all"
                            onClick={markAllNotificationsAsRead}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="notification-list">
                        {notificationLoading && notifications.length === 0 ? (
                          <div className="notification-empty">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                          <div className="notification-empty">
                            <span>🔔</span>
                            <strong>No notifications yet</strong>
                            <small>Application updates will appear here.</small>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              type="button"
                              className={`notification-item ${notification?.isRead ? "read" : "unread"}`}
                              key={notification?._id}
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                            >
                              <span className="notification-item-icon">
                                {getNotificationIcon(notification?.type)}
                              </span>

                              <span className="notification-item-content">
                                <span className="notification-item-title">
                                  {notification?.title || "Notification"}
                                </span>
                                <span className="notification-item-message">
                                  {notification?.message || "You have a new notification."}
                                </span>
                                <span className="notification-item-time">
                                  {getNotificationTime(notification?.createdAt)}
                                </span>
                              </span>

                              {!notification?.isRead && (
                                <span className="notification-unread-dot"></span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="user-info">
                <strong>
                  {user.name ||
                    "User"}
                </strong>

                <span>
                  {user.role}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={
                  handleLogout
                }
              >
                Logout
              </Button>

            </div>

          </div>
        </header>

        <main className="main-container">

          {/* GLOBAL ERROR */}

          {errorMessage && (
            <div className="global-error">
              <span>
                {errorMessage}
              </span>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage(
                    ""
                  )
                }
              >
                ×
              </button>
            </div>
          )}

          {/* DASHBOARD */}

          <section
            id="dashboard"
            className="dashboard-section"
          >
            <div className="hero">

              <div>
                <span className="eyebrow">
                  {user.role ===
                    "admin"
                    ? "ADMIN DASHBOARD"
                    : "STUDENT DASHBOARD"}
                </span>

                <h1>
                  Welcome,{" "}
                  {user.name ||
                    "User"}{" "}
                  👋
                </h1>

                <p>
                  {user.role ===
                    "admin"
                    ? "Manage students, jobs and placement applications from one place."
                    : "Track your profile, job opportunities and placement applications."}
                </p>

                {user.role === "student" && (
                  <div className="hero-status-row">
                    <span className="hero-status-label">Placement Status</span>
                    <StatusBadge status={profile.placementStatus || "Not Placed"} />
                  </div>
                )}
              </div>

              <div className="hero-date">
                <span>
                  Today
                </span>

                <strong>
                  {new Date().toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </strong>
              </div>

            </div>

            {user.role ===
              "student" ? (
              <>
                <div className="stats-grid">

                  <StatCard
                    title="Available Jobs"
                    value={
                      availableJobCount
                    }
                    icon="💼"
                  />

                  <StatCard
                    title="My Applications"
                    value={
                      applications.length
                    }
                    icon="📄"
                  />

                  <StatCard
                    title="Profile Complete"
                    value={`${profileCompletion}%`}
                    icon="👤"
                  />

                  <StatCard
                    title="Placement Status"
                    value={
                      profile.placementStatus ||
                      "Not Placed"
                    }
                    icon="🎯"
                  />

                </div>

                <div className="student-dashboard-overview">
                  <Card className="profile-progress-card">
                    <div className="profile-progress-heading">
                      <div>
                        <span className="mini-eyebrow">PROFILE READINESS</span>
                        <h3>Complete your placement profile</h3>
                        <p>Keep your details updated so recruiters can review your profile easily.</p>
                      </div>
                      <div className="profile-progress-percent">{profileCompletion}%</div>
                    </div>
                    <div className="profile-progress-track">
                      <div className="profile-progress-fill" style={{ width: `${profileCompletion}%` }}></div>
                    </div>
                    <div className="profile-progress-footer">
                      <span>{profileCompletion === 100 ? "Your profile is complete. You are ready to apply." : "Add the missing information from your profile section."}</span>
                      <button type="button" className="text-action" onClick={() => scrollToSection("profile")}>
                        {profileCompletion === 100 ? "Review Profile" : "Complete Profile"} →
                      </button>
                    </div>
                  </Card>

                  <Card className="placement-status-card">
                    <div className="placement-status-icon">🎯</div>
                    <div>
                      <span>Current placement status</span>
                      <h3>{profile.placementStatus || "Not Placed"}</h3>
                      <p>Based on your latest application activity.</p>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="stats-grid">

                <StatCard
                  title="Total Students"
                  value={
                    adminDashboard?.totalStudents ??
                    students.length
                  }
                  icon="👨‍🎓"
                />

                <StatCard
                  title="Total Jobs"
                  value={
                    adminDashboard?.totalJobs ??
                    jobs.length
                  }
                  icon="💼"
                />

                <StatCard
                  title="Applications"
                  value={
                    adminDashboard?.totalApplications ??
                    adminApplications.length
                  }
                  icon="📄"
                />

                <StatCard
                  title="Selected"
                  value={
                    adminDashboard?.selectedApplications ??
                    0
                  }
                  icon="🏆"
                />

              </div>
            )}

            {/* =================================================
                ADMIN ANALYTICS
               ================================================= */}

            {user.role ===
              "admin" && (
                <section
                  id="analytics"
                  className="analytics-section"
                >

                  <SectionTitle
                    title="Placement Analytics"
                    description="Monitor application progress, company activity and overall placement performance."
                  />

                  {/* TOP ANALYTICS CARDS */}

                  <div className="analytics-grid">

                    <Card className="analytics-card">
                      <div className="analytics-card-header">
                        <div>
                          <h3>
                            Applications by Status
                          </h3>
                          <p>
                            Current application pipeline.
                          </p>
                        </div>

                        <span className="analytics-icon">
                          📊
                        </span>
                      </div>

                      <div className="analytics-bars">
                        <AnalyticsBar
                          label="Applied"
                          count={analytics.applied}
                          total={analytics.total}
                          type="applied"
                        />

                        <AnalyticsBar
                          label="Shortlisted"
                          count={analytics.shortlisted}
                          total={analytics.total}
                          type="shortlisted"
                        />

                        <AnalyticsBar
                          label="Selected"
                          count={analytics.selected}
                          total={analytics.total}
                          type="selected"
                        />

                        <AnalyticsBar
                          label="Rejected"
                          count={analytics.rejected}
                          total={analytics.total}
                          type="rejected"
                        />
                      </div>
                    </Card>

                    <Card className="placement-card">
                      <div className="analytics-card-header">
                        <div>
                          <h3>
                            Student Placement Rate
                          </h3>
                          <p>
                            Placed students compared with total registered students.
                          </p>
                        </div>

                        <span className="analytics-icon">
                          🎯
                        </span>
                      </div>

                      <div className="placement-rate">
                        <div
                          className="rate-circle"
                          style={{
                            "--rate":
                              `${analytics.placementRate}%`,
                          }}
                        >
                          <div>
                            <strong>
                              {analytics.placementRate}%
                            </strong>
                            <span>
                              Placed
                            </span>
                          </div>
                        </div>

                        <div className="rate-summary">
                          <div>
                            <span>
                              Total Students
                            </span>
                            <strong>
                              {students.length}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Placed
                            </span>
                            <strong>
                              {analytics.placedStudents}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Not Placed
                            </span>
                            <strong>
                              {analytics.notPlacedStudents}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="placement-card">
                      <div className="analytics-card-header">
                        <div>
                          <h3>
                            Application Selection Rate
                          </h3>
                          <p>
                            Selected applications compared with total applications.
                          </p>
                        </div>

                        <span className="analytics-icon">
                          🏆
                        </span>
                      </div>

                      <div className="placement-rate">
                        <div
                          className="rate-circle"
                          style={{
                            "--rate":
                              `${analytics.selectionRate}%`,
                          }}
                        >
                          <div>
                            <strong>
                              {analytics.selectionRate}%
                            </strong>
                            <span>
                              Selected
                            </span>
                          </div>
                        </div>

                        <div className="rate-summary">
                          <div>
                            <span>
                              Total Applications
                            </span>
                            <strong>
                              {analytics.total}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Selected
                            </span>
                            <strong>
                              {analytics.selected}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Rejected
                            </span>
                            <strong>
                              {analytics.rejected}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </Card>

                  </div>

                  {/* SELECTION FUNNEL */}

                  <Card className="analytics-funnel-card">
                    <div className="analytics-card-header">
                      <div>
                        <h3>
                          Selection Funnel
                        </h3>
                        <p>
                          Track how applications move toward selection.
                        </p>
                      </div>

                      <span className="analytics-icon">
                        🔽
                      </span>
                    </div>

                    <div className="funnel-grid">
                      <div className="funnel-step">
                        <span className="funnel-number">
                          {analytics.total}
                        </span>
                        <strong>
                          Total Applications
                        </strong>
                        <small>
                          100% of applications
                        </small>
                      </div>

                      <div className="funnel-arrow">
                        →
                      </div>

                      <div className="funnel-step">
                        <span className="funnel-number">
                          {analytics.activeApplications}
                        </span>
                        <strong>
                          Active Pipeline
                        </strong>
                        <small>
                          {analytics.total > 0
                            ? Math.round(
                              (analytics.activeApplications /
                                analytics.total) *
                              100
                            )
                            : 0}% of applications
                        </small>
                      </div>

                      <div className="funnel-arrow">
                        →
                      </div>

                      <div className="funnel-step">
                        <span className="funnel-number">
                          {analytics.selected}
                        </span>
                        <strong>
                          Selected
                        </strong>
                        <small>
                          {analytics.selectionRate}% of applications
                        </small>
                      </div>
                    </div>
                  </Card>

                  {/* COMPANY ANALYTICS */}

                  <div className="analytics-company-grid">

                    <Card className="company-analytics-card">
                      <div className="analytics-card-header">
                        <div>
                          <h3>
                            Applications by Company
                          </h3>
                          <p>
                            Number of student applications received by each company.
                          </p>
                        </div>

                        <span className="analytics-icon">
                          🏢
                        </span>
                      </div>

                      {analytics.companyApplicationData.length === 0 ? (
                        <div className="empty-state analytics-empty">
                          <span>
                            🏢
                          </span>
                          <h3>
                            No application data
                          </h3>
                          <p>
                            Applications will appear here after students apply.
                          </p>
                        </div>
                      ) : (
                        <div className="company-list">
                          {analytics.companyApplicationData.map(
                            ([company, count]) => {
                              const maxCount =
                                analytics.companyApplicationData[0]?.[1] || 1;

                              const percentage =
                                Math.round(
                                  (count / maxCount) * 100
                                );

                              return (
                                <div
                                  className="company-row"
                                  key={company}
                                >
                                  <div className="company-row-info">
                                    <div className="company-mini-logo">
                                      {String(company)
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <strong>
                                      {company}
                                    </strong>

                                    <span>
                                      {count} {count === 1 ? "application" : "applications"}
                                    </span>
                                  </div>

                                  <div className="company-track">
                                    <div
                                      className="company-progress"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </Card>

                    <Card className="company-analytics-card">
                      <div className="analytics-card-header">
                        <div>
                          <h3>
                            Selected by Company
                          </h3>
                          <p>
                            Number of selected applications for each company.
                          </p>
                        </div>

                        <span className="analytics-icon">
                          🏆
                        </span>
                      </div>

                      {analytics.companySelectedData.length === 0 ? (
                        <div className="empty-state analytics-empty">
                          <span>
                            🏆
                          </span>
                          <h3>
                            No selected applications
                          </h3>
                          <p>
                            Selected applications will appear here.
                          </p>
                        </div>
                      ) : (
                        <div className="company-list">
                          {analytics.companySelectedData.map(
                            ([company, count]) => {
                              const maxCount =
                                analytics.companySelectedData[0]?.[1] || 1;

                              const percentage =
                                Math.round(
                                  (count / maxCount) * 100
                                );

                              return (
                                <div
                                  className="company-row"
                                  key={company}
                                >
                                  <div className="company-row-info">
                                    <div className="company-mini-logo selected-company-logo">
                                      {String(company)
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>

                                    <strong>
                                      {company}
                                    </strong>

                                    <span>
                                      {count} {count === 1 ? "selected" : "selected"}
                                    </span>
                                  </div>

                                  <div className="company-track">
                                    <div
                                      className="company-progress selected-company-progress"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </Card>

                  </div>

                  {/* STUDENT PLACEMENT SUMMARY */}

                  <Card className="student-analytics-card">
                    <div className="analytics-card-header">
                      <div>
                        <h3>
                          Student Placement Summary
                        </h3>
                        <p>
                          Current placement status across registered students.
                        </p>
                      </div>

                      <span className="analytics-icon">
                        👨‍🎓
                      </span>
                    </div>

                    <div className="student-analytics-grid">
                      <div className="student-analytics-stat">
                        <span className="student-analytics-icon">
                          👨‍🎓
                        </span>
                        <div>
                          <small>
                            Total Students
                          </small>
                          <strong>
                            {students.length}
                          </strong>
                        </div>
                      </div>

                      <div className="student-analytics-stat">
                        <span className="student-analytics-icon">
                          🏆
                        </span>
                        <div>
                          <small>
                            Placed
                          </small>
                          <strong>
                            {analytics.placedStudents}
                          </strong>
                        </div>
                      </div>

                      <div className="student-analytics-stat">
                        <span className="student-analytics-icon">
                          🔎
                        </span>
                        <div>
                          <small>
                            Looking for Opportunity
                          </small>
                          <strong>
                            {analytics.lookingStudents}
                          </strong>
                        </div>
                      </div>

                      <div className="student-analytics-stat">
                        <span className="student-analytics-icon">
                          ⏳
                        </span>
                        <div>
                          <small>
                            Not Placed
                          </small>
                          <strong>
                            {analytics.notPlacedStudents}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Card>

                </section>
              )}

          </section>

          {/* STUDENT PROFILE */}

          {user.role ===
            "student" && (
              <section
                id="profile"
                className="section"
              >
                <SectionTitle
                  title="My Profile"
                  description="Keep your academic and personal information up to date."
                />

                <div className="two-column">

                  <Card>

                    <div className="card-header">

                      <div>
                        <h3>
                          Profile
                          Information
                        </h3>

                        <p>
                          Update your
                          placement
                          profile.
                        </p>
                      </div>

                      <span className="completion">
                        {
                          profileCompletion
                        }
                        % complete
                      </span>

                    </div>

                    <form
                      onSubmit={
                        saveProfile
                      }
                    >

                      <div className="form-grid">

                        <Field
                          label="Phone"
                          value={
                            profile.phone
                          }
                          placeholder="Enter phone number"
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              phone: e.target
                                .value,
                            })
                          }
                        />

                        <Field
                          label="College"
                          value={
                            profile.college
                          }
                          placeholder="College name"
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              college:
                                e.target
                                  .value,
                            })
                          }
                        />

                        <Field
                          label="Course"
                          value={
                            profile.course
                          }
                          placeholder="B.Tech / BCA / MCA..."
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              course:
                                e.target
                                  .value,
                            })
                          }
                        />

                        <Field
                          label="Branch"
                          value={
                            profile.branch
                          }
                          placeholder="CSE / IT..."
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              branch:
                                e.target
                                  .value,
                            })
                          }
                        />

                        <Field
                          label="Graduation Year"
                          value={
                            profile.graduationYear
                          }
                          placeholder="2026"
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              graduationYear:
                                e.target
                                  .value,
                            })
                          }
                        />

                        <Field
                          label="CGPA"
                          value={
                            profile.cgpa
                          }
                          placeholder="8.5"
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              cgpa:
                                e.target
                                  .value,
                            })
                          }
                        />

                        <Field
                          label="Skills"
                          value={
                            profile.skills
                          }
                          placeholder="React, JavaScript, SQL..."
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              skills:
                                e.target
                                  .value,
                            })
                          }
                        />

                        <div className="field">

                          <label>
                            Placement Status
                          </label>

                          <div
                            style={{
                              padding:
                                "12px 14px",
                              border:
                                "1px solid #e5e7eb",
                              borderRadius:
                                "10px",
                              background:
                                "#f8fafc",
                              minHeight:
                                "44px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                            }}
                          >
                            <StatusBadge
                              status={
                                profile.placementStatus ||
                                "Not Placed"
                              }
                            />
                          </div>

                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "6px",
                              color:
                                "#64748b",
                            }}
                          >
                            Placement status is updated automatically based on your application status.
                          </small>

                        </div>

                      </div>

                      {profileMessage && (
                        <div className="success-message">
                          {
                            profileMessage
                          }
                        </div>
                      )}

                      <Button type="submit">
                        Save Profile
                      </Button>

                    </form>

                  </Card>

                  <Card>

                    <div className="card-header">

                      <div>
                        <h3>
                          Resume
                        </h3>

                        <p>
                          Upload your
                          latest resume.
                        </p>
                      </div>

                      <span className="resume-icon">
                        📄
                      </span>

                    </div>

                    <div className="resume-upload">

                      <div className="upload-box">

                        <span>
                          📎
                        </span>

                        <strong>
                          {resumeFile
                            ? resumeFile.name
                            : "Choose PDF Resume"}
                        </strong>

                        <small>
                          PDF only • Maximum
                          5 MB
                        </small>

                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) =>
                            setResumeFile(
                              e.target
                                .files?.[0] ||
                              null
                            )
                          }
                        />

                      </div>

                      <Button
                        onClick={
                          uploadResume
                        }
                        disabled={
                          !resumeFile
                        }
                      >
                        Upload Resume
                      </Button>

                      {resumeMessage && (
                        <div className="message">
                          {
                            resumeMessage
                          }
                        </div>
                      )}

                      {profile.resume && (
                        <a
                          className="resume-link"
                          href={
                            profile.resume.startsWith(
                              "http"
                            )
                              ? profile.resume
                              : `${API_BASE}${profile.resume}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Current Resume
                          →
                        </a>
                      )}

                    </div>

                  </Card>

                </div>
              </section>
            )}

          {/* JOBS */}

          <section
            id="jobs"
            className="section"
          >

            <div className="section-title job-title-row">

              <div>
                <h2>
                  {user.role ===
                    "admin"
                    ? "Manage Jobs"
                    : "Latest Opportunities"}
                </h2>

                <p>
                  {user.role ===
                    "admin"
                    ? "Create and manage placement opportunities."
                    : "Explore available jobs and apply to the right opportunity."}
                </p>
              </div>

              <div className="search-box">
                🔍

                <input
                  value={
                    jobSearch
                  }
                  onChange={(e) =>
                    setJobSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search jobs, companies..."
                />
              </div>

            </div>

            {jobLoading ? (
              <Card>
                <div className="empty-state">
                  Loading jobs...
                </div>
              </Card>
            ) : filteredJobs.length ===
              0 ? (
              <Card>
                <div className="empty-state">

                  <span>
                    💼
                  </span>

                  <h3>
                    No jobs found
                  </h3>

                  <p>
                    {jobSearch
                      ? "Try another search."
                      : "No job opportunities are available right now."}
                  </p>

                </div>
              </Card>
            ) : (
              <div className="jobs-grid">

                {filteredJobs.map(
                  (job) => {
                    const alreadyApplied =
                      hasApplied(
                        job._id
                      );

                    const deadlinePassed =
                      isDeadlinePassed(
                        job.applicationDeadline
                      );

                    const isClosed =
                      String(
                        job.status ||
                        "Open"
                      ).toLowerCase() ===
                      "closed";

                    return (
                      <Card
                        key={
                          job._id
                        }
                        className="job-card"
                      >

                        <div className="job-top">

                          <div className="company-logo">
                            {String(
                              job.company ||
                              "C"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <StatusBadge
                            status={
                              deadlinePassed
                                ? "Closed"
                                : job.status ||
                                "Open"
                            }
                          />

                        </div>

                        <div className="job-content">

                          <h3>
                            {job.title ||
                              job.jobTitle ||
                              "Job Opportunity"}
                          </h3>

                          <strong className="company-name">
                            {
                              job.company
                            }
                          </strong>

                          <p>
                            {job.description ||
                              "No description available."}
                          </p>

                          <div className="job-meta">

                            <span>
                              📍{" "}
                              {job.location ||
                                "Remote"}
                            </span>

                            <span>
                              💰{" "}
                              {job.salary ||
                                "Not specified"}
                            </span>

                            <span>
                              📅{" "}
                              {formatDate(
                                job.applicationDeadline
                              )}
                            </span>

                          </div>

                        </div>

                        {user.role ===
                          "student" ? (
                          <Button
                            onClick={() =>
                              applyForJob(
                                job
                              )
                            }
                            disabled={
                              alreadyApplied ||
                              isClosed ||
                              deadlinePassed
                            }
                          >
                            {alreadyApplied
                              ? "Already Applied"
                              : deadlinePassed
                                ? "Deadline Passed"
                                : isClosed
                                  ? "Applications Closed"
                                  : "Apply Now"}
                          </Button>
                        ) : (
                          <div className="button-row">

                            <Button
                              variant="outline"
                              onClick={() =>
                                startEditJob(
                                  job
                                )
                              }
                            >
                              Edit
                            </Button>

                            <Button
                              variant="secondary"
                              onClick={() =>
                                toggleJobStatus(
                                  job
                                )
                              }
                            >
                              {String(
                                job.status ||
                                "Open"
                              ).toLowerCase() ===
                                "open"
                                ? "Close"
                                : "Open"}
                            </Button>

                            <Button
                              variant="danger"
                              onClick={() =>
                                deleteJob(
                                  job._id
                                )
                              }
                            >
                              Delete
                            </Button>

                          </div>
                        )}

                      </Card>
                    );
                  }
                )}

              </div>
            )}

          </section>

          {/* ADMIN JOB FORM */}

          {user.role ===
            "admin" && (
              <section
                id="job-form"
                className="section"
              >

                <SectionTitle
                  title={
                    editingJobId
                      ? "Edit Job"
                      : "Create New Job"
                  }
                  description="Add a new placement opportunity for students."
                />

                <Card>

                  <form
                    onSubmit={
                      handleJobSubmit
                    }
                  >

                    <div className="form-grid">

                      <Field
                        label="Company"
                        value={
                          jobForm.company
                        }
                        placeholder="Infosys"
                        required
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            company:
                              e.target
                                .value,
                          })
                        }
                      />

                      <Field
                        label="Job Title"
                        value={
                          jobForm.title
                        }
                        placeholder="Graduate Software Engineer"
                        required
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            title:
                              e.target
                                .value,
                          })
                        }
                      />

                      <Field
                        label="Location"
                        value={
                          jobForm.location
                        }
                        placeholder="Pune"
                        required
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            location:
                              e.target
                                .value,
                          })
                        }
                      />

                      <Field
                        label="Salary"
                        value={
                          jobForm.salary
                        }
                        placeholder="6 LPA"
                        required
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            salary:
                              e.target
                                .value,
                          })
                        }
                      />

                      <Field
                        label="Application Deadline"
                        type="date"
                        value={
                          jobForm.applicationDeadline
                        }
                        required
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            applicationDeadline:
                              e.target
                                .value,
                          })
                        }
                      />

                    </div>

                    <div className="field">

                      <label>
                        Description *
                      </label>

                      <textarea
                        value={
                          jobForm.description
                        }
                        placeholder="Enter job description..."
                        required
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            description:
                              e.target
                                .value,
                          })
                        }
                      />

                    </div>

                    {jobMessage && (
                      <div className="message">
                        {
                          jobMessage
                        }
                      </div>
                    )}

                    <div className="button-row">

                      <Button type="submit">
                        {editingJobId
                          ? "Update Job"
                          : "Create Job"}
                      </Button>

                      {editingJobId && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingJobId(
                              null
                            );

                            setJobForm({
                              ...emptyJob,
                            });
                          }}
                        >
                          Cancel Edit
                        </Button>
                      )}

                    </div>

                  </form>

                </Card>

              </section>
            )}

          {/* APPLICATIONS */}

          <section
            id="applications"
            className="section"
          >

            <SectionTitle
              title={
                user.role ===
                  "admin"
                  ? "Application Management"
                  : "My Applications"
              }
              description={
                user.role ===
                  "admin"
                  ? "Review and update student applications."
                  : "Track the status of your job applications."
              }
            />

            {user.role === "admin" && (
              <div className="application-filters">
                <div className="application-search-box">
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Search student, job or company..."
                    value={applicationSearch}
                    onChange={(e) => setApplicationSearch(e.target.value)}
                  />
                </div>

                <div className="application-filter-field">
                  <label>Status</label>
                  <select
                    value={applicationStatusFilter}
                    onChange={(e) => setApplicationStatusFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="application-filter-field">
                  <label>Company</label>
                  <select
                    value={applicationCompanyFilter}
                    onChange={(e) => setApplicationCompanyFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    {applicationCompanies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setApplicationSearch("");
                    setApplicationStatusFilter("All");
                    setApplicationCompanyFilter("All");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {user.role ===
              "student" ? (
              applications.length ===
                0 ? (
                <Card>

                  <div className="empty-state">

                    <span>
                      📄
                    </span>

                    <h3>
                      No applications yet
                    </h3>

                    <p>
                      Apply to a job
                      opportunity
                      to see it
                      here.
                    </p>

                  </div>

                </Card>
              ) : (
                <div className="application-grid">

                  {applications.map(
                    (
                      application
                    ) => {
                      const job =
                        application?.job ||
                        {};

                      return (
                        <Card
                          key={
                            application._id
                          }
                          className="application-card"
                        >

                          <div className="application-header">

                            <div>

                              <h3>
                                {job.title ||
                                  job.jobTitle ||
                                  application.jobTitle ||
                                  "Job Application"}
                              </h3>

                              <p>
                                {job.company ||
                                  application.company ||
                                  "Company"}
                              </p>

                            </div>

                            <StatusBadge
                              status={
                                application.status ||
                                "Applied"
                              }
                            />

                          </div>

                          <div className="application-info">

                            <span>
                              📅 Applied:{" "}
                              {formatDate(
                                application.createdAt
                              )}
                            </span>

                            <span>
                              📍{" "}
                              {job.location ||
                                application.location ||
                                "Not specified"}
                            </span>

                          </div>

                          <div className="application-card-footer">
                            <span className="application-reference">
                              Application #{String(application._id || "").slice(-6)}
                            </span>
                            <Button
                              variant="outline"
                              onClick={() => openApplicationDetails(application._id)}
                            >
                              View Details →
                            </Button>
                          </div>

                        </Card>
                      );
                    }
                  )}

                </div>
              )
            ) : adminApplications.length ===
              0 ? (
              <Card>

                <div className="empty-state">

                  <span>
                    📄
                  </span>

                  <h3>
                    No applications
                  </h3>

                  <p>
                    Student
                    applications
                    will appear
                    here.
                  </p>

                </div>

              </Card>
            ) : (
              <Card>

                <div className="table-wrapper">

                  <table>

                    <thead>
                      <tr>
                        <th>
                          Student
                        </th>

                        <th>
                          Job
                        </th>

                        <th>
                          Company
                        </th>

                        <th>
                          Applied
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Update
                        </th>

                        <th>
                          Details
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredAdminApplications.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="empty-table-state"
                          >
                            No applications match your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredAdminApplications.map(
                          (
                            application
                          ) => {
                            const student =
                              application?.student ||
                              {};

                            const job =
                              application?.job ||
                              {};

                            const applicationId =
                              application?._id;

                            const validApplicationId =
                              isValidMongoId(
                                applicationId
                              );

                            return (
                              <tr
                                key={
                                  applicationId ||
                                  Math.random()
                                }
                              >

                                <td>

                                  <strong>
                                    {student.name ||
                                      application.studentName ||
                                      "Student"}
                                  </strong>

                                  <small>
                                    {student.email ||
                                      application.email ||
                                      ""}
                                  </small>

                                </td>

                                <td>
                                  {job.title ||
                                    job.jobTitle ||
                                    application.jobTitle ||
                                    "Job"}
                                </td>

                                <td>
                                  {job.company ||
                                    application.company ||
                                    "-"}
                                </td>

                                <td>
                                  {formatDate(
                                    application.createdAt
                                  )}
                                </td>

                                <td>

                                  <StatusBadge
                                    status={
                                      application.status ||
                                      "Applied"
                                    }
                                  />

                                </td>

                                <td>

                                  {!validApplicationId ? (
                                    <div className="invalid-id">
                                      Invalid Application ID
                                    </div>
                                  ) : (
                                    <select
                                      value={
                                        application.status ||
                                        "Applied"
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        updateApplicationStatus(
                                          applicationId,
                                          e.target
                                            .value
                                        )
                                      }
                                    >

                                      <option value="Applied">
                                        Applied
                                      </option>

                                      <option value="Shortlisted">
                                        Shortlisted
                                      </option>

                                      <option value="Rejected">
                                        Rejected
                                      </option>

                                      <option value="Selected">
                                        Selected
                                      </option>

                                    </select>
                                  )}

                                </td>

                                <td>

                                  {!validApplicationId ? (
                                    <div className="invalid-id">
                                      Invalid ID
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        openApplicationDetails(
                                          applicationId
                                        )
                                      }
                                    >
                                      View Details
                                    </Button>
                                  )}

                                </td>

                              </tr>
                            );
                          }
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </Card>
            )}

          </section>

          {/* ADMIN STUDENTS */}

          {user.role ===
            "admin" && (
              <section
                id="students"
                className="section"
              >

                <div className="section-title">

                  <div>

                    <h2>
                      Student Management
                    </h2>

                    <p>
                      View registered students and their placement information.
                    </p>

                  </div>

                </div>

                <div className="student-summary-grid">
                  <div className="student-summary-card"><span>👨‍🎓</span><div><small>Total Students</small><strong>{students.length}</strong></div></div>
                  <div className="student-summary-card"><span>🏆</span><div><small>Placed</small><strong>{students.filter((student) => student.placementStatus === "Placed").length}</strong></div></div>
                  <div className="student-summary-card"><span>🔎</span><div><small>Looking</small><strong>{students.filter((student) => student.placementStatus === "Looking for Opportunity").length}</strong></div></div>
                  <div className="student-summary-card"><span>📄</span><div><small>Applications</small><strong>{adminApplications.length}</strong></div></div>
                </div>

                <div className="student-management-filters">
                  <div className="student-search-box">
                    <span>🔍</span>
                    <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search name, email, college, course or branch..." />
                  </div>
                  <div className="student-filter-field">
                    <label>Placement Status</label>
                    <select value={studentStatusFilter} onChange={(e) => setStudentStatusFilter(e.target.value)}>
                      <option value="All">All</option>
                      <option value="Not Placed">Not Placed</option>
                      <option value="Placed">Placed</option>
                      <option value="Looking for Opportunity">Looking for Opportunity</option>
                    </select>
                  </div>
                  <div className="student-filter-field">
                    <label>Course</label>
                    <select value={studentCourseFilter} onChange={(e) => setStudentCourseFilter(e.target.value)}>
                      <option value="All">All</option>
                      {studentCourses.map((course) => <option key={course} value={course}>{course}</option>)}
                    </select>
                  </div>
                  <Button variant="outline" onClick={() => { setStudentSearch(""); setStudentStatusFilter("All"); setStudentCourseFilter("All"); }}>Clear Filters</Button>
                </div>

                {filteredStudents.length ===
                  0 ? (
                  <Card>

                    <div className="empty-state">

                      <span>
                        👨‍🎓
                      </span>

                      <h3>
                        No students
                        found
                      </h3>

                      <p>
                        Registered
                        students
                        will appear
                        here.
                      </p>

                    </div>

                  </Card>
                ) : (
                  <Card>

                    <div className="table-wrapper">

                      <table>

                        <thead>

                          <tr>

                            <th>
                              Name
                            </th>

                            <th>
                              Email
                            </th>

                            <th>
                              College
                            </th>

                            <th>
                              Course
                            </th>

                            <th>
                              Branch
                            </th>

                            <th>
                              Status
                            </th>
                            <th>Applications</th>
                            <th>Selected</th>
                            <th>Shortlisted</th>
                            <th>Rejected</th>
                            <th>
                              Actions
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {filteredStudents.map(
                            (student) => {
                              const applicationStats =
                                getStudentApplicationStats(student);

                              return (
                                <tr
                                  key={
                                    student._id
                                  }
                                >

                                  <td>
                                    <strong>
                                      {student.name ||
                                        "-"}
                                    </strong>
                                  </td>

                                  <td>
                                    {student.email ||
                                      "-"}
                                  </td>

                                  <td>
                                    {student.college ||
                                      "-"}
                                  </td>

                                  <td>
                                    {student.course ||
                                      "-"}
                                  </td>

                                  <td>
                                    {student.branch ||
                                      "-"}
                                  </td>

                                  <td>
                                    <StatusBadge status={student.placementStatus || "Not Placed"} />
                                  </td>
                                  <td>{applicationStats.total}</td>
                                  <td>{applicationStats.selected}</td>
                                  <td>{applicationStats.shortlisted}</td>
                                  <td>{applicationStats.rejected}</td>
                                  <td>
                                    <div className="button-row student-actions">
                                      <Button
                                        variant="outline"
                                        onClick={() => openStudentProfile(student)}
                                      >
                                        View Profile
                                      </Button>
                                      {student.resume ? (
                                        <a
                                          href={getResumeUrl(student.resume)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="student-resume-link"
                                        >
                                          📄 Resume
                                        </a>
                                      ) : (
                                        <span className="no-resume">No Resume</span>
                                      )}
                                    </div>
                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                  </Card>
                )}

                <Card className="security-card">

                  <div>

                    <h3>
                      🔐 Admin Security
                      Test
                    </h3>

                    <p>
                      Verify that
                      protected admin
                      endpoints are
                      properly
                      restricted.
                    </p>

                  </div>

                  <Button
                    variant="outline"
                    onClick={
                      testStudentSecurity
                    }
                  >
                    Test Protection
                  </Button>

                  {securityMessage && (
                    <div className="success-message">
                      {
                        securityMessage
                      }
                    </div>
                  )}

                </Card>

              </section>
            )}

        </main>

        <footer>

          <strong>
            Student Placement
            Portal
          </strong>

          <span>
            Built for managing
            students, jobs and
            placements.
          </span>

        </footer>

        {/* =====================================================
            STUDENT PROFILE MODAL
           ===================================================== */}

        {studentProfileModal && selectedStudent && (
          <div className="application-modal-overlay" onClick={closeStudentProfile}>
            <div
              className="application-modal student-profile-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="application-modal-header">
                <div>
                  <span className="eyebrow modal-eyebrow">STUDENT PROFILE</span>
                  <h2>{selectedStudent.name || "Student Profile"}</h2>
                  <p>Complete student and placement information.</p>
                </div>
                <button type="button" className="modal-close" onClick={closeStudentProfile}>×</button>
              </div>

              <div className="application-details-content">
                <div className="details-section">
                  <div className="details-section-title"><span>👤</span><div><h3>Personal Information</h3><p>Basic student contact details.</p></div></div>
                  <div className="details-grid">
                    <div className="detail-item"><span>Name</span><strong>{selectedStudent.name || "Not provided"}</strong></div>
                    <div className="detail-item"><span>Email</span><strong>{selectedStudent.email || "Not provided"}</strong></div>
                    <div className="detail-item"><span>Phone</span><strong>{selectedStudent.phone || "Not provided"}</strong></div>
                    <div className="detail-item"><span>Placement Status</span><strong><StatusBadge status={selectedStudent.placementStatus || "Not Placed"} /></strong></div>
                  </div>
                </div>

                <div className="details-section">
                  <div className="details-section-title"><span>🎓</span><div><h3>Education</h3><p>Academic profile information.</p></div></div>
                  <div className="details-grid">
                    <div className="detail-item"><span>College</span><strong>{selectedStudent.college || "Not provided"}</strong></div>
                    <div className="detail-item"><span>Course</span><strong>{selectedStudent.course || "Not provided"}</strong></div>
                    <div className="detail-item"><span>Branch</span><strong>{selectedStudent.branch || "Not provided"}</strong></div>
                    <div className="detail-item"><span>Graduation Year</span><strong>{selectedStudent.graduationYear || "Not provided"}</strong></div>
                    <div className="detail-item"><span>CGPA</span><strong>{selectedStudent.cgpa || "Not provided"}</strong></div>
                  </div>
                </div>

                <div className="details-section">
                  <div className="details-section-title"><span>💼</span><div><h3>Skills & Placement</h3><p>Skills and current placement information.</p></div></div>
                  <div className="details-grid">
                    <div className="detail-item detail-full"><span>Skills</span><strong>{Array.isArray(selectedStudent.skills) ? selectedStudent.skills.join(", ") : selectedStudent.skills || "Not provided"}</strong></div>
                    <div className="detail-item"><span>Placement Status</span><strong><StatusBadge status={selectedStudent.placementStatus || "Not Placed"} /></strong></div>
                    <div className="detail-item"><span>Resume</span><strong>{selectedStudent.resume ? <a href={getResumeUrl(selectedStudent.resume)} target="_blank" rel="noreferrer" className="resume-view-link">📄 View Resume</a> : "Not uploaded"}</strong></div>
                  </div>
                </div>
              </div>

              <div className="details-footer">
                <Button variant="outline" onClick={closeStudentProfile}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            APPLICATION DETAILS MODAL
           ===================================================== */}

        {(selectedApplication ||
          applicationDetailsLoading ||
          applicationDetailsError) && (
            <div
              className="application-modal-overlay"
              onClick={
                closeApplicationDetails
              }
            >

              <div
                className="application-modal"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >

                <div className="application-modal-header">

                  <div>
                    <span className="eyebrow modal-eyebrow">
                      APPLICATION DETAILS
                    </span>

                    <h2>
                      Application
                      Overview
                    </h2>

                    {selectedApplication?._id && (
                      <p>
                        ID:{" "}
                        {
                          selectedApplication._id
                        }
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="modal-close"
                    onClick={
                      closeApplicationDetails
                    }
                  >
                    ×
                  </button>

                </div>

                {applicationDetailsLoading ? (
                  <div className="modal-loading">
                    <div className="loading-spinner">
                      ⟳
                    </div>

                    <h3>
                      Loading application details...
                    </h3>

                    <p>
                      Please wait while the
                      application information
                      is loaded.
                    </p>
                  </div>
                ) : applicationDetailsError ? (
                  <div className="modal-error">

                    <span>
                      ⚠️
                    </span>

                    <h3>
                      Unable to load details
                    </h3>

                    <p>
                      {
                        applicationDetailsError
                      }
                    </p>

                    {selectedApplication?._id && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          loadApplicationDetails(
                            selectedApplication._id
                          )
                        }
                      >
                        Try Again
                      </Button>
                    )}

                  </div>
                ) : selectedApplication ? (
                  <div className="application-details-content">

                    {/* STUDENT */}

                    <div className="details-section">

                      <div className="details-section-heading">

                        <div className="details-icon">
                          👨‍🎓
                        </div>

                        <div>
                          <h3>
                            Student Information
                          </h3>

                          <p>
                            Applicant details
                          </p>
                        </div>

                      </div>

                      <div className="details-grid">

                        <div className="detail-item">
                          <span>
                            Name
                          </span>

                          <strong>
                            {selectedApplication
                              ?.student
                              ?.name ||
                              selectedApplication?.studentName ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="detail-item">
                          <span>
                            Email
                          </span>

                          <strong>
                            {selectedApplication
                              ?.student
                              ?.email ||
                              selectedApplication?.email ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="detail-item">
                          <span>
                            College
                          </span>

                          <strong>
                            {selectedApplication
                              ?.student
                              ?.college ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="detail-item">
                          <span>
                            Course
                          </span>

                          <strong>
                            {selectedApplication
                              ?.student
                              ?.course ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="detail-item">
                          <span>
                            Branch
                          </span>

                          <strong>
                            {selectedApplication
                              ?.student
                              ?.branch ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="detail-item">
                          <span>
                            CGPA
                          </span>

                          <strong>
                            {selectedApplication
                              ?.student
                              ?.cgpa ||
                              "Not available"}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* JOB */}

                    <div className="details-section">

                      <div className="details-section-heading">

                        <div className="details-icon">
                          💼
                        </div>

                        <div>
                          <h3>
                            Job Information
                          </h3>

                          <p>
                            Position applied for
                          </p>
                        </div>

                      </div>

                      <div className="details-grid">

                        <div className="detail-item">
                          <span>
                            Job Title
                          </span>

                          <strong>
                            {selectedApplication
                              ?.job
                              ?.title ||
                              selectedApplication
                                ?.job
                                ?.jobTitle ||
                              selectedApplication?.jobTitle ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="detail-item">
                          <span>
                            Company
                          </span>

                          <strong>
                            {selectedApplication
                              ?.job
                              ?.company ||
                              selectedApplication?.company ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="detail-item">
                          <span>
                            Location
                          </span>

                          <strong>
                            {selectedApplication
                              ?.job
                              ?.location ||
                              selectedApplication?.location ||
                              "Not available"}
                          </strong>
                        </div>

                        <div className="detail-item">
                          <span>
                            Salary
                          </span>

                          <strong>
                            {selectedApplication
                              ?.job
                              ?.salary ||
                              "Not specified"}
                          </strong>
                        </div>

                        <div className="detail-item detail-full">
                          <span>
                            Application Deadline
                          </span>

                          <strong>
                            {formatDate(
                              selectedApplication
                                ?.job
                                ?.applicationDeadline
                            )}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* CURRENT STATUS */}

                    <div className="current-status-card">

                      <div>
                        <span>
                          Current Application
                          Status
                        </span>

                        <h3>
                          {
                            selectedApplication.status ||
                            "Applied"
                          }
                        </h3>
                      </div>

                      <StatusBadge
                        status={
                          selectedApplication.status ||
                          "Applied"
                        }
                      />

                    </div>

                    {/* APPLICATION DATE */}

                    <div className="application-date-card">

                      <div>
                        <span>
                          Application Submitted
                        </span>

                        <strong>
                          {formatDateTime(
                            selectedApplication.createdAt
                          )}
                        </strong>
                      </div>

                      {selectedApplication.updatedAt && (
                        <div>
                          <span>
                            Last Updated
                          </span>

                          <strong>
                            {formatDateTime(
                              selectedApplication.updatedAt
                            )}
                          </strong>
                        </div>
                      )}

                    </div>

                    {/* HISTORY */}

                    <div className="details-section history-section">

                      <div className="details-section-heading">

                        <div className="details-icon">
                          🕒
                        </div>

                        <div>
                          <h3>
                            Status History
                          </h3>

                          <p>
                            Track every application
                            status change.
                          </p>
                        </div>

                      </div>

                      <ApplicationHistory
                        history={
                          Array.isArray(
                            selectedApplication.statusHistory
                          )
                            ? selectedApplication.statusHistory
                            : []
                        }
                      />

                    </div>

                    {/* FOOTER */}

                    <div className="modal-footer">

                      <Button
                        variant="outline"
                        onClick={
                          closeApplicationDetails
                        }
                      >
                        Close
                      </Button>

                    </div>

                  </div>
                ) : null}

              </div>

            </div>
          )}

      </div>
    </>
  );
}

// =============================================================
// CSS
// =============================================================

const styles = `
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background: #f5f7fb;
  color: #172033;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ============================================================
   AUTH
   ============================================================ */

.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  background: #ffffff;
}

.auth-left {
  padding: 55px 8%;
  background: linear-gradient(
    135deg,
    #172554,
    #1d4ed8 55%,
    #2563eb
  );
  color: white;
  display: flex;
  flex-direction: column;
}

.brand-large {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-large strong {
  display: block;
  font-size: 18px;
}

.brand-large span {
  display: block;
  font-size: 13px;
  opacity: 0.75;
}

.brand-logo {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  font-weight: 800;
}

.auth-content {
  max-width: 620px;
  margin: auto 0;
}

.eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  opacity: 0.75;
  margin-bottom: 16px;
}

.auth-content h1 {
  font-size: clamp(40px, 5vw, 68px);
  line-height: 1.05;
  margin: 0 0 25px;
}

.auth-content p {
  max-width: 530px;
  font-size: 18px;
  line-height: 1.7;
  opacity: 0.85;
}

.feature-list {
  margin-top: 35px;
  display: grid;
  gap: 15px;
  font-weight: 600;
}

.auth-right {
  display: grid;
  place-items: center;
  padding: 30px;
  background: #f8fafc;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  padding: 35px;
  box-shadow:
    0 20px 60px rgba(15, 23, 42, 0.08);
}

.auth-header {
  margin-bottom: 25px;
}

.auth-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
}

.auth-header p {
  margin: 0;
  color: #64748b;
}

/* ============================================================
   APP
   ============================================================ */

.app {
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid #e5e7eb;
}

.topbar-inner {
  max-width: 1400px;
  margin: auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 25px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 210px;
}

.brand-text strong {
  display: block;
  font-size: 14px;
}

.brand-text span {
  display: block;
  font-size: 11px;
  color: #64748b;
}

.nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav button {
  border: 0;
  background: transparent;
  color: #475569;
  padding: 9px 12px;
  border-radius: 9px;
  font-weight: 600;
}

.nav button:hover {
  background: #eff6ff;
  color: #2563eb;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-info {
  text-align: right;
}

.user-info strong {
  display: block;
  font-size: 13px;
}

.user-info span {
  display: block;
  color: #64748b;
  font-size: 11px;
  text-transform: capitalize;
}

.main-container {
  max-width: 1400px;
  margin: auto;
  padding: 30px 24px 70px;
}

.global-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 13px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.global-error button {
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 20px;
}

/* ============================================================
   HERO
   ============================================================ */

.dashboard-section {
  scroll-margin-top: 100px;
}

.hero {
  background: linear-gradient(
    135deg,
    #172554,
    #1e40af
  );
  color: white;
  border-radius: 24px;
  padding: 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 22px;
  overflow: hidden;
}

.hero h1 {
  font-size: 38px;
  margin: 0 0 10px;
}

.hero p {
  margin: 0;
  color: #dbeafe;
  max-width: 700px;
  line-height: 1.65;
}

.hero-status-row { display: flex; align-items: center; gap: 10px; margin-top: 20px; }
.hero-status-label { font-size: 11px; color: #bfdbfe; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.hero-status-row .badge { border: 1px solid rgba(255,255,255,.25); }

.hero-date {
  min-width: 150px;
  padding: 18px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
}

.hero-date span,
.hero-date strong {
  display: block;
}

.hero-date span {
  font-size: 12px;
  opacity: 0.7;
}

.hero-date strong {
  margin-top: 5px;
}

/* ============================================================
   STATS
   ============================================================ */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow:
    0 8px 25px rgba(15, 23, 42, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #eff6ff;
  font-size: 22px;
}

.stat-card p {
  margin: 0 0 5px;
  color: #64748b;
  font-size: 13px;
}

.stat-card h2 {
  margin: 0;
  font-size: 23px;
  line-height: 1.2;
}

.student-dashboard-overview { display: grid; grid-template-columns: 1.65fr .85fr; gap: 16px; margin-top: 16px; }
.profile-progress-card, .placement-status-card { min-height: 170px; }
.profile-progress-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; }
.mini-eyebrow { color:#2563eb; font-size:10px; font-weight:800; letter-spacing:.1em; }
.profile-progress-heading h3 { margin:7px 0 5px; font-size:18px; }
.profile-progress-heading p { margin:0; color:#64748b; font-size:12px; line-height:1.55; }
.profile-progress-percent { min-width:58px; height:58px; border-radius:50%; display:grid; place-items:center; background:#eff6ff; color:#1d4ed8; font-weight:800; font-size:16px; }
.profile-progress-track { height:9px; background:#e2e8f0; border-radius:999px; overflow:hidden; margin-top:22px; }
.profile-progress-fill { height:100%; border-radius:inherit; background:linear-gradient(90deg,#2563eb,#60a5fa); transition:width .35s ease; }
.profile-progress-footer { display:flex; align-items:center; justify-content:space-between; gap:15px; margin-top:13px; color:#64748b; font-size:11px; }
.text-action { border:0; background:transparent; color:#2563eb; font-weight:800; padding:0; white-space:nowrap; }
.text-action:hover { text-decoration:underline; }
.placement-status-card { display:flex; align-items:center; gap:15px; }
.placement-status-icon { width:50px; height:50px; flex:0 0 50px; display:grid; place-items:center; border-radius:14px; background:#f0fdf4; font-size:22px; }
.placement-status-card span { color:#64748b; font-size:11px; }
.placement-status-card h3 { margin:5px 0 4px; font-size:20px; }
.placement-status-card p { margin:0; color:#64748b; font-size:11px; }

/* ============================================================
   ANALYTICS
   ============================================================ */

.analytics-section {
  margin-top: 35px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  gap: 18px;
}

.analytics-card,
.placement-card,
.company-analytics-card {
  min-height: 100%;
}

.analytics-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
}

.analytics-card-header h3 {
  margin: 0;
  font-size: 18px;
}

.analytics-card-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.analytics-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #eff6ff;
  font-size: 20px;
}

.analytics-bars {
  display: grid;
  gap: 18px;
}

.analytics-bar-item {
  display: grid;
  gap: 8px;
}

.analytics-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #475569;
  font-size: 13px;
}

.analytics-bar-header small {
  color: #94a3b8;
}

.analytics-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.analytics-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

.analytics-dot.applied {
  background: #2563eb;
}

.analytics-dot.shortlisted {
  background: #f59e0b;
}

.analytics-dot.selected {
  background: #16a34a;
}

.analytics-dot.rejected {
  background: #dc2626;
}

.analytics-track {
  width: 100%;
  height: 8px;
  border-radius: 100px;
  background: #f1f5f9;
  overflow: hidden;
}

.analytics-progress {
  height: 100%;
  border-radius: 100px;
  transition: width 0.4s ease;
}

.analytics-progress.applied {
  background: #2563eb;
}

.analytics-progress.shortlisted {
  background: #f59e0b;
}

.analytics-progress.selected {
  background: #16a34a;
}

.analytics-progress.rejected {
  background: #dc2626;
}

.placement-rate {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  min-height: 200px;
}

.rate-circle {
  --rate: 0%;
  width: 145px;
  height: 145px;
  border-radius: 50%;
  background:
    conic-gradient(
      #2563eb var(--rate),
      #e2e8f0 var(--rate)
    );
  display: grid;
  place-items: center;
  position: relative;
}

.rate-circle::before {
  content: "";
  position: absolute;
  width: 112px;
  height: 112px;
  background: white;
  border-radius: 50%;
}

.rate-circle > div {
  position: relative;
  z-index: 1;
  text-align: center;
}

.rate-circle strong {
  display: block;
  font-size: 25px;
}

.rate-circle span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 11px;
}

.rate-summary {
  display: grid;
  gap: 18px;
}

.rate-summary div {
  display: grid;
  gap: 3px;
}

.rate-summary span {
  color: #64748b;
  font-size: 12px;
}

.rate-summary strong {
  font-size: 20px;
}

.company-analytics-card {
  margin-top: 18px;
}

.company-list {
  display: grid;
  gap: 17px;
}

.company-row {
  display: grid;
  gap: 8px;
}

.company-row-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.company-row-info span {
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
}

.company-mini-logo {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 800;
}

.company-track {
  height: 7px;
  background: #f1f5f9;
  border-radius: 100px;
  overflow: hidden;
}

.company-progress {
  height: 100%;
  border-radius: 100px;
  background: #2563eb;
  transition: width 0.4s ease;
}

.analytics-empty {
  padding: 30px 15px;
}

/* ============================================================
   ANALYTICS UPGRADE
   ============================================================ */

.analytics-funnel-card {
  margin-top: 18px;
}

.funnel-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 14px;
}

.funnel-step {
  min-height: 125px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #f8fafc;
  text-align: center;
}

.funnel-number {
  font-size: 30px;
  line-height: 1;
  font-weight: 800;
  color: #111827;
}

.funnel-step strong {
  font-size: 14px;
  color: #334155;
}

.funnel-step small {
  color: #64748b;
  font-size: 11px;
}

.funnel-arrow {
  font-size: 24px;
  font-weight: 800;
  color: #94a3b8;
}

.analytics-company-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.analytics-company-grid .company-analytics-card {
  margin-top: 0;
}

.selected-company-logo {
  background: #f0fdf4;
  color: #16a34a;
}

.selected-company-progress {
  background: #16a34a;
}

.student-analytics-card {
  margin-top: 18px;
}

.student-analytics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.student-analytics-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 78px;
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.student-analytics-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 11px;
  background: #f1f5f9;
  font-size: 20px;
}

.student-analytics-stat div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.student-analytics-stat small {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.student-analytics-stat strong {
  color: #111827;
  font-size: 23px;
  line-height: 1.1;
}

/* ============================================================
   SECTIONS
   ============================================================ */

.section {
  margin-top: 55px;
  scroll-margin-top: 100px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h2 {
  margin: 0;
  font-size: 25px;
}

.section-title p {
  margin: 6px 0 0;
  color: #64748b;
}

.job-title-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 23px;
  box-shadow:
    0 8px 25px rgba(15, 23, 42, 0.035);
}

.two-column {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 24px;
}

.card-header h3 {
  margin: 0;
}

.card-header p {
  color: #64748b;
  margin: 5px 0 0;
  font-size: 13px;
}

.completion {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}

/* ============================================================
   FORMS
   ============================================================ */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 17px;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
}

.field label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.field input,
.field select,
.field textarea,
table select {
  width: 100%;
  border: 1px solid #dbe2ea;
  background: #fff;
  border-radius: 10px;
  padding: 11px 13px;
  outline: none;
  color: #172033;
}

.field input:focus,
.field select:focus,
.field textarea:focus,
table select:focus {
  border-color: #2563eb;
  box-shadow:
    0 0 0 3px rgba(37, 99, 235, 0.1);
}

.field textarea {
  min-height: 120px;
  resize: vertical;
}

.btn {
  border: 0;
  border-radius: 10px;
  padding: 11px 17px;
  font-weight: 700;
  transition: 0.2s ease;
  background: #2563eb;
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn.outline {
  background: white;
  border: 1px solid #dbe2ea;
  color: #334155;
}

.btn.secondary {
  background: #475569;
}

.btn.danger {
  background: #dc2626;
}

.button-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.message,
.success-message {
  padding: 11px 13px;
  border-radius: 9px;
  margin: 12px 0;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
}

.success-message {
  background: #ecfdf5;
  color: #047857;
}

/* ============================================================
   SEARCH
   ============================================================ */

.search-box {
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dbe2ea;
  background: white;
  border-radius: 11px;
  padding: 0 12px;
}

.search-box input {
  border: 0;
  outline: 0;
  padding: 11px 4px;
  width: 100%;
}

/* ============================================================
   JOBS
   ============================================================ */

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.job-card {
  display: flex;
  flex-direction: column;
  min-height: 360px;
  padding: 22px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.045);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.job-card:hover {
  transform: translateY(-4px);
  border-color: #bfdbfe;
  box-shadow: 0 14px 32px rgba(37, 99, 235, 0.10);
}

.job-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.company-logo {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 21px;
  font-weight: 800;
  border: 1px solid #dbeafe;
}

.job-top .badge {
  margin-top: 2px;
}

.job-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.job-content h3 {
  margin: 20px 0 5px;
  color: #0f172a;
  font-size: 17px;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.company-name {
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
}

.job-content p {
  color: #64748b;
  line-height: 1.6;
  font-size: 12px;
  margin: 12px 0 0;
  min-height: 58px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-meta {
  display: grid;
  gap: 8px;
  margin: 18px 0 20px;
  color: #475569;
  font-size: 11px;
}

.job-meta span {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 8px 10px;
  border: 1px solid #eef2f7;
  border-radius: 9px;
  background: #f8fafc;
}

.job-card > .btn {
  width: 100%;
  min-height: 42px;
  justify-content: center;
  border-radius: 10px;
  margin-top: auto;
}

.job-card > .btn:disabled {
  cursor: not-allowed;
  opacity: 0.72;
  transform: none;
}

.job-card .button-row {
  margin-top: auto;
  flex-wrap: wrap;
}

.job-card .button-row .btn {
  flex: 1;
  min-width: 80px;
}

@media (max-width: 1100px) {
  .jobs-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .jobs-grid {
    grid-template-columns: 1fr;
  }

  .job-card {
    min-height: auto;
  }
}

/* ============================================================
   BADGES
   ============================================================ */

.badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 100px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 800;
  background: #f1f5f9;
  color: #475569;
}

.badge.open,
.badge.selected {
  background: #dcfce7;
  color: #15803d;
}

.badge.shortlisted {
  background: #fef3c7;
  color: #b45309;
}

.badge.rejected,
.badge.closed {
  background: #fee2e2;
  color: #b91c1c;
}

.badge.applied,
.badge.pending {
  background: #dbeafe;
  color: #1d4ed8;
}

/* ============================================================
   INVALID APPLICATION ID
   ============================================================ */

.invalid-id {
  display: inline-flex;
  align-items: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  padding: 7px 9px;
  font-size: 11px;
  font-weight: 700;
}

/* ============================================================
   RESUME
   ============================================================ */

.resume-upload {
  display: grid;
  gap: 15px;
}

.upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 15px;
  padding: 28px;
  text-align: center;
  position: relative;
  background: #f8fafc;
}

.upload-box span {
  display: block;
  font-size: 30px;
  margin-bottom: 8px;
}

.upload-box strong,
.upload-box small {
  display: block;
}

.upload-box small {
  margin-top: 5px;
  color: #64748b;
}

.upload-box input {
  margin-top: 15px;
  max-width: 100%;
}

.resume-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

/* ============================================================
   APPLICATIONS
   ============================================================ */

.application-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 17px;
}

.application-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.application-header h3 {
  margin: 0;
}

.application-header p {
  color: #2563eb;
  margin: 5px 0 0;
  font-weight: 600;
}

.application-info {
  margin-top: 22px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 12px;
}

.application-card { display:flex; flex-direction:column; min-height:205px; }
.application-card-footer { margin-top:auto; padding-top:18px; display:flex; align-items:center; justify-content:space-between; gap:15px; border-top:1px solid #f1f5f9; }
.application-reference { color:#94a3b8; font-size:10px; font-weight:700; }
.application-card-footer .btn { padding:9px 13px; font-size:11px; }

/* ============================================================
   APPLICATION FILTERS
   ============================================================ */

.student-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 0 0 20px;
}

.student-summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 78px;
  padding: 16px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.student-summary-card > span {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f1f5f9;
  font-size: 22px;
  flex-shrink: 0;
}

.student-summary-card div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.student-summary-card small {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.student-summary-card strong {
  color: #111827;
  font-size: 24px;
  line-height: 1.1;
}

.student-management-filters {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 190px 190px auto;
  align-items: end;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.student-search-box {
  width: 100%;
  min-width: 0;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
}

.student-search-box input {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #111827;
}

.student-filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.student-filter-field label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.student-filter-field select {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.student-search-box:focus-within,
.student-filter-field select:focus {
  border-color: #2563eb;
}

.student-management-filters > .btn {
  height: 42px;
  white-space: nowrap;
}

.student-management-filters + .card .table-wrapper {
  overflow-x: auto;
}

.student-management-filters + .card table {
  min-width: 1250px;
}

.student-management-filters + .card table th:nth-child(7),
.student-management-filters + .card table th:nth-child(8),
.student-management-filters + .card table th:nth-child(9),
.student-management-filters + .card table th:nth-child(10),
.student-management-filters + .card table td:nth-child(7),
.student-management-filters + .card table td:nth-child(8),
.student-management-filters + .card table td:nth-child(9),
.student-management-filters + .card table td:nth-child(10) {
  text-align: center;
  white-space: nowrap;
}


.application-filters {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
}

.application-search-box {
  flex: 1;
  min-width: 260px;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
}

.application-search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #111827;
}

.application-filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
}

.application-filter-field label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.application-filter-field select {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.application-filter-field select:focus,
.application-search-box:focus-within {
  border-color: #2563eb;
}

.empty-table-state {
  padding: 35px 20px;
  text-align: center;
  color: #64748b;
  font-weight: 600;
}

/* ============================================================
   APPLICATION DETAILS MODAL
   ============================================================ */

.student-actions { align-items: center; flex-wrap: wrap; gap: 8px; }

.student-resume-link {
  display: inline-flex; align-items: center; justify-content: center; padding: 8px 11px;
  border-radius: 9px; background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe;
  text-decoration: none; font-size: 12px; font-weight: 700; transition: 0.2s ease; white-space: nowrap;
}
.student-resume-link:hover { background: #dbeafe; color: #1d4ed8; transform: translateY(-1px); }
.no-resume { display: inline-flex; align-items: center; padding: 8px 10px; border-radius: 9px; background: #f8fafc; color: #94a3b8; font-size: 11px; font-weight: 700; white-space: nowrap; }
.student-profile-modal { max-width: 850px; }

.application-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
  overflow-y: auto;
}

.application-modal {
  width: 100%;
  max-width: 900px;
  max-height: calc(100vh - 50px);
  overflow-y: auto;
  background: white;
  border-radius: 24px;
  box-shadow:
    0 30px 80px rgba(15, 23, 42, 0.25);
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.application-modal-header {
  padding: 25px 28px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  z-index: 5;
}

.application-modal-header .modal-eyebrow {
  color: #2563eb;
  opacity: 1;
  margin-bottom: 7px;
}

.application-modal-header h2 {
  margin: 0;
  font-size: 25px;
}

.application-modal-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 11px;
  word-break: break-all;
}

.modal-close {
  width: 38px;
  height: 38px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  border-radius: 10px;
  font-size: 25px;
  line-height: 1;
  display: grid;
  place-items: center;
}

.modal-close:hover {
  background: #f8fafc;
  color: #dc2626;
}

.application-details-content {
  padding: 28px;
}

.details-section {
  border: 1px solid #e5e7eb;
  border-radius: 17px;
  padding: 21px;
  margin-bottom: 18px;
}

.details-section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.details-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #eff6ff;
  font-size: 20px;
}

.details-section-heading h3 {
  margin: 0;
  font-size: 17px;
}

.details-section-heading p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  background: #f8fafc;
  border-radius: 11px;
  padding: 13px 14px;
}

.detail-item span {
  display: block;
  color: #64748b;
  font-size: 11px;
  margin-bottom: 5px;
}

.detail-item strong {
  display: block;
  color: #172033;
  font-size: 13px;
  word-break: break-word;
}

.detail-full {
  grid-column: 1 / -1;
}

.current-status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    #eff6ff,
    #f8fafc
  );
  border: 1px solid #dbeafe;
  margin-bottom: 18px;
}

.current-status-card span {
  color: #64748b;
  display: block;
  font-size: 12px;
}

.current-status-card h3 {
  margin: 5px 0 0;
  font-size: 21px;
}

.application-date-card {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 18px;
}

.application-date-card > div {
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
}

.application-date-card span,
.application-date-card strong {
  display: block;
}

.application-date-card span {
  color: #64748b;
  font-size: 11px;
  margin-bottom: 5px;
}

.application-date-card strong {
  font-size: 13px;
}

.history-section {
  margin-bottom: 0;
}

.status-history {
  display: grid;
  gap: 0;
}

.history-item {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
  min-height: 80px;
}

.history-line-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.history-dot {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  border: 3px solid #eff6ff;
  z-index: 1;
}

.history-dot.applied {
  background: #dbeafe;
  color: #1d4ed8;
}

.history-dot.shortlisted {
  background: #fef3c7;
  color: #b45309;
}

.history-dot.selected {
  background: #dcfce7;
  color: #15803d;
}

.history-dot.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.history-line {
  width: 2px;
  flex: 1;
  min-height: 45px;
  background: #e2e8f0;
}

.history-content {
  padding-bottom: 20px;
}

.history-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.history-main strong {
  display: block;
  font-size: 14px;
}

.history-main small {
  display: block;
  color: #64748b;
  font-size: 11px;
  margin-top: 4px;
}

.history-content p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 11px;
}

.history-empty {
  padding: 25px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  text-align: center;
  font-size: 13px;
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.modal-loading {
  padding: 70px 25px;
  text-align: center;
  color: #64748b;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  font-size: 25px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.modal-loading h3 {
  color: #334155;
  margin: 0 0 7px;
}

.modal-loading p {
  margin: 0;
  font-size: 13px;
}

.modal-error {
  padding: 60px 25px;
  text-align: center;
}

.modal-error > span {
  font-size: 35px;
}

.modal-error h3 {
  margin: 12px 0 6px;
}

.modal-error p {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 18px;
}

/* ============================================================
   TABLE
   ============================================================ */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

th {
  text-align: left;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  padding: 13px;
}

td {
  padding: 15px 13px;
  border-top: 1px solid #eef2f7;
  font-size: 13px;
}

td strong,
td small {
  display: block;
}

td small {
  margin-top: 3px;
  color: #64748b;
}

table select {
  min-width: 130px;
  padding: 7px;
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

.empty-state {
  text-align: center;
  padding: 45px 20px;
  color: #64748b;
}

.empty-state span {
  font-size: 35px;
}

.empty-state h3 {
  color: #334155;
  margin-bottom: 5px;
}

.empty-state p {
  margin: 0;
}

/* ============================================================
   SECURITY
   ============================================================ */

.security-card {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.security-card > div {
  flex: 1;
}

.security-card h3 {
  margin: 0 0 5px;
}

.security-card p {
  color: #64748b;
  margin: 0;
  font-size: 13px;
}

/* ============================================================
   AUTH SWITCH
   ============================================================ */

.auth-switch {
  text-align: center;
  margin-top: 22px;
  color: #64748b;
  font-size: 13px;
}

.auth-switch button {
  border: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  margin-left: 5px;
}

/* ============================================================
   FOOTER
   ============================================================ */

footer {
  border-top: 1px solid #e5e7eb;
  background: white;
  padding: 25px;
  display: flex;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .two-column {
    grid-template-columns: 1fr;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .nav {
    display: none;
  }
}

@media (max-width: 1000px) {
  .funnel-grid {
    grid-template-columns: 1fr;
  }

  .funnel-arrow {
    transform: rotate(90deg);
    justify-self: center;
  }

  .analytics-company-grid {
    grid-template-columns: 1fr;
  }

  .student-analytics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }


  .student-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .student-management-filters {
    grid-template-columns: 1fr 1fr;
  }

  .student-search-box {
    grid-column: 1 / -1;
  }
}

@media (max-width: 750px) {
  .student-summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .student-management-filters {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .student-search-box {
    grid-column: auto;
  }

  .student-management-filters .btn {
    width: 100%;
  }

  .student-dashboard-overview { grid-template-columns: 1fr; }
  .profile-progress-footer { align-items:flex-start; flex-direction:column; }
  .application-card-footer { align-items:stretch; flex-direction:column; }
  .application-card-footer .btn { width:100%; }

  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-left {
    min-height: 360px;
    padding: 35px 25px;
  }

  .auth-content {
    margin-top: 70px;
  }

  .auth-content h1 {
    font-size: 42px;
  }

  .auth-right {
    padding: 20px;
  }

  .auth-card {
    padding: 25px;
  }

  .topbar-inner {
    padding: 12px 15px;
  }

  .brand {
    min-width: auto;
  }

  .brand-text {
    display: none;
  }

  .user-info {
    display: none;
  }

  .main-container {
    padding: 20px 15px 50px;
  }

  .hero {
    padding: 25px;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero h1 {
    font-size: 30px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .jobs-grid,
  .application-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .job-title-row {
    align-items: stretch;
    flex-direction: column;
  }

  .search-box {
    min-width: 0;
  }

  .placement-rate {
    flex-direction: column;
  }

  .rate-summary {
    width: 100%;
    grid-template-columns: 1fr 1fr;
  }

  .company-row-info {
    flex-wrap: wrap;
  }

  .company-row-info span {
    margin-left: auto;
  }

  footer {
    flex-direction: column;
    text-align: center;
  }

  .application-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .application-search-box,
  .application-filter-field {
    width: 100%;
    min-width: 0;
  }

  .application-filters .btn {
    width: 100%;
  }

  /* APPLICATION DETAILS MOBILE */

  .application-modal-overlay {
    padding: 10px;
    align-items: flex-start;
  }

  .application-modal {
    max-height: calc(100vh - 20px);
    border-radius: 18px;
  }

  .application-modal-header {
    padding: 20px;
  }

  .application-details-content {
    padding: 18px;
  }

  .details-section {
    padding: 17px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-full {
    grid-column: auto;
  }

  .application-date-card {
    grid-template-columns: 1fr;
  }

  .current-status-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .history-main {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .modal-footer {
    justify-content: stretch;
  }

  .modal-footer .btn {
    width: 100%;
  }
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */

.notification-wrapper { position: relative; flex-shrink: 0; }
.notification-button {
  position: relative; width: 42px; height: 42px; display: grid; place-items: center;
  border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;
  color: #334155; cursor: pointer; transition: 0.2s ease;
}
.notification-button:hover, .notification-button.active { border-color: #cbd5e1; background: #f8fafc; transform: translateY(-1px); }
.notification-bell { font-size: 18px; line-height: 1; }
.notification-badge {
  position: absolute; top: -5px; right: -5px; min-width: 19px; height: 19px; padding: 0 5px;
  display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff;
  border-radius: 999px; background: #dc2626; color: #ffffff; font-size: 9px; font-weight: 800;
}
.notification-dropdown {
  position: absolute; top: calc(100% + 12px); right: 0; z-index: 1000;
  width: min(390px, calc(100vw - 30px)); overflow: hidden; border: 1px solid #e2e8f0;
  border-radius: 16px; background: #ffffff; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
}
.notification-dropdown-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 15px 16px; border-bottom: 1px solid #eef2f7;
}
.notification-dropdown-header > div { display: flex; flex-direction: column; gap: 3px; }
.notification-dropdown-header strong { color: #111827; font-size: 15px; }
.notification-dropdown-header span { color: #64748b; font-size: 11px; }
.notification-mark-all { border: none; background: transparent; color: #2563eb; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.notification-mark-all:hover { text-decoration: underline; }
.notification-list { max-height: 420px; overflow-y: auto; }
.notification-item {
  position: relative; width: 100%; display: flex; align-items: flex-start; gap: 11px;
  padding: 14px 15px; border: none; border-bottom: 1px solid #f1f5f9; background: #ffffff;
  text-align: left; cursor: pointer; transition: background 0.18s ease;
}
.notification-item:last-child { border-bottom: none; }
.notification-item:hover { background: #f8fafc; }
.notification-item.unread { background: #eff6ff; }
.notification-item.unread:hover { background: #eaf2ff; }
.notification-item-icon {
  width: 36px; height: 36px; display: grid; place-items: center; flex-shrink: 0;
  border-radius: 10px; background: #f1f5f9; font-size: 17px;
}
.notification-item-content { min-width: 0; display: flex; flex: 1; flex-direction: column; gap: 3px; }
.notification-item-title { color: #111827; font-size: 13px; font-weight: 800; }
.notification-item-message { color: #475569; font-size: 12px; line-height: 1.45; }
.notification-item-time { margin-top: 2px; color: #94a3b8; font-size: 10px; font-weight: 600; }
.notification-unread-dot { width: 7px; height: 7px; margin-top: 5px; flex-shrink: 0; border-radius: 50%; background: #2563eb; }
.notification-empty {
  min-height: 150px; display: flex; align-items: center; justify-content: center; flex-direction: column;
  gap: 6px; padding: 25px 18px; color: #64748b; text-align: center;
}
.notification-empty span { font-size: 27px; margin-bottom: 2px; }
.notification-empty strong { color: #334155; font-size: 13px; }
.notification-empty small { max-width: 230px; font-size: 11px; line-height: 1.5; }
@media (max-width: 750px) {
  .notification-dropdown { position: fixed; top: 72px; right: 12px; width: min(390px, calc(100vw - 24px)); }
  .notification-button { width: 40px; height: 40px; }
}

`;

export default App;