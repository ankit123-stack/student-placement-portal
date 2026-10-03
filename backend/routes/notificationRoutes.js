const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// Get student's notifications
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id,
        })
            .populate("application")
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            message: "Failed to fetch notifications",
        });
    }
});

// Get unread count
router.get("/unread-count", authMiddleware, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user.id,
            isRead: false,
        });

        res.json({
            count,
        });
    } catch (error) {
        console.error("Unread notification count error:", error);

        res.status(500).json({
            message: "Failed to fetch unread notification count",
        });
    }
});

// Mark one notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id,
            },
            {
                isRead: true,
            },
            {
                new: true,
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
            });
        }

        res.json(notification);
    } catch (error) {
        console.error("Mark notification read error:", error);

        res.status(500).json({
            message: "Failed to update notification",
        });
    }
});

// Mark all notifications as read
router.put("/read-all", authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            {
                user: req.user.id,
                isRead: false,
            },
            {
                isRead: true,
            }
        );

        res.json({
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("Mark all notifications read error:", error);

        res.status(500).json({
            message: "Failed to update notifications",
        });
    }
});

module.exports = router;