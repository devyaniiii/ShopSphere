const asyncHandler = require("../utils/asyncHandler");
const categoryService = require("../services/category.service");

// POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body || {});

  return res.status(201).json({
    status: "success",
    data: category,
  });
});

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getCategories(req.query);

  return res.status(200).json({
    status: "success",
    data: result,
  });
});

// PATCH /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body || {});

  return res.status(200).json({
    status: "success",
    data: category,
  });
});

// DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);

  return res.status(204).send();
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
