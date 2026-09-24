import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  type RouteConfig,
} from "@asteasolutions/zod-to-openapi";
import { errorEnvelopeSchema } from "@/features/mobile/contracts-resources";

export const v1Registry = new OpenAPIRegistry();

v1Registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Qisqa yashovchi mobil access token (15 daqiqa).",
});
v1Registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "session_token",
  description: "Web sessiya cookie'si — bir xil gate ikkalasini ham qabul qiladi.",
});

export interface V1RouteEntry extends RouteConfig {
  method: "get" | "post" | "patch" | "put" | "delete";
  path: string;
}

/** Every /api/v1 route module MUST call this at import time (CI test enforces it). */
export function registerV1Route(entry: V1RouteEntry): void {
  v1Registry.registerPath({
    ...entry,
    responses: {
      ...(entry.responses ?? {}),
      401: { description: "Avtorizatsiyadan o'tilmagan", content: { "application/json": { schema: errorEnvelopeSchema } } },
    },
  });
}

export function registeredV1Paths(): string[] {
  return v1Registry.definitions
    .filter((d) => d.type === "route")
    .map((d) => `${(d as { route: { method: string; path: string } }).route.method.toUpperCase()} ${(d as { route: { method: string; path: string } }).route.path}`);
}

export function buildOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(v1Registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "Naqsh Mobile API",
      description:
        "Naqsh o'quv platformasining rasmiy v1 API'si — iOS, Android va web uchun yagona kontrakt. " +
        "Barcha javoblar `{ data, meta? }` yoki `{ error: { code, message, details? } }` ko'rinishida.",
      license: { name: "Private" },
    },
    servers: [{ url: "https://master-2-jade.vercel.app" }],
    tags: [
      { name: "auth", description: "Token olish, yangilash, sessiyalar" },
      { name: "me", description: "Profil, yozuvlar, to'lovlar, sertifikat, referal" },
      { name: "courses", description: "Kurslar, darslar, progress" },
      { name: "homework", description: "Vazifalar topshirish" },
      { name: "devices", description: "Push qurilmalar" },
      { name: "app", description: "Ilova konfiguratsiyasi, OpenAPI" },
    ],
  });
}
