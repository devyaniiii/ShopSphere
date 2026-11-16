jest.mock("../src/models/Product", () => ({
  findById: jest.fn(),
}));

const Product = require("../src/models/Product");
const variantService = require("../src/services/variant.service");

const createProduct = (variants = []) => {
  const product = {
    variants,
    save: jest.fn().mockResolvedValue(true),
  };

  product.variants.id = jest.fn((id) =>
    product.variants.find((variant) => variant._id.toString() === id)
  );

  return product;
};

describe("Variant service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addVariant", () => {
    it("should add a variant and convert its SKU to uppercase", async () => {
      const product = createProduct();
      Product.findById.mockResolvedValue(product);

      const result = await variantService.addVariant("product123", {
        sku: "wh-blk-001",
        color: "Black",
        price: 1999,
        stock: 15,
      });

      expect(result.sku).toBe("WH-BLK-001");
      expect(result.color).toBe("Black");
      expect(product.save).toHaveBeenCalled();
    });

    it("should reject a duplicate SKU within the same product", async () => {
      const product = createProduct([
        {
          _id: { toString: () => "variant123" },
          sku: "WH-BLK-001",
        },
      ]);

      Product.findById.mockResolvedValue(product);

      await expect(
        variantService.addVariant("product123", {
          sku: "wh-blk-001",
        })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(product.save).not.toHaveBeenCalled();
    });

    it("should reject when the product does not exist", async () => {
      Product.findById.mockResolvedValue(null);

      await expect(
        variantService.addVariant("product123", { sku: "WH-BLK-001" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("updateVariant", () => {
    it("should update variant price and stock", async () => {
      const variant = {
        _id: { toString: () => "variant123" },
        sku: "WH-BLK-001",
        price: 1999,
        stock: 15,
      };

      const product = createProduct([variant]);
      Product.findById.mockResolvedValue(product);

      const result = await variantService.updateVariant("product123", "variant123", {
        price: 2199,
        stock: 20,
      });

      expect(result.price).toBe(2199);
      expect(result.stock).toBe(20);
      expect(product.save).toHaveBeenCalled();
    });

    it("should reject when the variant does not exist", async () => {
      const product = createProduct();
      Product.findById.mockResolvedValue(product);

      await expect(
        variantService.updateVariant("product123", "variant123", {
          price: 2199,
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("deleteVariant", () => {
    it("should remove an existing variant", async () => {
      const variant = {
        _id: { toString: () => "variant123" },
        sku: "WH-BLK-001",
        deleteOne: jest.fn(),
      };

      const product = createProduct([variant]);
      Product.findById.mockResolvedValue(product);

      await variantService.deleteVariant("product123", "variant123");

      expect(variant.deleteOne).toHaveBeenCalled();
      expect(product.save).toHaveBeenCalled();
    });
  });
});
