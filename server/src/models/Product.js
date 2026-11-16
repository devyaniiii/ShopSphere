const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  sku: {
    type: String,
    required: [true, "Variant SKU is required"],
    uppercase: true,
    trim: true,
  },
  price: {
    type: Number,
    min: [0, "Variant price cannot be negative"],
  },
  stock: {
    type: Number,
    min: [0, "Variant stock cannot be negative"],
    validate: {
      validator: (value) => value === undefined || Number.isInteger(value),
      message: "Variant stock must be a whole number",
    },
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate SKUs within the same product.
productSchema.pre("validate", function () {
  const skus = this.variants.map((variant) => variant.sku?.trim().toUpperCase());
  const validSkus = skus.filter(Boolean);

  if (new Set(validSkus).size !== validSkus.length) {
    this.invalidate("variants", "Variant SKUs must be unique within a product.");
  }
});

// Prevent the same SKU from being used by different products.
productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
