const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

// Public: Get all categories.
router.get("/", getCategories);

// Admin-only: Create a category.
router.post("/", auth, requireRole("admin"), createCategory);

// Admin-only: Update a category.
router.patch("/:id", auth, requireRole("admin"), updateCategory);

// Admin-only: Delete a category.
router.delete("/:id", auth, requireRole("admin"), deleteCategory);

module.exports = router;
