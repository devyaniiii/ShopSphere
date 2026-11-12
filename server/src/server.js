
const env = require("./config/env");
const app = require("./app");
const connectDB = require("./config/db");

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(
      `ShopSphere server running in ${env.NODE_ENV} mode on port ${env.PORT}`
    );
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
