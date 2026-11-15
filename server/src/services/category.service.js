const Category = require("../models/Category");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

// Convert a category name into a URL-friendly slug.
const createSlug = (name) => {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
};

// Generate a slug that is not already used by another category.
const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (
    await Category.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

// Create a category.
const createCategory = async (data) => {
  const { name, description = "", isActive = true } = data;

  if (typeof name !== "string" || !name.trim()) {
    throw new AppError("Category name is required.", 400);
  }

  if (typeof description !== "string") {
    throw new AppError("Description must be a string.", 400);
  }

  if (typeof isActive !== "boolean") {
    throw new AppError("isActive must be a boolean.", 400);
  }

  const trimmedName = name.trim();

  const existingCategory = await Category.findOne({
    name: { $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  });

  if (existingCategory) {
    throw new AppError("A category with this name already exists.", 409);
  }

  const slug = await generateUniqueSlug(trimmedName);

  return Category.create({
    name: trimmedName,
    slug,
    description: description.trim(),
    isActive,
  });
};

// Get categories with pagination and sorting.
const getCategories = async (query) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);
  const allowedSortFields = ["name", "createdAt", "updatedAt"];

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

  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    Category.find().sort(sort).skip(skip).limit(limit).lean(),
    Category.countDocuments(),
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

// Update a category.
const updateCategory = async (id, data) => {
  const allowedFields = ["name", "description", "isActive"];
  const fields = Object.keys(data);

  if (fields.length === 0 || fields.some((field) => !allowedFields.includes(field))) {
    throw new AppError("Provide valid category fields to update.", 400);
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  if (Object.prototype.hasOwnProperty.call(data, "name")) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new AppError("Category name must be a non-empty string.", 400);
    }

    const trimmedName = data.name.trim();

    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
      _id: { $ne: category._id },
    });

    if (existingCategory) {
      throw new AppError("A category with this name already exists.", 409);
    }

    category.name = trimmedName;
    category.slug = await generateUniqueSlug(trimmedName, category._id);
  }

  if (Object.prototype.hasOwnProperty.call(data, "description")) {
    if (typeof data.description !== "string") {
      throw new AppError("Description must be a string.", 400);
    }

    category.description = data.description.trim();
  }

  if (Object.prototype.hasOwnProperty.call(data, "isActive")) {
    if (typeof data.isActive !== "boolean") {
      throw new AppError("isActive must be a boolean.", 400);
    }

    category.isActive = data.isActive;
  }

  return category.save();
};

// Delete a category only when no products use it.
const deleteCategory = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  const hasProducts = await Product.exists({ category: category._id });

  if (hasProducts) {
    throw new AppError("Cannot delete a category that has associated products.", 409);
  }

  await Category.findByIdAndDelete(id);
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
