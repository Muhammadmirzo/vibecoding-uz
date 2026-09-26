import { after } from "next/server";

/**
 * Best-effort work that must not delay the response (bookkeeping writes, analytics).
 * On Vercel a promise left running after the response can be frozen and lost, so inside a
 * request we hand it to `after()`. Outside a request scope (scripts, tests) `after` throws and
 * we start it immediately. Pass a FUNCTION: drizzle builders are lazy thenables that only run
 * when awaited, so `void db.update(...)` without `.then/.catch` silently never executes.
 */
export function runInBackground(task: () => PromiseLike<unknown>): void {
  const run = async () => {
    try {
      await task();
    } catch {
      // Best-effort by contract; callers log inside `task` if they need to.
    }
  };
  try {
    after(run);
  } catch {
    void run();
  }
}
