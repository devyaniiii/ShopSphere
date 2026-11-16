jest.mock("../src/services/product.service", () => ({
  createProduct: jest.fn(),
  getProducts: jest.fn(),
  getProductBySlug: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

const productService = require("../src/services/product.service");
const productController = require("../src/controllers/product.controller");

describe("Product controller", () => {
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

  it("should create a product and return 201", async () => {
    const product = { _id: "product123", name: "Rose Plant" };
    req.body = { name: "Rose Plant" };
    productService.createProduct.mockResolvedValue(product);

    await productController.createProduct(req, res, next);

    expect(productService.createProduct).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: product,
    });
  });

  it("should return paginated products with status 200", async () => {
    const result = {
      items: [{ name: "Rose Plant" }],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
      },
    };

    req.validatedQuery = { page: "1", limit: "10" };
    productService.getProducts.mockResolvedValue(result);

    await productController.getProducts(req, res, next);

    expect(productService.getProducts).toHaveBeenCalledWith(req.validatedQuery);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: result,
    });
  });

  it("should return a single product with status 200", async () => {
    const product = { _id: "product123", name: "Rose Plant" };
    req.params.slug = "rose-plant";
    productService.getProductBySlug.mockResolvedValue(product);

    await productController.getProduct(req, res, next);

    expect(productService.getProductBySlug).toHaveBeenCalledWith("rose-plant");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: product,
    });
  });

  it("should update a product and return 200", async () => {
    const product = { _id: "product123", name: "Updated Rose" };
    req.params.id = "product123";
    req.body = { name: "Updated Rose" };
    productService.updateProduct.mockResolvedValue(product);

    await productController.updateProduct(req, res, next);

    expect(productService.updateProduct).toHaveBeenCalledWith("product123", req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: product,
    });
  });

  it("should delete a product and return 204", async () => {
    req.params.id = "product123";
    productService.deleteProduct.mockResolvedValue(undefined);

    await productController.deleteProduct(req, res, next);

    expect(productService.deleteProduct).toHaveBeenCalledWith("product123");
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("should pass service errors to the error handler", async () => {
    const error = new Error("Product not found.");
    error.statusCode = 404;
    productService.createProduct.mockRejectedValue(error);

    await productController.createProduct(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
