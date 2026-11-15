
const { Router } = require("express");
const pingController = require("../controllers/ping.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = Router();

router.get("/", asyncHandler(pingController.ping));

module.exports = router;
