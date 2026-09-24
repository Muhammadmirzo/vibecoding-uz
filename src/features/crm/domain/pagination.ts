/**
 * Pure pagination helper shared by admin list services.
 * Services return the full filtered `total` plus the sliced page;
 * routes keep their legacy array keys and add total/page/limit.
 */

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export function paginate<T>(all: T[], page: number, limit: number): PageResult<T> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 200) : 100;
  const start = (safePage - 1) * safeLimit;
  return { items: all.slice(start, start + safeLimit), total: all.length, page: safePage, limit: safeLimit };
}
