import { describe, expect, it } from "vitest";
import { ok, err, appError, httpStatus } from "@/lib/errors";

describe("Result pattern", () => {
  it("creates ok results", () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("creates error results", () => {
    const error = appError("NOT_FOUND", "Item not found");
    const result = err(error);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
      expect(result.error.message).toBe("Item not found");
    }
  });

  it("maps error codes to HTTP status codes", () => {
    expect(httpStatus("NOT_FOUND")).toBe(404);
    expect(httpStatus("VALIDATION_ERROR")).toBe(400);
    expect(httpStatus("UNAUTHORIZED")).toBe(401);
    expect(httpStatus("FORBIDDEN")).toBe(403);
    expect(httpStatus("CONFLICT")).toBe(409);
    expect(httpStatus("EXTERNAL_API_ERROR")).toBe(502);
    expect(httpStatus("DB_ERROR")).toBe(500);
    expect(httpStatus("UNKNOWN")).toBe(500);
  });
});
