

const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const pingRoutes = require("./routes/ping.routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", healthRoutes);
app.use("/api/ping", pingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
