import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { drizzleReferralsRepository } from "@/features/referrals/server/referrals.repository";
import { errorResponse } from "@/lib/http/errors";

export async function GET(request: Request) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) return authResult.response;
  try {
    const balance = await drizzleReferralsRepository.loadBalance(authResult.session.userId);
    return NextResponse.json({ success: true, ...balance });
  } catch (error) {
    return errorResponse(error);
  }
}
