import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const uuid = z.string().uuid();
const isoDate = z.string().datetime();

export const platformSchema = z.enum(["ios", "android", "web"]).openapi({ example: "ios" });

export const tokenRequestSchema = z.object({
  phone: z.string().min(1).openapi({ example: "+998901234567" }),
  password: z.string().min(1).openapi({ example: "MaxfiyParol123" }),
  deviceId: z.string().min(1).max(128).openapi({ example: "iphone-15-ABCD1234" }),
  deviceName: z.string().max(128).optional().openapi({ example: "iPhone 15" }),
  platform: platformSchema.default("ios"),
  appVersion: z.string().max(32).optional().openapi({ example: "1.0.0" }),
}).openapi("MobileTokenRequest");

export const mobileUserSchema = z.object({
  id: uuid.openapi({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" }),
  phone: z.string().openapi({ example: "+998901234567" }),
  fullName: z.string().openapi({ example: "Aziza Karimova" }),
  email: z.string().nullable().openapi({ example: null }),
  role: z.string().openapi({ example: "student" }),
  avatarUrl: z.string().nullable().openapi({ example: null }),
}).openapi("MobileUser");

export const tokenResponseSchema = z.object({
  accessToken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIs..." }),
  refreshToken: z.string().openapi({ example: "mrt_9f2c7ab41d..." }),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int().openapi({ example: 900 }),
  user: mobileUserSchema,
}).openapi("MobileTokenResponse");

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(16).openapi({ example: "mrt_9f2c7ab41d..." }),
  deviceId: z.string().min(1).max(128).optional(),
}).openapi("MobileRefreshRequest");

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(16).optional(),
  allDevices: z.boolean().default(false),
}).openapi("MobileLogoutRequest");

export const deviceSessionSchema = z.object({
  id: uuid,
  deviceId: z.string(),
  deviceName: z.string().nullable(),
  platform: z.string(),
  appVersion: z.string().nullable(),
  lastUsedAt: isoDate,
  createdAt: isoDate,
  current: z.boolean(),
}).openapi("MobileDeviceSession");

export const sessionListResponseSchema = z.object({
  sessions: z.array(deviceSessionSchema),
}).openapi("MobileSessionList");

export const telegramStartResponseSchema = z.object({
  id: uuid,
  deepLink: z.string().url(),
  token: z.string(),
  expiresAt: isoDate,
}).openapi("MobileTelegramStart");

export const telegramStatusRequestSchema = z.object({
  id: uuid,
  token: z.string().min(16),
  deviceId: z.string().min(1).max(128),
  deviceName: z.string().max(128).optional(),
  platform: platformSchema.default("ios"),
  appVersion: z.string().max(32).optional(),
}).openapi("MobileTelegramStatusRequest");

export const telegramStatusResponseSchema = z.object({
  state: z.enum(["pending", "approved", "rejected", "expired", "consumed", "unknown"]),
  tokens: tokenResponseSchema.optional(),
}).openapi("MobileTelegramStatus");

export type TokenRequest = z.infer<typeof tokenRequestSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
