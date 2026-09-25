import { describe, it, expect } from "vitest";
import { checkDbHealth, withRetry, withTransactionLock } from "@/db";

describe("Production High-Load Defensive Hardening - Database", () => {
  it("should succeed immediately on normal DB query", async () => {
    expect(await withRetry(async () => "db_success")).toBe("db_success");
  });

  it("should retry transient DB errors and succeed after retries", async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) throw Object.assign(new Error("connection lost"), { code: "ECONNRESET" });
      return "recovered_data";
    };
    expect(await withRetry(fn, { retries: 3, delayMs: 10, backoffFactor: 1 })).toBe("recovered_data");
    expect(attempts).toBe(3);
  });

  it("should throw error immediately if non-transient DB error occurs", async () => {
    const fn = async () => {
      throw Object.assign(new Error("syntax error at or near SELECT"), { code: "42601" });
    };
    await expect(withRetry(fn, { retries: 3, delayMs: 10 })).rejects.toThrow("syntax error");
  });

  // Integration test: needs a real Postgres. CI has no DATABASE_URL, so it is skipped there.
  it.skipIf(!process.env.DATABASE_URL)("should execute withTransactionLock sequentially under concurrent calls", async (context) => {
    const executionOrder: number[] = [];
    const task1 = withTransactionLock("test_lock_key", async () => {
      executionOrder.push(1);
      await new Promise((resolve) => setTimeout(resolve, 50));
      executionOrder.push(2);
      return "task1";
    });
    const task2 = withTransactionLock("test_lock_key", async () => {
      executionOrder.push(3);
      return "task2";
    });
    try {
      expect(await Promise.all([task1, task2])).toEqual(["task1", "task2"]);
      expect(executionOrder).toEqual([1, 2, 3]);
    } catch (error) {
      if (error instanceof Error && (error.message.includes("ENOTFOUND") || error.message.includes("not found"))) {
        context.skip("DATABASE_URL is configured but PostgreSQL DNS is unreachable");
        return;
      }
      throw error;
    }
  }, 15000);

  it("should return db health status correctly", async () => {
    const health = await checkDbHealth();
    expect(health).toHaveProperty("status");
    expect(health).toHaveProperty("latencyMs");
  });
});
