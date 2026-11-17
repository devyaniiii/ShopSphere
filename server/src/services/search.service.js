const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const buildProductQuery = require("../utils/buildProductQuery");

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
    .split("")
    .map((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127 ? " " : character;
    })
    .join("")
    .replace(/\$/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return sanitizedQuery;
};

// Search active products using MongoDB text search and relevance sorting.
const searchProducts = async (searchQuery, query = {}) => {
  const { filter, sort, page, limit, skip } = buildProductQuery(query);

  filter.$text = {
    $search: searchQuery,
  };

  const searchSort = {
    score: {
      $meta: "textScore",
    },
    ...sort,
  };

  const [items, totalItems] = await Promise.all([
    Product.find(filter, {
      score: {
        $meta: "textScore",
      },
    })
      .populate("category", "name slug")
      .sort(searchSort)
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
