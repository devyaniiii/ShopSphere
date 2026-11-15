const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, _next) => {
  let statusCode =
    err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  if (err.name === "CastError") {
    statusCode = 400;
  }

  if (err.code === 11000) {
    statusCode = 409;
  }

  if (err.name === "ValidationError") {
    statusCode = 422;
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message:
      statusCode >= 500 && !err.isOperational
        ? "Internal server error"
        : err.message || "Internal server error",
  });
};

module.exports = {
  notFound,
  errorHandler,
};