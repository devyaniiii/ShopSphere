const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID.");

const createVariantSchema = z
  .object({
    sku: z.string().trim().min(1, "Variant SKU is required."),
    size: z.string().trim().min(1).optional(),
    color: z.string().trim().min(1).optional(),
    price: z.number().min(0, "Variant price cannot be negative.").optional(),
    stock: z.number().int("Variant stock must be a whole number.").min(0).optional(),
  })
  .strict();

const updateVariantSchema = z
  .object({
    sku: z.string().trim().min(1).optional(),
    size: z.string().trim().min(1).optional(),
    color: z.string().trim().min(1).optional(),
    price: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

const variantParamsSchema = z.object({
  id: objectIdSchema,
  variantId: objectIdSchema,
});

const validate = require("../middleware/validate");

module.exports = {
  validateCreateVariant: validate(createVariantSchema),
  validateUpdateVariant: validate(updateVariantSchema),
  validateVariantParams: validate(variantParamsSchema, "params"),
};
