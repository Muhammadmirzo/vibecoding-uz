import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../lib/auth";

describe("Auth Backend Logic - Password Hashing & Verification", () => {
  it("should hash password into salt:hash format", async () => {
    const password = "SuperSecretPassword123!";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).toContain(":");
    const [salt, hexHash] = hash.split(":");
    expect(salt.length).toBe(32);
    expect(hexHash.length).toBe(128);
  });

  it("should generate different hashes for the same password due to random salt", async () => {
    const hash1 = await hashPassword("SamePassword123");
    const hash2 = await hashPassword("SamePassword123");
    expect(hash1).not.toBe(hash2);
  });

  it("should verify correct password successfully", async () => {
    const hash = await hashPassword("MySecurePassword2026");
    expect(await verifyPassword("MySecurePassword2026", hash)).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const hash = await hashPassword("MySecurePassword2026");
    expect(await verifyPassword("WrongPassword123", hash)).toBe(false);
  });

  it("should return false for empty or null inputs", async () => {
    const hash = await hashPassword("validPassword");
    expect(await verifyPassword("", hash)).toBe(false);
    expect(await verifyPassword("validPassword", "")).toBe(false);
  });

  it("should handle malformed stored hashes gracefully", async () => {
    expect(await verifyPassword("password", "invalidhashformat")).toBe(false);
    expect(await verifyPassword("password", "salt:")).toBe(false);
    expect(await verifyPassword("password", ":hash")).toBe(false);
    expect(await verifyPassword("password", "salt:hash:extra")).toBe(false);
    expect(await verifyPassword("password", "salt:invalidhexg00d")).toBe(false);
  });

  it("should throw error when hashing empty password", async () => {
    await expect(hashPassword("")).rejects.toThrow("Password must not be empty");
  });
});
