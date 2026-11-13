const express = require("express");

const logger = require("./middleware/logger");
const corsMiddleware = require("./config/cors");

const healthRoutes = require("./routes/health.routes");
const pingRoutes = require("./routes/ping.routes");
const validationRoutes = require("./routes/validation.routes");

const { notFound, errorHandler } = require("./middleware/error");
const userRoutes = require("./routes/user.routes");
const app = express();

// Request logging
app.use(logger);

// CORS configuration
app.use(corsMiddleware);

// Parse JSON request bodies
app.use(express.json());

// API routes
app.use("/api", healthRoutes);
app.use("/api/ping", pingRoutes);
app.use("/api/validation", validationRoutes);
app.use("/api/users", userRoutes);

// 404 and error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
