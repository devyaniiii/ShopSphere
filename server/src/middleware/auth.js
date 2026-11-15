const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

// Verify Firebase token without requiring a MongoDB user.
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const idToken = authHeader.slice(7).trim();

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken.uid || !decodedToken.email) {
      return res.status(401).json({
        success: false,
        message: "Verified Firebase user details are missing.",
      });
    }

    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email.toLowerCase(),
      name: decodedToken.name || "",
      emailVerified: decodedToken.email_verified === true,
    };

    return next();
  } catch (error) {
    if (error.code && error.code.startsWith("auth/")) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    return next(error);
  }
};

// Verify Firebase token and find the corresponding MongoDB user.
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const idToken = authHeader.slice(7).trim();

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken.uid) {
      return res.status(401).json({
        success: false,
        message: "Verified Firebase user ID is missing.",
      });
    }

    const user = await User.findOne({
      firebaseUid: decodedToken.uid,
    }).select("_id name email role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found. Please sync your account.",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    if (error.code && error.code.startsWith("auth/")) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    return next(error);
  }
};

module.exports = auth;
module.exports.verifyFirebaseToken = verifyFirebaseToken;
