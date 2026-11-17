const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID.");

const priceSchema = z
  .string()
  .regex(/^\d+(?:\.\d+)?$/, "Price must be a non-negative number.")
  .refine((value) => Number.isFinite(Number(value)), {
    message: "Price must be a valid number.",
  });

const productQuerySchema = z
  .object({
    page: z
      .string()
      .regex(/^[1-9]\d*$/, "Page must be a positive integer.")
      .optional(),

    limit: z
      .string()
      .regex(/^[1-9]\d*$/, "Limit must be a positive integer.")
      .refine((value) => value === undefined || Number(value) <= 100, {
        message: "Limit cannot exceed 100.",
      })
      .optional(),

    category: objectIdSchema.optional(),

    minPrice: priceSchema.optional(),

    maxPrice: priceSchema.optional(),

    inStock: z
      .enum(["true", "false"], {
        message: "inStock must be true or false.",
      })
      .optional(),

    sort: z
      .enum(
        [
          "name",
          "-name",
          "price",
          "-price",
          "stock",
          "-stock",
          "createdAt",
          "-createdAt",
          "updatedAt",
          "-updatedAt",
        ],
        {
          message: "Invalid sort value.",
        }
      )
      .optional(),

    q: z.string().max(100, "Search query cannot exceed 100 characters.").optional(),

    search: z.string().trim().optional(),
  })
  .strict()
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      Number(query.minPrice) <= Number(query.maxPrice),
    {
      message: "minPrice cannot be greater than maxPrice.",
      path: ["minPrice"],
    }
  );

const validateProductQuery = (req, res, next) => {
  const result = productQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed.",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.validatedQuery = result.data;
  return next();
};

module.exports = {
  validateProductQuery,
};
