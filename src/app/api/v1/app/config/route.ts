import { BRAND } from "@/config/brand";
import { cached, v1Public } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { appConfigSchema } from "@/features/mobile/contracts-resources";

registerV1Route({
  method: "get",
  path: "/api/v1/app/config",
  tags: ["app"],
  summary: "Ilova konfiguratsiyasi (versiya, flaglar, yordam)",
  responses: {
    200: { description: "Konfig", content: { "application/json": { schema: appConfigSchema } } },
  },
});

function semverAtLeast(version: string | undefined, minimum: string): boolean {
  const parse = (v: string) => v.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const [a = [], b = []] = [version, minimum].map((v) => (v ? parse(v) : [0]));
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return true;
}

export async function GET(request: Request) {
  return v1Public(request, async () => {
    const minIos = process.env.MIN_APP_VERSION_IOS ?? "1.0.0";
    const minAndroid = process.env.MIN_APP_VERSION_ANDROID ?? "1.0.0";
    const latestIos = process.env.LATEST_APP_VERSION_IOS ?? minIos;
    const latestAndroid = process.env.LATEST_APP_VERSION_ANDROID ?? minAndroid;
    const clientVersion = request.headers.get("x-app-version") ?? undefined;
    const platform = (request.headers.get("x-app-platform") ?? "android").toLowerCase();
    const minimum = platform === "ios" ? minIos : minAndroid;
    return cached({
      minAppVersion: { ios: minIos, android: minAndroid },
      latestAppVersion: { ios: latestIos, android: latestAndroid },
      updateRequired: !semverAtLeast(clientVersion, minimum),
      featureFlags: {
        homework: true,
        certificates: true,
        referral: true,
        chat: process.env.CHAT_ENABLED !== "false",
        offlineCache: true,
      },
      support: {
        telegram: `https://t.me/${BRAND.telegramBot}`,
        email: process.env.SUPPORT_EMAIL ?? "yordam@naqsh.uz",
        phone: process.env.SUPPORT_PHONE ?? "+998712000000",
      },
      chatEnabled: process.env.CHAT_ENABLED !== "false",
      deepLinks: {
        course: "/kurs/{slug}",
        cabinet: "/kabinet",
        referral: "/ref/{code}",
      },
      deprecationPolicy:
        "Eskirgan endpointlar o'chirilishidan kamida 90 kun oldin Sunset sarlavhasi bilan belgilanadi. " +
        "Ilova har doim X-Api-Version va Sunset sarlavhalarini tekshirishi kerak.",
    }, undefined, 300);
  });
}
