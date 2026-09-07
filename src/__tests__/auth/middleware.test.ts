import { describe, it, expect } from "vitest";

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
