jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
}));

const User = require("../src/models/User");

const { syncUser, getProfile, updateProfile } = require("../src/controllers/user.controller");

describe("User profile controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      firebaseUser: {
        uid: "firebase123",
        email: "customer@example.com",
        name: "Test Customer",
        emailVerified: true,
      },
      user: {
        id: "user123",
        role: "customer",
      },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe("syncUser", () => {
    it("should create a new customer account", async () => {
      User.findOne.mockResolvedValue(null);

      const newUser = {
        _id: "user123",
        name: "Test Customer",
        email: "customer@example.com",
        role: "customer",
      };

      User.create.mockResolvedValue(newUser);

      await syncUser(req, res, next);

      expect(User.findOne).toHaveBeenNthCalledWith(1, {
        firebaseUid: "firebase123",
      });

      expect(User.create).toHaveBeenCalledWith({
        firebaseUid: "firebase123",
        name: "Test Customer",
        email: "customer@example.com",
        role: "customer",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            role: "customer",
          }),
        })
      );
    });

    it("should reject linking an existing account with an unverified email", async () => {
      req.firebaseUser.emailVerified = false;

      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        email: "customer@example.com",
        firebaseUid: undefined,
      });

      await syncUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(User.create).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject an account linked to another Firebase UID", async () => {
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        email: "customer@example.com",
        firebaseUid: "another-firebase-uid",
      });

      await syncUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe("getProfile", () => {
    it("should return the authenticated user's profile", async () => {
      const profile = {
        _id: "user123",
        name: "Test Customer",
        email: "customer@example.com",
        role: "customer",
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(profile),
      });

      await getProfile(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: profile,
      });
    });

    it("should return 404 when profile does not exist", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await getProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateProfile", () => {
    it("should update the user's name", async () => {
      req.body = {
        name: "Updated Customer",
      };

      const updatedUser = {
        _id: "user123",
        name: "Updated Customer",
        email: "customer@example.com",
        role: "customer",
      };

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser),
      });

      await updateProfile(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { $set: { name: "Updated Customer" } },
        { new: true, runValidators: true }
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should prevent users from changing their own role", async () => {
      req.body = {
        role: "admin",
      };

      await updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should reject an invalid name", async () => {
      req.body = {
        name: " ",
      };

      await updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});
