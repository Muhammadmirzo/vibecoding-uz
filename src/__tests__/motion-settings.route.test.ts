import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin } = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/auth/require-auth", () => ({ requireAdmin }));
vi.mock("@/lib/security/rateLimit", () => ({ checkRateLimit: vi.fn().mockResolvedValue({ success: true }), createRateLimitResponse: vi.fn(), getClientIp: () => "127.0.0.1", PRESETS: { CHECKOUT: { limit: 30, windowSeconds: 60, prefix: "test" } } }));
const { getMotionSettings, updateMotionSettings } = vi.hoisted(() => ({ getMotionSettings: vi.fn(), updateMotionSettings: vi.fn() }));
vi.mock("@/features/motion/server/motion-settings.service", () => ({ getMotionSettings, updateMotionSettings }));
import { GET, PUT } from  "@/app/api/admin/settings/motion/route";
import { DEFAULT_MOTION } from "@/features/motion/domain/settings";

const request = (body?: unknown) => new Request("http://localhost/api/admin/settings/motion", { method: body === undefined ? "GET" : "PUT", headers: { "content-type": "application/json", origin: "http://localhost" }, body: body === undefined ? undefined : JSON.stringify(body) });

describe("motion settings route", () => {
  beforeEach(() => { requireAdmin.mockReset(); getMotionSettings.mockReset(); updateMotionSettings.mockReset(); requireAdmin.mockResolvedValue({ ok: false, response: Response.json({ error: "no" }, { status: 401 }) }); });
  it("returns unauthorized", async () => { const response = await GET(request()); expect(response.status).toBe(401); });
  it("rejects invalid body", async () => { requireAdmin.mockResolvedValue({ ok: true, session: { userId: "u", role: "admin", sessionId: "s" } }); const response = await PUT(request({ level: "bad" })); expect(response.status).toBe(400); });
  it("updates settings for an admin", async () => { requireAdmin.mockResolvedValue({ ok: true, session: { userId: "u", role: "admin", sessionId: "s" } }); updateMotionSettings.mockResolvedValue(DEFAULT_MOTION); const response = await PUT(request(DEFAULT_MOTION)); expect(response.status).toBe(200); expect(updateMotionSettings).toHaveBeenCalled(); });
});
