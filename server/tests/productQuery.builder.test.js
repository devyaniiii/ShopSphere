const buildProductQuery = require("../src/utils/buildProductQuery");

describe("buildProductQuery", () => {
  it("should apply default pagination and sorting", () => {
    expect(buildProductQuery()).toMatchObject({
      page: 1,
      limit: 10,
      skip: 0,
      sort: { createdAt: -1 },
      filter: { isActive: true },
    });
  });

  it("should combine category, price and stock filters", () => {
    const result = buildProductQuery({
      category: "507f1f77bcf86cd799439011",
      minPrice: "100",
      maxPrice: "500",
      inStock: "true",
      page: "2",
      limit: "5",
      sort: "price",
    });

    expect(result.filter).toEqual({
      isActive: true,
      category: "507f1f77bcf86cd799439011",
      price: { $gte: 100, $lte: 500 },
      stock: { $gt: 0 },
    });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.skip).toBe(5);
    expect(result.sort).toEqual({ price: 1 });
  });

  it("should filter out-of-stock products", () => {
    expect(buildProductQuery({ inStock: "false" }).filter.stock).toBe(0);
  });

  it("should support descending sorting", () => {
    expect(buildProductQuery({ sort: "-price" }).sort).toEqual({
      price: -1,
    });
  });

  it.each([
    [{ page: "0" }],
    [{ page: "-1" }],
    [{ limit: "101" }],
    [{ limit: "0" }],
    [{ sort: "invalidField" }],
    [{ minPrice: "500", maxPrice: "100" }],
    [{ inStock: "yes" }],
  ])("should reject invalid query values: %j", (query) => {
    expect(() => buildProductQuery(query)).toThrow();
  });
});
