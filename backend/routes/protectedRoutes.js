id = "k1f2q9"
const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protected test route
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "You are authorized to access this route",
        user: req.user,
    });
});

module.exports = router;

