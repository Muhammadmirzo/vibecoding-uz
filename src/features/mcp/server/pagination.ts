import { z } from "zod";

export interface Page<T> { rows: T[]; nextCursor: string | null; total: number }
export function decodeCursor(cursor?: string): number { if (!cursor) return 0; const decoded = Buffer.from(cursor, "base64url").toString("utf8"); const value = Number(decoded); if (!Number.isInteger(value) || value < 0 || value > 10_000) throw new Error("Cursor yaroqsiz"); return value; }
export function encodeCursor(offset: number): string { return Buffer.from(String(offset), "utf8").toString("base64url"); }
export function pageResult<T>(rows: T[], limit: number, offset: number, total: number): Page<T> { return { rows: rows.slice(0, limit), total, nextCursor: offset + rows.length < total ? encodeCursor(offset + rows.length) : null }; }
export function safePage<T>(query: { limit?: number; cursor?: string }, load: (limit: number, offset: number) => Promise<{ rows: T[]; total: number }>): Promise<Page<T>> { const limit = query.limit ?? 20; const offset = decodeCursor(query.cursor); return load(limit, offset).then((result) => pageResult(result.rows, limit, offset, result.total)); }
export function textValue(value: unknown, fallback = "Noma'lum"): string { return typeof value === "string" && value.trim() ? value : fallback; }
export function isoValue(value: unknown): string | null { if (typeof value !== "string" && !(value instanceof Date)) return null; const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date.toISOString(); }
export function numberValue(value: unknown): number { const parsed = Number(value ?? 0); return Number.isFinite(parsed) ? parsed : 0; }
export function zodFailure(error: z.ZodError): Error { return new Error(error.issues.map((issue) => issue.message).join("; ")); }
export function maskPhone(phone: string | null | undefined, reveal: boolean): string | null { if (!phone) return null; if (reveal) return phone; const digits = phone.replace(/\D/g, ""); return `***${digits.slice(-4)}`; }
