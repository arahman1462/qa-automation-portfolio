import { test, expect } from "@playwright/test";
import { ApiClient } from "../utils/api-client";

/**
 * API Test Suite — Users & Authentication
 *
 * Covers: GET (list + single), POST, PUT, DELETE, 404 handling,
 * successful login, and unauthorized login.
 *
 * Uses reqres.in as a stable public mock API so the suite runs
 * without any local backend setup.
 */

test.describe("Users API", () => {
  let client: ApiClient;

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  test.describe("GET /users (list)", () => {
    test("returns paginated user list with correct schema", async () => {
      const body = await client.getUsers(1);

      expect(body.page).toBe(1);
      expect(body.per_page).toBeGreaterThan(0);
      expect(body.total).toBeGreaterThan(0);
      expect(body.total_pages).toBeGreaterThan(0);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("each user object contains required fields", async () => {
      const body = await client.getUsers(1);

      for (const user of body.data) {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("first_name");
        expect(user).toHaveProperty("last_name");
        expect(user).toHaveProperty("avatar");
        expect(typeof user.email).toBe("string");
        expect(user.email).toContain("@");
      }
    });

    test("page 2 returns different users than page 1", async () => {
      const page1 = await client.getUsers(1);
      const page2 = await client.getUsers(2);

      const page1Ids = page1.data.map((u) => u.id);
      const page2Ids = page2.data.map((u) => u.id);
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));

      expect(overlap.length).toBe(0);
    });
  });

  test.describe("GET /users/:id (single)", () => {
    test("returns correct user for valid id", async () => {
      const body = await client.getUser(2);

      expect(body.data.id).toBe(2);
      expect(body.data.email).toBeTruthy();
      expect(body.data.first_name).toBeTruthy();
    });

    test("returns 404 for non-existent user", async () => {
      await client.getUserNotFound(9999);
    });
  });

  test.describe("POST /users (create)", () => {
    test("creates user and returns id with timestamp", async () => {
      const payload = { name: "Asif Rahman", job: "QA Engineer" };
      const body = await client.createUser(payload);

      expect(body.id).toBeTruthy();
      expect(body.name).toBe(payload.name);
      expect(body.job).toBe(payload.job);
      expect(new Date(body.createdAt).toString()).not.toBe("Invalid Date");
    });

    test("createdAt timestamp is recent (within 10 seconds)", async () => {
      const before = Date.now();
      const body = await client.createUser({ name: "Test User", job: "SDET" });
      const after = Date.now();

      const created = new Date(body.createdAt).getTime();
      expect(created).toBeGreaterThanOrEqual(before - 5000);
      expect(created).toBeLessThanOrEqual(after + 5000);
    });
  });

  test.describe("PUT /users/:id (update)", () => {
    test("updates user and returns updatedAt timestamp", async () => {
      const body = await client.updateUser(2, {
        name: "Asif Rahman",
        job: "Senior QA",
      });

      expect(body.name).toBe("Asif Rahman");
      expect(body.job).toBe("Senior QA");
      expect(new Date(body.updatedAt).toString()).not.toBe("Invalid Date");
    });
  });

  test.describe("DELETE /users/:id", () => {
    test("returns 204 with no response body", async () => {
      await client.deleteUser(2);
    });
  });
});

test.describe("Authentication API", () => {
  let client: ApiClient;

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  test("successful login returns token", async () => {
    const body = await client.login({
      email: "eve.holt@reqres.in",
      password: "cityslicka",
    });

    expect(body.token).toBeTruthy();
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);
  });

  test("login without password returns 400 with error message", async () => {
    const body = await client.loginUnauthorized({
      email: "eve.holt@reqres.in",
    });

    expect(body.error).toBeTruthy();
    expect(typeof body.error).toBe("string");
  });
});
