const asyncHandler = require("../utils/asyncHandler");
const variantService = require("../services/variant.service");

// POST /api/products/:id/variants
const addVariant = asyncHandler(async (req, res) => {
  const variant = await variantService.addVariant(req.params.id, req.validatedData);

  return res.status(201).json({
    status: "success",
    data: variant,
  });
});

// PATCH /api/products/:id/variants/:variantId
const updateVariant = asyncHandler(async (req, res) => {
  const variant = await variantService.updateVariant(
    req.params.id,
    req.params.variantId,
    req.validatedData
  );

  return res.status(200).json({
    status: "success",
    data: variant,
  });
});

// DELETE /api/products/:id/variants/:variantId
const deleteVariant = asyncHandler(async (req, res) => {
  await variantService.deleteVariant(req.params.id, req.params.variantId);

  return res.status(204).send();
});

module.exports = {
  addVariant,
  updateVariant,
  deleteVariant,
};
