/**
 * generate_discount_promocode — HONESTLY UNSUPPORTED.
 * The database schema has no promocode/coupon table (verified: no matches
 * for promo/coupon in src/db/schema/*), so inventing a code would be fake
 * success. Returns { ok:false, error:"promocodes_not_supported" }.
 */
import { mcpGenerateDiscountPromocodeSchema } from "../../src/lib/validations/mcp";
import { verifyAuthToken } from "../auth";
import {
  errorResult,
  extractAuthToken,
  withAuthProperty,
  type McpToolDef,
  type McpToolResult,
} from "../types";

export const TOOL_DEF: McpToolDef = {
  name: "generate_discount_promocode",
  description:
    "Currently unsupported: no promocode storage exists in the schema, so no code is created. Requires authToken.",
  inputSchema: {
    type: "object",
    properties: withAuthProperty({
      code: { type: "string", description: "Custom promo code string" },
      discountType: { type: "string", description: "'percentage' or 'fixed_amount'" },
      discountValue: { type: "number", description: "Discount amount" },
      maxUses: { type: "number", description: "Max redemptions (default 100)" },
      expiresInDays: { type: "number", description: "Expiry in days (default 7)" },
    }),
    required: ["code", "discountType", "discountValue"],
  },
};

export async function handle(rawArgs: unknown): Promise<McpToolResult> {
  if (!verifyAuthToken(extractAuthToken(rawArgs))) {
    return errorResult("unauthorized", { hint: "Provide a valid authToken." });
  }
  const parsed = mcpGenerateDiscountPromocodeSchema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return errorResult("invalid_input", { issues: parsed.error.flatten() });
  }
  return errorResult("promocodes_not_supported", {
    message:
      "No promocode/coupon table exists in the database schema, so no code was created. Add promocode storage first.",
  });
}
