const {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
  validateProductId,
} = require("../src/validators/product.validator");

describe("Product validators", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("should accept valid product data", () => {
    req.body = {
      name: "Rose Plant",
      description: "A beautiful rose plant",
      price: 250,
      stock: 10,
      category: "507f1f77bcf86cd799439011",
    };

    validateCreateProduct(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should reject a negative product price", () => {
    req.body = {
      name: "Rose Plant",
      description: "A beautiful rose plant",
      price: -10,
      stock: 10,
      category: "507f1f77bcf86cd799439011",
    };

    validateCreateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject negative stock", () => {
    req.body = {
      name: "Rose Plant",
      description: "A beautiful rose plant",
      price: 250,
      stock: -1,
      category: "507f1f77bcf86cd799439011",
    };

    validateCreateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject a non-integer stock value", () => {
    req.body = {
      name: "Rose Plant",
      description: "A beautiful rose plant",
      price: 250,
      stock: 2.5,
      category: "507f1f77bcf86cd799439011",
    };

    validateCreateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject an invalid category ID", () => {
    req.body = {
      name: "Rose Plant",
      description: "A beautiful rose plant",
      price: 250,
      stock: 10,
      category: "invalid-id",
    };

    validateCreateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject an empty product update", () => {
    req.body = {};

    validateUpdateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should accept a valid product update", () => {
    req.body = { price: 300 };

    validateUpdateProduct(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should accept valid pagination query parameters", () => {
    req.query = { page: "1", limit: "10" };

    validateProductQuery(req, res, next);

    expect(req.validatedQuery).toEqual({ page: "1", limit: "10" });
    expect(next).toHaveBeenCalled();
  });

  it("should reject an invalid pagination query", () => {
    req.query = { page: "0" };

    validateProductQuery(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject an invalid product ID", () => {
    req.params = { id: "invalid-id" };

    validateProductId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
