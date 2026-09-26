import { NextRequest, NextResponse } from "next/server";
import { carryUtmParams } from "@/features/referrals/domain/utm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: refCode } = await params;
  const code = refCode || "";
  const targetUrl = new URL("/diagnostika", request.url);
  targetUrl.searchParams.set("ref", code);
  // Paid-traffic attribution must survive the redirect: the analytics tracker
  // reads `utm_*` from the URL on the landing page.
  carryUtmParams(request.nextUrl.searchParams, targetUrl);

  const response = NextResponse.redirect(targetUrl);

  if (code) {
    response.cookies.set("ref_code", code, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    });
  }

  return response;
}
