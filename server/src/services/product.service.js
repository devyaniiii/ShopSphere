const Product = require("../models/Product");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");

// Validate that a category exists and is active.
const validateCategory = async (categoryId) => {
  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  });

  if (!category) {
    throw new AppError("Category not found or inactive.", 400);
  }

  return category;
};

// Create a product.
const createProduct = async (data) => {
  await validateCategory(data.category);

  return Product.create(data);
};

// Get products with pagination, filtering and sorting.
const getProducts = async (query) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);

  const allowedSortFields = ["name", "price", "stock", "createdAt", "updatedAt"];

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("Page must be a positive integer.", 400);
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("Limit must be between 1 and 100.", 400);
  }

  const requestedSort = query.sort || "-createdAt";
  const sortField = requestedSort.startsWith("-") ? requestedSort.slice(1) : requestedSort;

  if (!allowedSortFields.includes(sortField)) {
    throw new AppError("Invalid sort field.", 400);
  }

  const sort = {
    [sortField]: requestedSort.startsWith("-") ? -1 : 1,
  };

  const filter = { isActive: true };

  if (query.category) {
    await validateCategory(query.category);
    filter.category = query.category;
  }

  if (query.search) {
    const escapedSearch = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { description: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

// Get one product by ID.
const getProduct = async (id) => {
  const product = await Product.findOne({
    _id: id,
    isActive: true,
  }).populate("category", "name slug");

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  return product;
};

// Update a product.
const updateProduct = async (id, data) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  if (data.category) {
    await validateCategory(data.category);
  }

  const allowedFields = ["name", "description", "price", "stock", "category", "images", "isActive"];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      product[field] = data[field];
    }
  }

  return product.save();
};

// Delete a product.
const deleteProduct = async (id) => {
  const product = await Product.findById(id);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  await Product.findByIdAndDelete(id);
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
