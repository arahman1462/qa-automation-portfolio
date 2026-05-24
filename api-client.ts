import { APIRequestContext, expect } from "@playwright/test";

export interface User {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T;
  support?: { url: string; text: string };
}

export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: T[];
}

/**
 * Thin wrapper around Playwright's APIRequestContext.
 * Centralises base URL, default headers, and response validation
 * so individual test files stay focused on assertions.
 */
export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async getUsers(page = 1): Promise<PaginatedResponse<User>> {
    const response = await this.request.get(`/api/users?page=${page}`);
    expect(response.status()).toBe(200);
    return response.json();
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await this.request.get(`/api/users/${id}`);
    expect(response.status()).toBe(200);
    return response.json();
  }

  async getUserNotFound(id: number): Promise<void> {
    const response = await this.request.get(`/api/users/${id}`);
    expect(response.status()).toBe(404);
  }

  async createUser(payload: {
    name: string;
    job: string;
  }): Promise<{ id: string; name: string; job: string; createdAt: string }> {
    const response = await this.request.post(`/api/users`, { data: payload });
    expect(response.status()).toBe(201);
    return response.json();
  }

  async updateUser(
    id: number,
    payload: { name?: string; job?: string }
  ): Promise<{ name: string; job: string; updatedAt: string }> {
    const response = await this.request.put(`/api/users/${id}`, {
      data: payload,
    });
    expect(response.status()).toBe(200);
    return response.json();
  }

  async deleteUser(id: number): Promise<void> {
    const response = await this.request.delete(`/api/users/${id}`);
    expect(response.status()).toBe(204);
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string }> {
    const response = await this.request.post(`/api/login`, {
      data: credentials,
    });
    expect(response.status()).toBe(200);
    return response.json();
  }

  async loginUnauthorized(credentials: {
    email: string;
    password?: string;
  }): Promise<{ error: string }> {
    const response = await this.request.post(`/api/login`, {
      data: credentials,
    });
    expect(response.status()).toBe(400);
    return response.json();
  }
}
