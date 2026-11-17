const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
} = require("../validators/product.validator");

const { validateProductQuery } = require("../validators/productQuery.validator");

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

// Public: Get products with pagination, filtering and sorting.
router.get("/", validateProductQuery, getProducts);

// Public: Get a single product.
router.get("/:id", validateProductId, getProduct);

// Admin-only: Create a product.
router.post("/", auth, requireRole("admin"), validateCreateProduct, createProduct);

// Admin-only: Update a product.
router.patch(
  "/:id",
  auth,
  requireRole("admin"),
  validateProductId,
  validateUpdateProduct,
  updateProduct
);

// Admin-only: Delete a product.
router.delete("/:id", auth, requireRole("admin"), validateProductId, deleteProduct);

module.exports = router;
