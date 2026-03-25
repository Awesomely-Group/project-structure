import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { type AppError, type Result, appError, err, ok } from "@/lib/errors";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string): Result<string, AppError> {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    const combined = `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
    return ok(combined);
  } catch (cause) {
    return err(
      appError("ENCRYPTION_ERROR", "Failed to encrypt value", cause),
    );
  }
}

export function decrypt(ciphertext: string): Result<string, AppError> {
  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = ciphertext.split(":");

    if (!ivHex || !authTagHex || !encrypted) {
      return err(appError("ENCRYPTION_ERROR", "Invalid ciphertext format"));
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return ok(decrypted);
  } catch (cause) {
    return err(
      appError("ENCRYPTION_ERROR", "Failed to decrypt value", cause),
    );
  }
}
