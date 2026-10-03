const adminOnly = (req, res, next) => {
    try {
        // Check whether user information exists
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        // Check user role
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only.",
            });
        }

        // User is admin
        next();

    } catch (error) {
        console.error("Admin authorization error:", error);

        res.status(500).json({
            message: "Authorization error",
        });
    }
};

module.exports = adminOnly;