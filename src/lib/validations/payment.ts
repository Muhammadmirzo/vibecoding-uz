import { z } from "zod";

const paymeTransactionId = z.union([z.string().min(1).max(200), z.number().int().positive()]);

export const paymeRpcRequestSchema = z.object({
  jsonrpc: z.literal("2.0").optional(),
  method: z.enum([
    "CheckPerformTransaction",
    "CreateTransaction",
    "PerformTransaction",
    "CancelTransaction",
    "CheckTransaction",
  ]),
  params: z.object({
    id: paymeTransactionId.optional(),
    time: z.number().int().nonnegative().optional(),
    amount: z.number().int().positive().optional(),
    account: z.record(z.unknown()).optional(),
    reason: z.union([z.string(), z.number().int()]).optional(),
  }).strict(),
  id: z.union([z.number().int(), z.string().min(1).max(200)]),
});

export type PaymeRpcRequestInput = z.infer<typeof paymeRpcRequestSchema>;
export type PaymeRpcParams = z.infer<typeof paymeRpcRequestSchema>["params"];

export const clickWebhookSchema = z.object({
  click_trans_id: z.string().regex(/^\d+$/),
  service_id: z.string().regex(/^\d+$/),
  merchant_trans_id: z.string().min(1).max(200),
  merchant_prepare_id: z.string().regex(/^\d+$/).optional().default(""),
  amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
  action: z.enum(["0", "1"]),
  error: z.union([z.string().regex(/^-?\d+$/), z.number().int()]).optional(),
  sign_time: z.string().regex(/^\d+$/),
  sign_string: z.string().regex(/^[a-fA-F0-9]{32}$/),
});

export type ClickWebhookInput = z.infer<typeof clickWebhookSchema>;
