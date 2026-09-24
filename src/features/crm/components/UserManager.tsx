"use client";
import { useState } from "react";
import { Activity, UserCheck, UserPlus, Users } from "lucide-react";
import { AuditDetailsModal } from "./Users/AuditDetailsModal";
import { AuditFilters } from "./Users/AuditFilters";
import { AuditTable } from "./Users/AuditTable";
import { RoleEditor, isUserRole } from "./Users/RoleEditor";
import { UserFilters } from "./Users/UserFilters";
import { UserFormModal } from "./Users/UserFormModal";
import { UserTable } from "./Users/UserTable";
import { useUserMutations, useUsers } from "./Users/useUsers";
import type { CreateStaffForm, UserItem, UserRole, UserTab } from "./Users/types";

const initialForm: CreateStaffForm = { fullName: "", phone: "+998", email: "", password: "", role: "admin" };
export type { UserItem, AuditLogItem } from "./Users/types";
export function UserManager() {
  const [activeTab, setActiveTab] = useState<UserTab>("users");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateStaffForm>(initialForm);
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [detail, setDetail] = useState<import("./Users/types").AuditLogItem | null>(null);
  const users = useUsers(activeTab);
  const mutations = useUserMutations(users.fetchUsers);
  const openRole = (user: UserItem) => { setSelected(user); setRole(user.role); };
  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2"><Users className="w-6 h-6 text-accent" />Foydalanuvchilar & Xodimlar Roli va Audit Jurnali</h1><p className="text-sm text-ink-muted mt-1">Xodimlar huquqlarini boshqarish va tizimda amalga oshirilgan barcha harakatlarni kuzatish.</p></div><button onClick={() => { mutations.setCreateError(null); setCreateOpen(true); }} className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-ink font-medium text-sm hover:bg-accent/90 transition-colors shadow-sm gap-2 self-start sm:self-auto"><UserPlus className="w-4 h-4" />Yangi Xodim Yaratish</button></div>
    <div className="flex space-x-2 border-b border-border"><button onClick={() => setActiveTab("users")} className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "users" ? "border-accent text-accent" : "border-transparent text-ink-muted hover:text-ink"}`}><UserCheck className="w-4 h-4" /><span>Foydalanuvchilar & Xodimlar ({users.users.length})</span></button><button onClick={() => setActiveTab("audit")} className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "audit" ? "border-accent text-accent" : "border-transparent text-ink-muted hover:text-ink"}`}><Activity className="w-4 h-4" /><span>Tizim Audit Jurnali (Audit Logs)</span></button></div>
    {activeTab === "users" ? <div className="space-y-4"><UserFilters search={users.search} setSearch={users.setSearch} roleFilter={users.roleFilter} setRoleFilter={users.setRoleFilter} /><UserTable users={users.users} loading={users.usersLoading} onEdit={openRole} /></div> : <div className="space-y-4"><AuditFilters auditSearch={users.auditSearch} setAuditSearch={users.setAuditSearch} actionFilter={users.actionFilter} setActionFilter={users.setActionFilter} /><AuditTable logs={users.auditLogs} loading={users.auditLoading} onDetails={setDetail} /></div>}
    {createOpen ? <UserFormModal form={form} setForm={setForm} onClose={() => setCreateOpen(false)} onSubmit={async (e) => { e.preventDefault(); if (await mutations.createStaff(form)) { setCreateOpen(false); setForm(initialForm); } }} creating={mutations.creating} error={mutations.createError} /> : null}
    {selected ? <RoleEditor user={selected} role={role} setRole={(value) => { if (isUserRole(value)) setRole(value); }} onClose={() => setSelected(null)} onSave={async () => { if (await mutations.updateRole(selected, role)) setSelected(null); }} updating={mutations.updating} /> : null}
    {detail ? <AuditDetailsModal log={detail} onClose={() => setDetail(null)} /> : null}
  </div>;
}
