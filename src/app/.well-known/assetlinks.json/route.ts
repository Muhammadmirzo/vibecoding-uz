import { NextResponse } from "next/server";

/** Android App Links. Env yo'q bo'lsa xavfsiz bo'sh ro'yxat qaytadi. */
export async function GET() {
  const pkg = process.env.ANDROID_PACKAGE?.trim();
  const sha256 = process.env.ANDROID_SHA256?.trim();
  const relations = pkg && sha256
    ? [{
      relation: ["delegate_permission/common.handle_all_urls"],
      target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: [sha256] },
    }]
    : [];
  return NextResponse.json(relations, {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
  });
}
