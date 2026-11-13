const User = require("../models/User");

// POST /api/users/sync
const syncUser = async (req, res, next) => {
  try {
    const { uid, email, name, emailVerified } = req.firebaseUser;

    // Find the account using its Firebase UID first.
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Check whether an account with this email already exists.
      user = await User.findOne({ email });

      if (user) {
        // Prevent linking an account to a different Firebase UID.
        if (user.firebaseUid && user.firebaseUid !== uid) {
          return res.status(409).json({
            success: false,
            message: "This email is already linked to another account.",
          });
        }

        // Require a verified email before linking an existing account.
        if (!emailVerified) {
          return res.status(403).json({
            success: false,
            message: "Verify your Firebase email before linking this existing account.",
          });
        }

        user.firebaseUid = uid;
        await user.save();
      } else {
        // Create a new customer account.
        user = await User.create({
          firebaseUid: uid,
          name: name || email.split("@")[0],
          email,
          role: "customer",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "User account synchronized successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email or Firebase UID already exists.",
      });
    }

    return next(error);
  }
};

// GET /api/users/me
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email role createdAt updatedAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const body = req.body || {};

    // Users cannot change their own role.
    if (Object.prototype.hasOwnProperty.call(body, "role")) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    // Only the name field is allowed to be updated.
    const allowedFields = ["name"];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (
      Object.keys(updates).length === 0 ||
      typeof updates.name !== "string" ||
      updates.name.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid name of at least 2 characters is required.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name: updates.name.trim() } },
      { new: true, runValidators: true }
    ).select("_id name email role createdAt updatedAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  syncUser,
  getProfile,
  updateProfile,
};
