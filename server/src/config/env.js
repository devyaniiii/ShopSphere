
const dotenv = require("dotenv");

dotenv.config();

const requiredVariables = ["PORT", "MONGODB_URI"];

const missingVariables = requiredVariables.filter(
  (variable) => !process.env[variable] || !process.env[variable].trim()
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(", ")}`
  );
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT),
  MONGODB_URI: process.env.MONGODB_URI,
  isDevelopment: (process.env.NODE_ENV || "development") === "development",
  isProduction: process.env.NODE_ENV === "production",
  CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:4200",
};

if (!Number.isInteger(env.PORT) || env.PORT < 1 || env.PORT > 65535) {
  throw new Error("PORT must be a valid port number between 1 and 65535.");
}

if (!["development", "production", "test"].includes(env.NODE_ENV)) {
  throw new Error("NODE_ENV must be development, production, or test.");
}

module.exports = Object.freeze(env);
