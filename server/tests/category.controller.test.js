jest.mock("../src/services/category.service", () => ({
  createCategory: jest.fn(),
  getCategories: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
}));

const categoryService = require("../src/services/category.service");
const categoryController = require("../src/controllers/category.controller");

describe("Category controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      query: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  it("should create a category and return 201", async () => {
    const category = {
      _id: "category123",
      name: "Indoor Plants",
      slug: "indoor-plants",
    };

    req.body = { name: "Indoor Plants" };
    categoryService.createCategory.mockResolvedValue(category);

    await categoryController.createCategory(req, res, next);

    expect(categoryService.createCategory).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: category,
    });
  });

  it("should return categories with status 200", async () => {
    const result = {
      items: [{ name: "Indoor Plants" }],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      },
    };

    req.query = { page: "1" };
    categoryService.getCategories.mockResolvedValue(result);

    await categoryController.getCategories(req, res, next);

    expect(categoryService.getCategories).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: result,
    });
  });

  it("should update a category and return 200", async () => {
    const category = {
      _id: "category123",
      name: "Outdoor Plants",
    };

    req.params.id = "category123";
    req.body = { name: "Outdoor Plants" };
    categoryService.updateCategory.mockResolvedValue(category);

    await categoryController.updateCategory(req, res, next);

    expect(categoryService.updateCategory).toHaveBeenCalledWith("category123", req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: category,
    });
  });

  it("should delete a category and return 204", async () => {
    req.params.id = "category123";
    categoryService.deleteCategory.mockResolvedValue(undefined);

    await categoryController.deleteCategory(req, res, next);

    expect(categoryService.deleteCategory).toHaveBeenCalledWith("category123");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("should pass service errors to the error handler", async () => {
    const error = new Error("Category not found.");
    error.statusCode = 404;

    categoryService.createCategory.mockRejectedValue(error);

    await categoryController.createCategory(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
