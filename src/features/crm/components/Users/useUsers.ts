"use client";
import { useCallback, useEffect, useState } from "react";
import type { AuditLogItem, CreateStaffForm, UserItem, UserRole, UserTab } from "./types";

export function useUsers(activeTab: UserTab) {
  const [users, setUsers] = useState<UserItem[]>([]); const [usersLoading, setUsersLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]); const [auditLoading, setAuditLoading] = useState(false);
  const [search, setSearch] = useState(""); const [roleFilter, setRoleFilter] = useState("all");
  const [auditSearch, setAuditSearch] = useState(""); const [actionFilter, setActionFilter] = useState("all");
  const fetchUsers = useCallback(async () => { setUsersLoading(true); try { const p = new URLSearchParams(); if (search) p.append("search", search); if (roleFilter !== "all") p.append("role", roleFilter); const res = await fetch(`/api/admin/users?${p}`); const data: unknown = await res.json(); if (typeof data === "object" && data && "success" in data && data.success && "users" in data && Array.isArray(data.users)) setUsers(data.users as UserItem[]); } catch (e) { console.error("Fetch users error:", e); } finally { setUsersLoading(false); } }, [search, roleFilter]);
  const fetchAuditLogs = useCallback(async () => { setAuditLoading(true); try { const p = new URLSearchParams(); if (auditSearch) p.append("search", auditSearch); if (actionFilter !== "all") p.append("action", actionFilter); const res = await fetch(`/api/admin/audit-logs?${p}`); const data: unknown = await res.json(); if (typeof data === "object" && data && "success" in data && data.success && "logs" in data && Array.isArray(data.logs)) setAuditLogs(data.logs as AuditLogItem[]); } catch (e) { console.error("Fetch audit logs error:", e); } finally { setAuditLoading(false); } }, [auditSearch, actionFilter]);
  useEffect(() => { if (activeTab === "users") void fetchUsers(); else void fetchAuditLogs(); }, [activeTab, fetchUsers, fetchAuditLogs]);
  return { users, usersLoading, auditLogs, auditLoading, search, setSearch, roleFilter, setRoleFilter, auditSearch, setAuditSearch, actionFilter, setActionFilter, fetchUsers, fetchAuditLogs };
}
export function useUserMutations(refresh: () => Promise<void>) {
  const [creating, setCreating] = useState(false); const [createError, setCreateError] = useState<string | null>(null); const [updating, setUpdating] = useState(false);
  const createStaff = async (form: CreateStaffForm) => { setCreating(true); setCreateError(null); try { const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data: unknown = await res.json(); if (typeof data === "object" && data && "success" in data && data.success) { await refresh(); return true; } setCreateError(typeof data === "object" && data && "error" in data && typeof data.error === "string" ? data.error : "Xodim yaratishda xatolik"); } catch (e) { console.error("Create staff error:", e); setCreateError("Xodim yaratishda kutilmagan xatolik yuz berdi"); } finally { setCreating(false); } return false; };
  const updateRole = async (user: UserItem, role: UserRole) => { setUpdating(true); try { const res = await fetch(`/api/admin/users/${user.id}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) }); const data: unknown = await res.json(); if (typeof data === "object" && data && "success" in data && data.success) { await refresh(); return true; } alert(typeof data === "object" && data && "error" in data && typeof data.error === "string" ? data.error : "Rolni o'zgartirishda xatolik"); } catch (e) { console.error("Update role error:", e); alert("Rolni o'zgartirishda xatolik yuz berdi"); } finally { setUpdating(false); } return false; };
  return { createStaff, creating, createError, setCreateError, updateRole, updating };
}
