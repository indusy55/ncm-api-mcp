import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { fromZodError } from "zod-validation-error";
import type { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: StatusCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode as any);
  }

  if (err.name === "ZodError") {
    const validationError = fromZodError(err as unknown as ZodError);
    return c.json({ error: validationError.message }, 400);
  }

  if (err.name === "JwtTokenExpired" || err.name === "JwtTokenInvalid") {
    return c.json({ error: "Unauthorized" }, 401);
  }

  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
}
