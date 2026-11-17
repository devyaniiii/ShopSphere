const AppError = require("./AppError");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT = "-createdAt";

const ALLOWED_SORT_FIELDS = ["name", "price", "stock", "createdAt", "updatedAt"];

const buildProductQuery = (query = {}) => {
  const page = query.page === undefined ? DEFAULT_PAGE : Number(query.page);
  const limit = query.limit === undefined ? DEFAULT_LIMIT : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("Page must be a positive integer.", 400);
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("Limit must be between 1 and 100.", 400);
  }

  const requestedSort = query.sort || DEFAULT_SORT;
  const sortField = requestedSort.startsWith("-") ? requestedSort.slice(1) : requestedSort;

  if (!ALLOWED_SORT_FIELDS.includes(sortField)) {
    throw new AppError("Invalid sort field.", 400);
  }

  const sort = {
    [sortField]: requestedSort.startsWith("-") ? -1 : 1,
  };

  const filter = {
    isActive: true,
  };

  if (query.category) {
    filter.category = query.category;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};

    if (query.minPrice !== undefined) {
      filter.price.$gte = Number(query.minPrice);
    }

    if (query.maxPrice !== undefined) {
      filter.price.$lte = Number(query.maxPrice);
    }

    if (
      filter.price.$gte !== undefined &&
      filter.price.$lte !== undefined &&
      filter.price.$gte > filter.price.$lte
    ) {
      throw new AppError("minPrice cannot be greater than maxPrice.", 400);
    }
  }

  if (query.inStock === "true") {
    filter.stock = { $gt: 0 };
  } else if (query.inStock === "false") {
    filter.stock = 0;
  } else if (query.inStock !== undefined) {
    throw new AppError("inStock must be true or false.", 400);
  }

  return {
    filter,
    sort,
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

module.exports = buildProductQuery;
