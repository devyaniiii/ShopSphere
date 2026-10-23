
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
};

module.exports = {
  notFound,
  errorHandler
};
