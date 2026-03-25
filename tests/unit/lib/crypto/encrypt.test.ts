import { describe, expect, it, beforeEach } from "vitest";
import { encrypt, decrypt } from "@/lib/crypto/encrypt";

describe("encrypt / decrypt", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  it("encrypts and decrypts a string", () => {
    const plaintext = "my-secret-api-key";
    const encResult = encrypt(plaintext);
    expect(encResult.ok).toBe(true);
    if (!encResult.ok) return;

    const decResult = decrypt(encResult.value);
    expect(decResult.ok).toBe(true);
    if (!decResult.ok) return;

    expect(decResult.value).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext (random IV)", () => {
    const plaintext = "same-key";
    const enc1 = encrypt(plaintext);
    const enc2 = encrypt(plaintext);
    expect(enc1.ok && enc2.ok).toBe(true);
    if (enc1.ok && enc2.ok) {
      expect(enc1.value).not.toBe(enc2.value);
    }
  });

  it("returns error for invalid ciphertext format", () => {
    const result = decrypt("invalid-string");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("ENCRYPTION_ERROR");
    }
  });
});
