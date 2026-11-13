jest.mock("../src/config/firebaseAdmin", () => ({
  auth: jest.fn(),
}));

jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
}));

const firebaseAdmin = require("../src/config/firebaseAdmin");
const User = require("../src/models/User");
const auth = require("../src/middleware/auth");

describe("Authentication middleware", () => {
  let req;
  let res;
  let next;
  let verifyIdToken;

  beforeEach(() => {
    jest.clearAllMocks();

    verifyIdToken = jest.fn();

    firebaseAdmin.auth.mockReturnValue({ verifyIdToken });

    req = {
      headers: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("should return 401 when token is missing", async () => {
    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when token is invalid", async () => {
    req.headers.authorization = "Bearer invalid-token";
    verifyIdToken.mockRejectedValue(new Error("Invalid token"));

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach database user ID and role for a valid token", async () => {
    req.headers.authorization = "Bearer valid-token";

    verifyIdToken.mockResolvedValue({
      email: "customer@example.com",
    });

    const databaseUser = {
      _id: { toString: () => "user123" },
      email: "customer@example.com",
      role: "customer",
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(databaseUser),
    });

    await auth(req, res, next);

    expect(req.user.id).toBe("user123");
    expect(req.user.role).toBe("customer");
    expect(next).toHaveBeenCalled();
  });
});
