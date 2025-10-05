import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ENCRYPTION_IV = process.env.ENCRYPTION_IV;

if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
  throw new Error("ENCRYPTION_KEY or ENCRYPTION_IV 불러오기 오류");
}

const algorithm = "aes-256-cbc";
const key = Buffer.from(ENCRYPTION_KEY, "hex"); // 32바이트
const iv = Buffer.from(ENCRYPTION_IV, "hex"); // 16바이트

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
