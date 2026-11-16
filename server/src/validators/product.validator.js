const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID.");

const createProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required."),
    description: z.string().trim().min(1, "Product description is required."),
    price: z.number().positive("Price must be greater than 0."),
    stock: z.number().int("Stock must be a whole number.").min(0, "Stock cannot be negative."),
    category: objectIdSchema,
    images: z.array(z.string().trim().min(1)).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).optional(),
    category: objectIdSchema.optional(),
    images: z.array(z.string().trim().min(1)).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to update.",
  });

const productQuerySchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/)
    .optional(),
  sort: z.string().optional(),
  category: objectIdSchema.optional(),
  search: z.string().trim().optional(),
});

const productIdSchema = z.object({
  id: objectIdSchema,
});

const productSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Product slug is required.")
    .max(150, "Product slug is too long.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid product slug."),
});

const validate = (schema, property) => (req, res, next) => {
  const result = schema.safeParse(req[property]);

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

  if (property === "query") {
    req.validatedQuery = result.data;
  } else {
    req[property] = result.data;
  }

  next();
};

module.exports = {
  validateCreateProduct: validate(createProductSchema, "body"),
  validateUpdateProduct: validate(updateProductSchema, "body"),
  validateProductQuery: validate(productQuerySchema, "query"),
  validateProductId: validate(productIdSchema, "params"),
  validateProductSlug: validate(productSlugSchema, "params"),
};
