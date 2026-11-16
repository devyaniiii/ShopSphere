const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
  validateProductId,
  validateProductSlug,
} = require("../validators/product.validator");

const {
  validateCreateVariant,
  validateUpdateVariant,
  validateVariantParams,
} = require("../validators/variant.validator");

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const { addVariant, updateVariant, deleteVariant } = require("../controllers/variant.controller");

// Public: Get products with pagination and filters.
router.get("/", validateProductQuery, getProducts);

// Public: Get one product by slug, including related products.
router.get("/:slug", validateProductSlug, getProduct);

// Admin-only: Add a product variant.
router.post(
  "/:id/variants",
  auth,
  requireRole("admin"),
  validateProductId,
  validateCreateVariant,
  addVariant
);

// Admin-only: Update a product variant.
router.patch(
  "/:id/variants/:variantId",
  auth,
  requireRole("admin"),
  validateVariantParams,
  validateUpdateVariant,
  updateVariant
);

// Admin-only: Remove a product variant.
router.delete(
  "/:id/variants/:variantId",
  auth,
  requireRole("admin"),
  validateVariantParams,
  deleteVariant
);

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
