
const pingService = require("../services/ping.service");

const ping = (req, res) => {
  const data = pingService.getPingStatus();

  res.status(200).json({
    status: "success",
    data
  });
};

module.exports = { ping };
