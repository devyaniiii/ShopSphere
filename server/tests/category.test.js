jest.mock("../src/models/Category", () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("../src/models/Product", () => ({
  exists: jest.fn(),
}));

const Category = require("../src/models/Category");
const Product = require("../src/models/Product");
const categoryService = require("../src/services/category.service");

describe("Category service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should create a category with an automatically generated slug", async () => {
      Category.findOne.mockResolvedValue(null);

      const category = {
        _id: "category123",
        name: "Indoor Plants",
        slug: "indoor-plants",
        description: "Plants for indoors",
        isActive: true,
      };

      Category.create.mockResolvedValue(category);

      const result = await categoryService.createCategory({
        name: "Indoor Plants",
        description: "Plants for indoors",
      });

      expect(Category.create).toHaveBeenCalledWith({
        name: "Indoor Plants",
        slug: "indoor-plants",
        description: "Plants for indoors",
        isActive: true,
      });

      expect(result).toEqual(category);
    });

    it("should reject an empty category name", async () => {
      await expect(categoryService.createCategory({ name: " " })).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(Category.create).not.toHaveBeenCalled();
    });

    it("should reject duplicate category names", async () => {
      Category.findOne.mockResolvedValue({ name: "Indoor Plants" });

      await expect(categoryService.createCategory({ name: "Indoor Plants" })).rejects.toMatchObject(
        {
          statusCode: 409,
        }
      );

      expect(Category.create).not.toHaveBeenCalled();
    });
  });

  describe("getCategories", () => {
    it("should return paginated categories", async () => {
      const categories = [{ name: "Indoor Plants", slug: "indoor-plants" }];

      Category.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(categories),
      });

      Category.countDocuments.mockResolvedValue(1);

      const result = await categoryService.getCategories({});

      expect(result.items).toEqual(categories);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      });
    });

    it("should reject an invalid page number", async () => {
      await expect(categoryService.getCategories({ page: "0" })).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("should reject a limit greater than 100", async () => {
      await expect(categoryService.getCategories({ limit: "101" })).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("updateCategory", () => {
    it("should update the category name and generate a new slug", async () => {
      Category.findById.mockResolvedValue({
        _id: "category123",
        name: "Indoor Plants",
        slug: "indoor-plants",
        save: jest.fn().mockImplementation(function () {
          return Promise.resolve(this);
        }),
      });

      Category.findOne.mockResolvedValue(null);

      const result = await categoryService.updateCategory("category123", {
        name: "Outdoor Plants",
      });

      expect(result.name).toBe("Outdoor Plants");
      expect(result.slug).toBe("outdoor-plants");
    });

    it("should return 404 when the category does not exist", async () => {
      Category.findById.mockResolvedValue(null);

      await expect(
        categoryService.updateCategory("missing123", {
          name: "New Name",
        })
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("deleteCategory", () => {
    it("should prevent deletion when products use the category", async () => {
      Category.findById.mockResolvedValue({
        _id: "category123",
      });

      Product.exists.mockResolvedValue({ _id: "product123" });

      await expect(categoryService.deleteCategory("category123")).rejects.toMatchObject({
        statusCode: 409,
      });

      expect(Category.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it("should delete a category when no products use it", async () => {
      Category.findById.mockResolvedValue({
        _id: "category123",
      });

      Product.exists.mockResolvedValue(null);
      Category.findByIdAndDelete.mockResolvedValue({
        _id: "category123",
      });

      await categoryService.deleteCategory("category123");

      expect(Product.exists).toHaveBeenCalledWith({
        category: "category123",
      });

      expect(Category.findByIdAndDelete).toHaveBeenCalledWith("category123");
    });
  });
});
