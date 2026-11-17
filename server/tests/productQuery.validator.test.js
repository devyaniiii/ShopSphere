const { validateProductQuery } = require("../src/validators/productQuery.validator");

const runValidator = (query) => {
  const req = { query };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  validateProductQuery(req, res, next);

  return { req, res, next };
};

describe("productQuery validator", () => {
  it("should accept valid filter and pagination parameters", () => {
    const { req, next } = runValidator({
      category: "507f1f77bcf86cd799439011",
      minPrice: "100",
      maxPrice: "500",
      inStock: "true",
      sort: "-price",
      page: "2",
      limit: "20",
      q: "rose",
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.validatedQuery).toMatchObject({
      category: "507f1f77bcf86cd799439011",
      minPrice: "100",
      maxPrice: "500",
      inStock: "true",
      sort: "-price",
      page: "2",
      limit: "20",
      q: "rose",
    });
  });

  it.each([
    [{ minPrice: "-10" }],
    [{ maxPrice: "abc" }],
    [{ minPrice: "500", maxPrice: "100" }],
    [{ inStock: "yes" }],
    [{ sort: "unknown" }],
    [{ category: "invalid-id" }],
    [{ limit: "101" }],
    [{ page: "0" }],
    [{ unexpected: "value" }],
  ])("should reject invalid query parameters: %j", (query) => {
    const { res, next } = runValidator(query);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "fail",
        message: "Validation failed.",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
