jest.mock("../src/models/Product", () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../src/models/Category", () => ({
  findOne: jest.fn(),
}));

const Product = require("../src/models/Product");
const Category = require("../src/models/Category");
const productService = require("../src/services/product.service");

describe("Product service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should create a product when its category is active", async () => {
      const productData = {
        name: "Rose Plant",
        description: "A beautiful rose plant",
        price: 250,
        stock: 10,
        category: "507f1f77bcf86cd799439011",
      };

      const product = { _id: "product123", ...productData };

      Category.findOne.mockResolvedValue({ _id: productData.category });
      Product.create.mockResolvedValue(product);

      const result = await productService.createProduct(productData);

      expect(Category.findOne).toHaveBeenCalledWith({
        _id: productData.category,
        isActive: true,
      });
      expect(Product.create).toHaveBeenCalledWith(productData);
      expect(result).toEqual(product);
    });

    it("should reject a missing or inactive category", async () => {
      Category.findOne.mockResolvedValue(null);

      await expect(
        productService.createProduct({
          name: "Rose Plant",
          category: "507f1f77bcf86cd799439011",
        })
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(Product.create).not.toHaveBeenCalled();
    });
  });

  describe("getProducts", () => {
    it("should return products with pagination", async () => {
      const products = [{ name: "Rose Plant", price: 250 }];

      Product.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(products),
      });

      Product.countDocuments.mockResolvedValue(1);

      const result = await productService.getProducts({});

      expect(result.items).toEqual(products);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      });
    });

    it("should reject an invalid page number", async () => {
      await expect(productService.getProducts({ page: "0" })).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("should reject a limit greater than 100", async () => {
      await expect(productService.getProducts({ limit: "101" })).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("should reject an invalid sort field", async () => {
      await expect(productService.getProducts({ sort: "invalidField" })).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("getProduct", () => {
    it("should return a product by ID", async () => {
      const product = { _id: "product123", name: "Rose Plant" };

      Product.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(product),
      });

      const result = await productService.getProduct("product123");

      expect(Product.findOne).toHaveBeenCalledWith({
        _id: "product123",
        isActive: true,
      });
      expect(result).toEqual(product);
    });

    it("should reject when the product does not exist", async () => {
      Product.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(productService.getProduct("product123")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("updateProduct", () => {
    it("should update an existing product", async () => {
      const product = {
        _id: "product123",
        name: "Old Name",
        save: jest.fn().mockResolvedValue(true),
      };

      Product.findById.mockResolvedValue(product);

      const result = await productService.updateProduct("product123", {
        name: "New Name",
        price: 300,
      });

      expect(product.name).toBe("New Name");
      expect(product.price).toBe(300);
      expect(product.save).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should reject an update when the product does not exist", async () => {
      Product.findById.mockResolvedValue(null);

      await expect(
        productService.updateProduct("product123", { name: "New Name" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should validate a new category before updating", async () => {
      Product.findById.mockResolvedValue({
        _id: "product123",
        save: jest.fn(),
      });

      Category.findOne.mockResolvedValue(null);

      await expect(
        productService.updateProduct("product123", {
          category: "507f1f77bcf86cd799439011",
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("deleteProduct", () => {
    it("should delete an existing product", async () => {
      Product.findById.mockResolvedValue({ _id: "product123" });
      Product.findByIdAndDelete.mockResolvedValue({ _id: "product123" });

      await productService.deleteProduct("product123");

      expect(Product.findByIdAndDelete).toHaveBeenCalledWith("product123");
    });

    it("should reject when the product does not exist", async () => {
      Product.findById.mockResolvedValue(null);

      await expect(productService.deleteProduct("product123")).rejects.toMatchObject({
        statusCode: 404,
      });

      expect(Product.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
