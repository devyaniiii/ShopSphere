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

// Convert a product name into a URL-friendly slug.
const createSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "product";

// Generate a unique slug, excluding the current product when updating.
const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let suffix = 2;

  while (
    await Product.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

// Create a product.
const createProduct = async (data) => {
  await validateCategory(data.category);

  const slug = await generateUniqueSlug(data.name);

  return Product.create({ ...data, slug });
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

// Get one active product by ID.
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

// Get one active product by slug, including related products.
const getProductBySlug = async (slug) => {
  const product = await Product.findOne({
    slug,
    isActive: true,
  }).populate("category", "name slug");

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  const categoryId = product.category?._id || product.category;

  const relatedProducts = await Product.find({
    category: categoryId,
    _id: { $ne: product._id },
    isActive: true,
  })
    .select("name slug price images")
    .limit(4)
    .lean();

  const productData = typeof product.toObject === "function" ? product.toObject() : { ...product };

  return {
    ...productData,
    relatedProducts,
  };
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

  const updateData = { ...data };

  if (updateData.name) {
    updateData.slug = await generateUniqueSlug(updateData.name, id);
  }

  const allowedFields = [
    "name",
    "slug",
    "description",
    "price",
    "stock",
    "category",
    "images",
    "isActive",
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updateData, field)) {
      product[field] = updateData[field];
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
  getProductBySlug,
  updateProduct,
  deleteProduct,
};
