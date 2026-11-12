
const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");

const router = express.Router();

const feedbackSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

router.post("/feedback", validate(feedbackSchema), (req, res) => {
  res.status(201).json({
    success: true,
    message: "Feedback data validated successfully.",
    data: req.validatedData,
  });
});

module.exports = router;
