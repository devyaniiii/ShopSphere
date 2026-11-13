const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const idToken = authHeader.split(" ")[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    // Verify Firebase ID token on the server
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Find user using verified Firebase email
    if (!decodedToken.email) {
      return res.status(401).json({
        success: false,
        message: "Verified user email is missing.",
      });
    }

    const user = await User.findOne({
      email: decodedToken.email.toLowerCase(),
    }).select("_id email role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Attach trusted database identity and role
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

module.exports = auth;
