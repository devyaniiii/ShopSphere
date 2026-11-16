const Product = require("../models/Product");
const AppError = require("../utils/AppError");

// Find a product or return 404.
const findProduct = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  return product;
};

// Check whether another variant already uses this SKU.
const ensureUniqueSku = (product, sku, excludedVariantId = null) => {
  const normalizedSku = sku.trim().toUpperCase();

  const duplicate = product.variants.some(
    (variant) =>
      variant.sku?.toUpperCase() === normalizedSku &&
      variant._id.toString() !== excludedVariantId?.toString()
  );

  if (duplicate) {
    throw new AppError("This SKU already exists for this product.", 409);
  }
};

// Add a variant.
const addVariant = async (productId, data) => {
  const product = await findProduct(productId);

  ensureUniqueSku(product, data.sku);

  product.variants.push({
    ...data,
    sku: data.sku.trim().toUpperCase(),
  });

  await product.save();

  return product.variants[product.variants.length - 1];
};

// Update a variant.
const updateVariant = async (productId, variantId, data) => {
  const product = await findProduct(productId);
  const variant = product.variants.id(variantId);

  if (!variant) {
    throw new AppError("Product variant not found.", 404);
  }

  if (data.sku) {
    ensureUniqueSku(product, data.sku, variantId);
  }

  const allowedFields = ["sku", "size", "color", "price", "stock"];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      variant[field] = field === "sku" ? data[field].trim().toUpperCase() : data[field];
    }
  }

  await product.save();

  return variant;
};

// Remove a variant.
const deleteVariant = async (productId, variantId) => {
  const product = await findProduct(productId);
  const variant = product.variants.id(variantId);

  if (!variant) {
    throw new AppError("Product variant not found.", 404);
  }

  variant.deleteOne();
  await product.save();
};

module.exports = {
  addVariant,
  updateVariant,
  deleteVariant,
};
