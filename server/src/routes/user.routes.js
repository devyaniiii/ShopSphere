const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const { verifyFirebaseToken } = require("../middleware/auth");

const { syncUser, getProfile, updateProfile } = require("../controllers/user.controller");

// Synchronize Firebase user with MongoDB.
router.post("/sync", verifyFirebaseToken, syncUser);

// Get authenticated user's profile.
router.get("/me", auth, getProfile);

// Update authenticated user's profile.
router.patch("/me", auth, updateProfile);

module.exports = router;
