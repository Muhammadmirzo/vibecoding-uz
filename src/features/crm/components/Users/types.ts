export type UserRole = "superadmin" | "admin" | "manager" | "mentor" | "student";
export type UserTab = "users" | "audit";
export interface UserItem {
  id: string; phone: string; email: string | null; fullName: string; avatarUrl: string | null;
  tgUsername: string | null; role: UserRole; lastLoginAt: string | null; createdAt: string; enrolledCount: number;
}
export interface AuditLogItem {
  id: string; userId: string | null; userEmail: string | null; action: string; entityType: string | null;
  entityId: string | null; details: Record<string, unknown> | null; ipAddress: string | null; createdAt: string; userName: string | null;
}
export interface CreateStaffForm { fullName: string; phone: string; email: string; password: string; role: UserRole; }
