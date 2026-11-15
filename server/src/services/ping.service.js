
const getPingStatus = () => ({
  message: "ShopSphere API is running",
  timestamp: new Date().toISOString()
});

module.exports = { getPingStatus };
