const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/product.service");

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);

  return res.status(201).json({
    status: "success",
    data: product,
  });
});

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.validatedQuery || req.query);

  return res.status(200).json({
    status: "success",
    data: result,
  });
});

// GET /api/products/:slug
const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);

  return res.status(200).json({
    status: "success",
    data: product,
  });
});

// PATCH /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  return res.status(200).json({
    status: "success",
    data: product,
  });
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);

  return res.status(204).send();
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
