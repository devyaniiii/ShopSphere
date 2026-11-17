const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const MAX_SEARCH_LENGTH = 100;

// Clean and validate the keyword received from the q query parameter.
const sanitizeSearchQuery = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new AppError("Search query must be a string.", 400);
  }

  if (value.length > MAX_SEARCH_LENGTH) {
    throw new AppError(`Search query cannot exceed ${MAX_SEARCH_LENGTH} characters.`, 400);
  }

  const sanitizedQuery = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\$/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return sanitizedQuery;
};

// Search active products using MongoDB text search and relevance sorting.
const searchProducts = async (searchQuery, query = {}) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("Page must be a positive integer.", 400);
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("Limit must be between 1 and 100.", 400);
  }

  const filter = {
    isActive: true,
    $text: {
      $search: searchQuery,
    },
  };

  if (query.category) {
    filter.category = query.category;
  }

  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    Product.find(filter, {
      score: {
        $meta: "textScore",
      },
    })
      .populate("category", "name slug")
      .sort({
        score: {
          $meta: "textScore",
        },
        createdAt: -1,
      })
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

module.exports = {
  sanitizeSearchQuery,
  searchProducts,
};
