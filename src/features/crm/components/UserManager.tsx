"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Search,
  UserCheck,
  UserPlus,
  Activity,
  Calendar,
  Lock,
  Edit,
  Eye,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export interface UserItem {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  tgUsername: string | null;
  role: "superadmin" | "admin" | "manager" | "mentor" | "student";
  lastLoginAt: string | null;
  createdAt: string;
  enrolledCount: number;
}

export interface AuditLogItem {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  userName: string | null;
}

export function UserManager() {
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");

  // Users state
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Role Edit Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState<"superadmin" | "admin" | "manager" | "mentor" | "student">("student");
  const [updatingRole, setUpdatingRole] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [viewDetailsLog, setViewDetailsLog] = useState<AuditLogItem | null>(null);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams();
      if (auditSearch) params.append("search", auditSearch);
      if (actionFilter !== "all") params.append("action", actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Fetch audit logs error:", err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchAuditLogs();
    }
  }, [activeTab, search, roleFilter, auditSearch, actionFilter]);

  const handleOpenRoleModal = (user: UserItem) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setUpdatingRole(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert(data.error || "Rolni o'zgartirishda xatolik");
      }
    } catch (err) {
      console.error("Update role error:", err);
      alert("Rolni o'zgartirishda xatolik yuz berdi");
    } finally {
      setUpdatingRole(false);
    }
  };

  const roleColors: Record<string, string> = {
    superadmin: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-rose-100 text-rose-800 border-rose-200",
    manager: "bg-blue-100 text-blue-800 border-blue-200",
    mentor: "bg-amber-100 text-amber-800 border-amber-200",
    student: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  const roleLabels: Record<string, string> = {
    superadmin: "Super Admin",
    admin: "Administrator",
    manager: "Menejer",
    mentor: "Mentor",
    student: "Talaba",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Foydalanuvchilar & Xodimlar Roli va Audit Jurnali
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Xodimlar huquqlarini boshqarish va tizimda amalga oshirilgan barcha harakatlarni kuzatish.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "users"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Foydalanuvchilar & Xodimlar ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "audit"
              ? "border-accent text-accent"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tizim Audit Jurnali (Audit Logs)</span>
        </button>
      </div>

      {/* TAB 1: USER & STAFF MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-warm p-4 rounded-xl border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Ism, telefon yoki email bo'yicha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-ink-muted whitespace-nowrap">Rol filtri:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
              >
                <option value="all">Barcha rollar</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Administrator</option>
                <option value="manager">Menejer</option>
                <option value="mentor">Mentor</option>
                <option value="student">Talaba</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : usersList.length === 0 ? (
            <div className="text-center py-16 bg-cream-warm rounded-xl border border-border text-ink-muted">
              Hech qanday foydalanuvchi topilmadi.
            </div>
          ) : (
            <div className="bg-cream-warm border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream-deep border-b border-border text-xs uppercase text-ink-muted font-semibold tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Foydalanuvchi</th>
                      <th className="px-4 py-3.5">Telefon / Telegram</th>
                      <th className="px-4 py-3.5">Rol</th>
                      <th className="px-4 py-3.5">Kurslar</th>
                      <th className="px-4 py-3.5">Ro'yxatdan O'tgan</th>
                      <th className="px-4 py-3.5 text-right">Boshqaruv</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-cream/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent font-bold flex items-center justify-center text-xs border border-accent-line">
                              {user.fullName.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-semibold text-ink">{user.fullName}</div>
                              {user.email && <div className="text-xs text-ink-muted">{user.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-mono text-xs text-ink">{user.phone}</div>
                          {user.tgUsername && (
                            <div className="text-xs text-accent font-mono">@{user.tgUsername}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              roleColors[user.role] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {roleLabels[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-muted font-medium">
                          {user.enrolledCount > 0 ? `${user.enrolledCount} ta guruh` : "Enrolled yo'q"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenRoleModal(user)}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-cream border border-border hover:border-accent text-xs font-medium text-ink hover:text-accent transition-all gap-1.5"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Rolni O'zgartirish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT LOG VIEWER */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          {/* Audit Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-warm p-4 rounded-xl border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Amal, entity yoki email bo'yicha..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-ink-muted whitespace-nowrap">Amal filtri:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
              >
                <option value="all">Barcha amallar</option>
                <option value="user.role_change">Rol o'zgarishi</option>
                <option value="blog.create">Blog yaratish</option>
                <option value="blog.update">Blog tahrirlash</option>
                <option value="blog.delete">Blog o'chirish</option>
                <option value="settings.update">Sozlamalar saqlash</option>
                <option value="notification.broadcast">Xabarnoma yuborish</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          {auditLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-16 bg-cream-warm rounded-xl border border-border text-ink-muted">
              Hech qanday audit jurnali topilmadi.
            </div>
          ) : (
            <div className="bg-cream-warm border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-cream-deep border-b border-border text-xs uppercase text-ink-muted font-semibold tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Vaqt</th>
                      <th className="px-4 py-3.5">Amal kodi</th>
                      <th className="px-4 py-3.5">Xodim / IP</th>
                      <th className="px-4 py-3.5">Obyekt</th>
                      <th className="px-4 py-3.5 text-right">Tafsilotlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-cream/60 transition-colors">
                        <td className="px-4 py-3.5 text-xs text-ink-muted whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString("uz-UZ", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-accent-soft text-accent border border-accent-line">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-ink text-xs">{log.userName || log.userEmail || "Tizim"}</div>
                          <div className="text-[11px] text-ink-muted font-mono">{log.ipAddress || "127.0.0.1"}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-muted font-mono">
                          {log.entityType || "-"}: {log.entityId ? log.entityId.slice(0, 8) : "-"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setViewDetailsLog(log)}
                            className="p-1.5 rounded-lg hover:bg-cream text-ink-muted hover:text-ink transition-colors"
                            title="Tafsilotlarni ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-cream-warm border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent" />
                Xodimlarga Rol Biriktirish
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-cream p-3 rounded-lg border border-border">
                <div className="text-xs text-ink-muted">Tanlangan Foydalanuvchi:</div>
                <div className="text-sm font-bold text-ink">{selectedUser.fullName}</div>
                <div className="text-xs text-ink-muted font-mono">{selectedUser.phone}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink mb-1.5">Yangi Rolni Tanlang:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="student">Talaba (Student) - LMS o'quvchi</option>
                  <option value="mentor">Mentor - Uy vazifasini baholovchi</option>
                  <option value="manager">Menejer - Leads Kanban & Sotuv</option>
                  <option value="admin">Administrator - To'liq CRM kirishi</option>
                  <option value="superadmin">Super Admin - Tizim va Sozlamalar</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={updatingRole}
                onClick={handleUpdateRole}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors shadow-sm disabled:opacity-50 gap-2"
              >
                {updatingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Rolni Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Details Modal */}
      {viewDetailsLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-cream-warm border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-ink font-mono">
                Audit Jurnali ID: {viewDetailsLog.id.slice(0, 8)}
              </h3>
              <button
                onClick={() => setViewDetailsLog(null)}
                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-ink-muted">Amal: </span>
                <span className="font-mono font-bold text-accent">{viewDetailsLog.action}</span>
              </div>
              <div>
                <span className="text-ink-muted">Vaqt: </span>
                <span className="font-mono">{new Date(viewDetailsLog.createdAt).toLocaleString("uz-UZ")}</span>
              </div>
              <div>
                <span className="text-ink-muted">IP Manzil: </span>
                <span className="font-mono">{viewDetailsLog.ipAddress || "127.0.0.1"}</span>
              </div>
              <div>
                <span className="text-ink-muted">Bajaruvchi Email: </span>
                <span className="font-mono">{viewDetailsLog.userEmail || "Tizim"}</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-ink mb-1">Details (JSON):</span>
              <pre className="p-3 bg-cream border border-border rounded-lg text-[11px] font-mono overflow-x-auto text-ink">
                {JSON.stringify(viewDetailsLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewDetailsLog(null)}
                className="px-4 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
