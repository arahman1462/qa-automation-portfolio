import { test, expect } from "@playwright/test";
import { ApiClient, User } from "../utils/api-client";

/**
 * Data Integrity Test Suite
 *
 * Validates response payload structure, data types, field constraints,
 * and cross-field consistency -- the same logic applied to API responses
 * as you would apply in SQL validation pipelines.
 *
 * Demonstrates: schema validation, field-level assertions, boundary checks,
 * and data consistency across paginated responses.
 */

test.describe("User Data Integrity", () => {
  let client: ApiClient;

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  test.describe("Schema Validation", () => {
    test("all user fields conform to expected types", async () => {
      const body = await client.getUsers(1);

      for (const user of body.data) {
        expect(typeof user.id).toBe("number");
        expect(typeof user.email).toBe("string");
        expect(typeof user.first_name).toBe("string");
        expect(typeof user.last_name).toBe("string");
        expect(typeof user.avatar).toBe("string");
      }
    });

    test("user IDs are positive integers", async () => {
      const body = await client.getUsers(1);

      for (const user of body.data) {
        expect(user.id).toBeGreaterThan(0);
        expect(Number.isInteger(user.id)).toBe(true);
      }
    });

    test("email fields are valid format", async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const body = await client.getUsers(1);

      for (const user of body.data) {
        expect(emailRegex.test(user.email)).toBe(true);
      }
    });

    test("avatar URLs are valid and absolute", async () => {
      const body = await client.getUsers(1);

      for (const user of body.data) {
        expect(() => new URL(user.avatar!)).not.toThrow();
        expect(user.avatar).toMatch(/^https?:\/\//);
      }
    });

    test("name fields are non-empty strings", async () => {
      const body = await client.getUsers(1);

      for (const user of body.data) {
        expect(user.first_name!.trim().length).toBeGreaterThan(0);
        expect(user.last_name!.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Pagination Consistency", () => {
    test("per_page count matches actual records returned", async () => {
      const body = await client.getUsers(1);
      expect(body.data.length).toBe(body.per_page);
    });

    test("total_pages calculation is consistent with total and per_page", async () => {
      const body = await client.getUsers(1);
      const expectedPages = Math.ceil(body.total / body.per_page);
      expect(body.total_pages).toBe(expectedPages);
    });

    test("no duplicate user IDs across pages", async () => {
      const page1 = await client.getUsers(1);
      const page2 = await client.getUsers(2);

      const allIds = [
        ...page1.data.map((u) => u.id),
        ...page2.data.map((u) => u.id),
      ];
      const uniqueIds = new Set(allIds);

      expect(uniqueIds.size).toBe(allIds.length);
    });

    test("user IDs are unique within a single page", async () => {
      const body = await client.getUsers(1);
      const ids = body.data.map((u) => u.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  test.describe("Single Resource Consistency", () => {
    test("single user response matches list data for same ID", async () => {
      const list = await client.getUsers(1);
      const firstUser = list.data[0];

      const single = await client.getUser(firstUser.id!);

      expect(single.data.id).toBe(firstUser.id);
      expect(single.data.email).toBe(firstUser.email);
      expect(single.data.first_name).toBe(firstUser.first_name);
      expect(single.data.last_name).toBe(firstUser.last_name);
    });
  });

  test.describe("Write Operation Data Integrity", () => {
    test("created user payload is echoed back correctly", async () => {
      const payload = { name: "Jane Smith", job: "QA Lead" };
      const created = await client.createUser(payload);

      expect(created.name).toBe(payload.name);
      expect(created.job).toBe(payload.job);
      expect(created.id).toBeTruthy();
    });

    test("update operation returns only changed fields", async () => {
      const updated = await client.updateUser(2, { job: "Automation Engineer" });

      expect(updated.job).toBe("Automation Engineer");
      expect(updated.updatedAt).toBeTruthy();
    });

    test("updatedAt is a valid ISO 8601 timestamp", async () => {
      const updated = await client.updateUser(2, { name: "Test" });
      const date = new Date(updated.updatedAt);

      expect(date.toString()).not.toBe("Invalid Date");
      expect(date.getFullYear()).toBeGreaterThanOrEqual(2024);
    });
  });
});
