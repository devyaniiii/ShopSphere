const requireRole = require("../src/middleware/requireRole");

describe("Role-based access middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("should return 401 when user is not authenticated", () => {
    const middleware = requireRole("admin");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 when customer accesses admin resource", () => {
    req.user = {
      id: "user123",
      role: "customer",
    };

    const middleware = requireRole("admin");

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow admin to access admin resource", () => {
    req.user = {
      id: "admin123",
      role: "admin",
    };

    const middleware = requireRole("admin");

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
