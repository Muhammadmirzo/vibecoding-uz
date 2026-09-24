import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "get",
  path: "/api/v1/docs",
  tags: ["app"],
  summary: "Interaktiv API hujjat (Scalar)",
  responses: { 200: { description: "HTML hujjat" } },
});

export async function GET() {
  const html = `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Naqsh Mobile API — hujjat</title>
<style>body{margin:0;font-family:system-ui,sans-serif}</style>
</head>
<body>
<script id="api-reference" data-url="/api/v1/openapi.json"></script>
<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@latest"></script>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=300",
      "X-Request-Id": crypto.randomUUID(),
    },
  });
}
