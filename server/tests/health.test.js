const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  it("should return HTTP 200 and a successful health response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});
