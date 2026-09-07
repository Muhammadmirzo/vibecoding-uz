import crypto from "crypto";

export interface ClickTransactionRecord {
  clickTransId: number;
  merchantTransId: string;
  merchantPrepareId: number;
  merchantConfirmId?: number;
  amount: number;
  status: "prepared" | "completed" | "failed";
  createdAt: number;
}

class ClickStore {
  private transactions = new Map<string, ClickTransactionRecord>();

  get(key: string): ClickTransactionRecord | undefined {
    return this.transactions.get(key);
  }

  set(key: string, record: ClickTransactionRecord): void {
    this.transactions.set(key, record);
  }

  clear(): void {
    this.transactions.clear();
  }
}

export const clickStore = new ClickStore();

export function computeClickSign(
  clickTransId: string,
  serviceId: string,
  secretKey: string,
  merchantTransId: string,
  merchantPrepareId: string,
  amount: string,
  action: string,
  signTime: string
): string {
  const str = `${clickTransId}${serviceId}${secretKey}${merchantTransId}${merchantPrepareId || ""}${amount}${action}${signTime}`;
  return crypto.createHash("md5").update(str).digest("hex");
}
