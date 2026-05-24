import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { Hono } from "hono";
import { createDbClient, migrationsFolder } from "@ncm/database";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { registerUser, loginUser, refreshTokensAction, logoutUser } from "../auth-service.js";
import { createApiKey } from "../api-key-service.js";
import { setSetting } from "../settings-service.js";
import { jwtAuth } from "../../middleware/auth.js";
import { signAccessToken, signRefreshToken } from "@ncm/auth";
import type { Env } from "../../config.js";

const testEnv: Env = {
  NODE_ENV: "test",
  DATABASE_URL: ":memory:",
  REDIS_URL: "redis://localhost:6379",
  PORT: 3001,
  JWT_SECRET: "a".repeat(64),
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  COOKIE_ENCRYPTION_KEY: "b".repeat(64),
};

let db: ReturnType<typeof createDbClient>;

beforeAll(() => {
  db = createDbClient(":memory:");
  migrate(db, { migrationsFolder });
  setSetting(db, "allow_registration", "true");
});

describe("auth-service", () => {
  const testUser = {
    email: "test@example.com",
    password: "password123",
    username: "testuser",
  };

  let refreshToken: string;

  it("should register a new user", async () => {
    const result = await registerUser(db, testEnv, testUser);
    expect(result.user.email).toBe(testUser.email);
    expect(result.user.username).toBe(testUser.username);
    expect(result.user.role).toBe("admin"); // first user becomes admin
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    refreshToken = result.refreshToken;
  });

  it("should reject duplicate email registration", async () => {
    await expect(
      registerUser(db, testEnv, testUser),
    ).rejects.toThrow("Email already registered");
  });

  it("should reject duplicate username registration", async () => {
    await expect(
      registerUser(db, testEnv, {
        email: "other@example.com",
        password: "password123",
        username: testUser.username,
      }),
    ).rejects.toThrow("Username already taken");
  });

  it("should login with email", async () => {
    const result = await loginUser(db, testEnv, {
      login: testUser.email,
      password: testUser.password,
    });
    expect(result.user.email).toBe(testUser.email);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it("should login with username", async () => {
    const result = await loginUser(db, testEnv, {
      login: testUser.username,
      password: testUser.password,
    });
    expect(result.user.email).toBe(testUser.email);
  });

  it("should reject login with wrong password", async () => {
    await expect(
      loginUser(db, testEnv, {
        login: testUser.email,
        password: "wrongpassword",
      }),
    ).rejects.toThrow("Invalid email/username or password");
  });

  it("should reject login for non-existent user", async () => {
    await expect(
      loginUser(db, testEnv, {
        login: "nonexistent@example.com",
        password: "password123",
      }),
    ).rejects.toThrow("Invalid email/username or password");
  });

  it("should refresh tokens", async () => {
    const result = await refreshTokensAction(db, testEnv, refreshToken);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.refreshToken).not.toBe(refreshToken); // rotated

    // Old token should be revoked
    await expect(
      refreshTokensAction(db, testEnv, refreshToken),
    ).rejects.toThrow("Refresh token revoked");

    refreshToken = result.refreshToken;
  });

  it("should reject revoked refresh token", async () => {
    await expect(
      refreshTokensAction(db, testEnv, "invalid-token"),
    ).rejects.toThrow("Invalid refresh token");
  });

  it("should logout and revoke token", async () => {
    await logoutUser(db, refreshToken);
    await expect(
      refreshTokensAction(db, testEnv, refreshToken),
    ).rejects.toThrow("Refresh token revoked");
  });
});

describe("registration disabled", () => {
  let disabledDb: ReturnType<typeof createDbClient>;

  beforeAll(() => {
    disabledDb = createDbClient(":memory:");
    migrate(disabledDb, { migrationsFolder });
    // Don't set allow_registration - defaults to disabled
  });

  it("should reject registration when disabled", async () => {
    // First registration becomes admin even when disabled
    await registerUser(disabledDb, testEnv, {
      email: "admin@test.com",
      password: "password123",
      username: "adminuser",
    });

    // Second registration should fail
    await expect(
      registerUser(disabledDb, testEnv, {
        email: "user@test.com",
        password: "password123",
        username: "regularuser",
      }),
    ).rejects.toThrow("Registration is disabled");
  });
});

describe("api-key-service", () => {
  let userId: string;

  beforeAll(async () => {
    // Reuse a user from the auth tests
    const result = await registerUser(db, testEnv, {
      email: "apikey-test@example.com",
      password: "password123",
      username: "apikeytest",
    });
    userId = result.user.id;
  });

  it("should create an API key", async () => {
    const key = await createApiKey(db, userId, "Test Key", testEnv);
    expect(key.name).toBe("Test Key");
    expect(key.fullKey).toMatch(/^ncm_/);
    expect(key.id).toBeTruthy();
  });
});

describe("jwtAuth", () => {
  it("should accept access tokens and reject refresh tokens", async () => {
    const app = new Hono();
    app.use("/protected", jwtAuth(testEnv.JWT_SECRET));
    app.get("/protected", (c) => c.json({ ok: true }));

    const accessToken = await signAccessToken(
      "user-1",
      "user@example.com",
      testEnv.JWT_SECRET,
      testEnv.JWT_ACCESS_EXPIRES_IN,
    );
    const refreshToken = (await signRefreshToken(
      "user-1",
      testEnv.JWT_SECRET,
      testEnv.JWT_REFRESH_EXPIRES_IN,
    )).token;

    const accessResponse = await app.request("/protected", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(accessResponse.status).toBe(200);

    const refreshResponse = await app.request("/protected", {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    expect(refreshResponse.status).toBe(401);
  });
});
