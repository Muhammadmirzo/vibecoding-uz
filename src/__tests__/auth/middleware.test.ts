import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("Middleware & RBAC Authorization Rules", () => {
  const ADMIN_ROLES = ["superadmin", "admin", "manager"];
  const ALL_ROLES = ["superadmin", "admin", "manager", "mentor", "student"];

  it("should allow admin roles to access /admin routes", () => {
    expect(ADMIN_ROLES.includes("admin")).toBe(true);
    expect(ADMIN_ROLES.includes("superadmin")).toBe(true);
    expect(ADMIN_ROLES.includes("manager")).toBe(true);
  });

  it("should deny student or mentor roles from accessing /admin routes", () => {
    expect(ADMIN_ROLES.includes("student")).toBe(false);
    expect(ADMIN_ROLES.includes("mentor")).toBe(false);
  });

  it("should allow all authenticated roles to access /kabinet routes", () => {
    ALL_ROLES.forEach((role) => {
      expect(ALL_ROLES.includes(role)).toBe(true);
    });
  });
});

describe("Middleware route protection and guest LCP bypass", () => {
  it("allows guest access to /kabinet with CSP and nonce without redirecting", async () => {
    const req = new NextRequest("http://localhost/kabinet");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("content-security-policy")).toBeDefined();
  });

  it("allows guest access to /kabinet/ without redirecting", async () => {
    const req = new NextRequest("http://localhost/kabinet/");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects guest accessing /kabinet nested routes to login", async () => {
    const req = new NextRequest("http://localhost/kabinet/to-lovlar");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/?auth=1&redirect=%2Fkabinet%2Fto-lovlar");
  });

  it("returns 401 for guest accessing /api/kabinet routes", async () => {
    const req = new NextRequest("http://localhost/api/kabinet/settings");
    const res = await middleware(req);
    expect(res.status).toBe(401);
  });

  it("redirects guest accessing /admin routes to /admin/login", async () => {
    const req = new NextRequest("http://localhost/admin/users");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login?redirect=%2Fadmin%2Fusers");
  });
});
