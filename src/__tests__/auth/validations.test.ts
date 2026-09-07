import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginPasswordSchema,
  otpRequestSchema,
  otpVerifySchema,
  passwordResetSchema,
  updateProfileSchema,
} from "../../lib/validations/auth";

describe("Auth Zod Schema Validations", () => {
  describe("registerSchema", () => {
    it("should accept valid registration input with all fields", () => {
      const validData = {
        phone: "+998901234567",
        fullName: "Alisher Navoiy",
        password: "securepassword123",
        email: "alisher@example.com",
        locale: "uz" as const,
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should default locale to 'uz' when omitted", () => {
      const input = {
        phone: "+998901234567",
        fullName: "Bobur Mirzo",
        password: "password123",
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.locale).toBe("uz");
      }
    });

    it("should accept empty string as optional email", () => {
      const input = {
        phone: "+998991234567",
        fullName: "Test User",
        password: "password123",
        email: "",
      };
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid Uzbek phone format", () => {
      const invalidPhones = [
        "998901234567", // missing +
        "+99890123456", // 11 digits
        "+9989012345678", // 13 digits
        "+123456789012", // not +998
        "phone123", // non-numeric
      ];

      for (const phone of invalidPhones) {
        const result = registerSchema.safeParse({
          phone,
          fullName: "User Name",
          password: "password123",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Telefon raqam");
        }
      }
    });

    it("should reject full name shorter than 2 characters", () => {
      const result = registerSchema.safeParse({
        phone: "+998901234567",
        fullName: "A",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("F.I.SH.");
      }
    });

    it("should reject password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        phone: "+998901234567",
        fullName: "Valid Name",
        password: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Parol kamida 8 ta");
      }
    });

    it("should reject invalid email format", () => {
      const result = registerSchema.safeParse({
        phone: "+998901234567",
        fullName: "Valid Name",
        password: "password123",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Email formati noto'g'ri");
      }
    });
  });

  describe("loginPasswordSchema", () => {
    it("should accept valid phone and password", () => {
      const input = {
        phone: "+998901234567",
        password: "mysecretpassword",
      };
      const result = loginPasswordSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("should reject invalid phone format", () => {
      const result = loginPasswordSchema.safeParse({
        phone: "0901234567",
        password: "password",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginPasswordSchema.safeParse({
        phone: "+998901234567",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Parol kiritilishi shart");
      }
    });
  });

  describe("otpRequestSchema", () => {
    it("should accept valid OTP request with all supported purposes", () => {
      const purposes = ["register", "login", "reset_password"] as const;
      for (const purpose of purposes) {
        const result = otpRequestSchema.safeParse({
          phone: "+998901234567",
          purpose,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject unsupported purpose", () => {
      const result = otpRequestSchema.safeParse({
        phone: "+998901234567",
        purpose: "invalid_purpose",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("otpVerifySchema", () => {
    it("should accept valid 6-digit OTP code", () => {
      const result = otpVerifySchema.safeParse({
        phone: "+998901234567",
        code: "123456",
        purpose: "login",
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-6-digit OTP codes", () => {
      const invalidCodes = ["12345", "1234567", "abc123", "12 345"];
      for (const code of invalidCodes) {
        const result = otpVerifySchema.safeParse({
          phone: "+998901234567",
          code,
          purpose: "login",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("OTP kodi 6 xonali");
        }
      }
    });
  });

  describe("passwordResetSchema", () => {
    it("should accept valid password reset payload", () => {
      const result = passwordResetSchema.safeParse({
        phone: "+998901234567",
        otpCode: "654321",
        newPassword: "newsecurepassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short new password", () => {
      const result = passwordResetSchema.safeParse({
        phone: "+998901234567",
        otpCode: "654321",
        newPassword: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateProfileSchema", () => {
    it("should accept valid profile updates", () => {
      const result = updateProfileSchema.safeParse({
        fullName: "Updated Name",
        email: "newemail@example.com",
        avatarUrl: "https://example.com/avatar.png",
        locale: "ru",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid avatar URL", () => {
      const result = updateProfileSchema.safeParse({
        avatarUrl: "invalid-url",
      });
      expect(result.success).toBe(false);
    });
  });
});
