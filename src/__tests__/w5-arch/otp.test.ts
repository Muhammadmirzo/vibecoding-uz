import { describe, expect, it, vi } from "vitest";
import { requestOtp, verifyOtp } from "@/features/auth/server/otp.service";
import type { OtpRecord, OtpRepository } from "@/features/auth/server/otp.repository";
import type { AuthSessionRepository } from "@/features/auth/server/auth-session.repository";
import type { AuthUser, AuthUserRepository } from "@/features/auth/server/auth-user.repository";
import type { RegistrationRepository } from "@/features/auth/server/registration.repository";
import type { AttributionTxStore } from "@/features/referrals/server/attribution.service";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    phone: "+998901112233",
    email: null,
    passwordHash: null,
    fullName: "Foydalanuvchi",
    avatarUrl: null,
    tgUserId: null,
    tgUsername: null,
    role: "student",
    locale: "uz",
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeOtp(overrides: Partial<OtpRecord> = {}): OtpRecord {
  return {
    id: "otp-1",
    phone: "+998901112233",
    codeHash: "hash",
    purpose: "login",
    attempts: 0,
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("requestOtp", () => {
  function makeRepo(inserted: unknown[]): OtpRepository {
    return {
      findActiveOtp: async () => null,
      bumpAttempts: async () => {},
      markUsed: async () => {},
      insertOtp: async (input) => {
        inserted.push(input);
      },
    };
  }

  it("stores the code hash and returns the expiry", async () => {
    const inserted: unknown[] = [];
    const outcome = await requestOtp(
      makeRepo(inserted),
      { send: async () => ({ success: true }) },
      { phone: "+998901112233", purpose: "login", code: "123456", isProduction: false },
    );
    expect(outcome.ok).toBe(true);
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ phone: "+998901112233", purpose: "login" });
  });

  it("returns sms_unavailable instead of throwing in production on mock/failure", async () => {
    const inserted: unknown[] = [];
    const repo = makeRepo(inserted);
    await expect(
      requestOtp(repo, { send: async () => ({ success: true, mock: true }) }, {
        phone: "+998901112233",
        purpose: "login",
        code: "123456",
        isProduction: true,
      }),
    ).resolves.toEqual({ ok: false, reason: "sms_unavailable" });
    await expect(
      requestOtp(repo, { send: async () => ({ success: false, error: "down" }) }, {
        phone: "+998901112233",
        purpose: "login",
        code: "123456",
        isProduction: true,
      }),
    ).resolves.toEqual({ ok: false, reason: "sms_unavailable" });
    // The OTP row is still stored (legacy behavior: insert happens before send).
    expect(inserted).toHaveLength(2);
  });

  it("throws in non-production when the provider fails", async () => {
    const inserted: unknown[] = [];
    await expect(
      requestOtp(makeRepo(inserted), { send: async () => ({ success: false, error: "boom" }) }, {
        phone: "+998901112233",
        purpose: "login",
        code: "123456",
        isProduction: false,
      }),
    ).rejects.toMatchObject({ status: 500 });
  });
});

describe("verifyOtp", () => {
  const signer = { sign: async (p: { sessionId: string }) => `token:${p.sessionId}` };
  const referrals: AttributionTxStore = {
    resolveReferrerByCodeTx: async () => null,
    attributeReferralTx: async () => {},
  };

  function makeDeps(user: AuthUser | null, otp: OtpRecord | null): {
    otpRepo: OtpRepository;
    users: AuthUserRepository;
    sessions: AuthSessionRepository;
    registration: RegistrationRepository;
    bumps: number[];
    used: string[];
  } {
    const bumps: number[] = [];
    const used: string[] = [];
    let current: AuthUser | null = user;
    return {
      otpRepo: {
        findActiveOtp: async () => otp,
        bumpAttempts: async (_id, attempts) => {
          bumps.push(attempts);
        },
        markUsed: async (id) => {
          used.push(id);
        },
        insertOtp: async () => {},
      },
      users: {
        findByPhoneOrEmail: async () => current,
        findById: async () => current,
        findByPhone: async () => current,
        findByEmail: async () => current,
        findByTgId: async () => current,
        ensureProfileTx: async () => {},
        updateLoginFieldsTx: async () => {},
        updateCredentialsTx: async () => {},
        insertAuthAuditTx: async () => {},
      },
      sessions: {
        createSession: async () => ({ id: "sess-otp" }),
        createSessionTx: async () => ({ id: "sess-otp" }),
        deleteSession: async () => {},
      },
      registration: {
        createUserTx: async (_ex, input) => {
          current = { ...makeUser(), phone: input.phone, fullName: input.fullName };
          return current;
        },
        createProfileTx: async () => {},
      },
      bumps,
      used,
    };
  }

  it("rejects missing records and wrong codes with 400", async () => {
    const missing = makeDeps(makeUser(), null);
    await expect(
      verifyOtp(missing.otpRepo, missing.users, missing.sessions, referrals, missing.registration, signer, {
        phone: "+998901112233",
        code: "000000",
        purpose: "login",
        refCode: "",
      }),
    ).rejects.toMatchObject({ code: "OTP_NOT_FOUND", status: 400 });

    const wrong = makeDeps(makeUser(), makeOtp());
    await expect(
      verifyOtp(wrong.otpRepo, wrong.users, wrong.sessions, referrals, wrong.registration, signer, {
        phone: "+998901112233",
        code: "000000",
        purpose: "login",
        refCode: "",
      }),
    ).rejects.toMatchObject({ code: "INVALID_OTP", status: 400 });
    expect(wrong.bumps).toEqual([1]);
    expect(wrong.used).toHaveLength(0);
  });

  it("logs in existing users and fills placeholder names", async () => {
    const { hashOtpCode } = await import("@/lib/auth/password");
    const otp = makeOtp({ codeHash: hashOtpCode("654321") });
    const deps = makeDeps(makeUser(), otp);
    const outcome = await verifyOtp(
      deps.otpRepo,
      deps.users,
      deps.sessions,
      referrals,
      deps.registration,
      signer,
      { phone: "+998901112233", code: "654321", fullName: "Ali Vali", purpose: "login", refCode: "ignored" },
    );
    expect(outcome.user.fullName).toBe("Ali Vali");
    expect(outcome.token).toBe("token:sess-otp");
    expect(outcome.refCodeAttributed).toBe(false);
    expect(deps.used).toEqual(["otp-1"]);
  });

  it("registers new users with attribution and clears the ref cookie flag", async () => {
    const { hashOtpCode } = await import("@/lib/auth/password");
    const otp = makeOtp({ codeHash: hashOtpCode("111111") });
    const deps = makeDeps(null, otp);
    const referralsWithMatch: AttributionTxStore = {
      resolveReferrerByCodeTx: async () => ({ id: "referrer-1" }),
      attributeReferralTx: async () => {},
    };
    const outcome = await verifyOtp(
      deps.otpRepo,
      deps.users,
      deps.sessions,
      referralsWithMatch,
      deps.registration,
      signer,
      { phone: "+998901112233", code: "111111", purpose: "login", refCode: "ABCD1234" },
    );
    expect(outcome.user.phone).toBe("+998901112233");
    expect(outcome.refCodeAttributed).toBe(true);
  });

  it("keeps existing referrers untouched (no attribution for returning users)", async () => {
    const { hashOtpCode } = await import("@/lib/auth/password");
    const otp = makeOtp({ codeHash: hashOtpCode("222222") });
    const attributeReferralTx = vi.fn(async () => {});
    const deps = makeDeps(makeUser({ fullName: "Real Name" }), otp);
    const outcome = await verifyOtp(
      deps.otpRepo,
      deps.users,
      deps.sessions,
      { resolveReferrerByCodeTx: async () => ({ id: "r" }), attributeReferralTx },
      deps.registration,
      signer,
      { phone: "+998901112233", code: "222222", purpose: "login", refCode: "ABCD1234" },
    );
    expect(outcome.user.fullName).toBe("Real Name");
    expect(attributeReferralTx).not.toHaveBeenCalled();
    expect(outcome.refCodeAttributed).toBe(false);
  });
});
