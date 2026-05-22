import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
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

function mapSqliteError(err: Error): { status: 400 | 409 | 503; message: string } | null {
  const msg = err.message;
  if (msg.includes("UNIQUE constraint failed")) {
    const field = msg.match(/UNIQUE constraint failed:\s+(\S+\.)?(\S+)/);
    return { status: 409, message: field ? `${field[2]} already exists` : "Duplicate entry" };
  }
  if (msg.includes("NOT NULL constraint failed")) {
    const field = msg.match(/NOT NULL constraint failed:\s+(\S+\.)?(\S+)/);
    return { status: 400, message: field ? `${field[2]} is required` : "Missing required field" };
  }
  if (msg.includes("FOREIGN KEY constraint failed")) {
    return { status: 400, message: "Referenced record not found" };
  }
  if (msg.includes("SQLITE_BUSY") || msg.includes("SQLITE_LOCKED")) {
    return { status: 503, message: "Database busy, try again" };
  }
  return null;
}

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode as any);
  }

  if (err.name === "ZodError") {
    const validationError = fromZodError(err as unknown as ZodError);
    return c.json({ error: validationError.message }, 400);
  }

  const sqlite = mapSqliteError(err);
  if (sqlite) {
    return c.json({ error: sqlite.message }, sqlite.status);
  }

  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
}
