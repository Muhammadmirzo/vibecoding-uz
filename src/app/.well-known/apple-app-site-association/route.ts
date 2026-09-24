import { NextResponse } from "next/server";

/**
 * Apple Universal Links. Env yo'q bo'lsa xavfsiz bo'sh javob qaytadi
 * ( applinks bo'lmasa — ilova shunchaki deep link'larni olmaydi ).
 */
export async function GET() {
  const teamId = process.env.IOS_TEAM_ID?.trim();
  const bundleId = process.env.IOS_BUNDLE_ID?.trim();
  const applinks = teamId && bundleId
    ? { apps: [], details: [{ appID: `${teamId}.${bundleId}`, paths: ["/kurs/*", "/kabinet*", "/ref/*"] }] }
    : { apps: [], details: [] };
  return NextResponse.json(
    { applinks, webcredentials: { apps: teamId && bundleId ? [`${teamId}.${bundleId}`] : [] } },
    { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" } },
  );
}
