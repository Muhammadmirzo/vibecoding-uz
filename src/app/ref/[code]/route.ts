import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code || "";
  const targetUrl = new URL("/diagnostika", request.url);
  targetUrl.searchParams.set("ref", code);

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
