# syntax=docker/dockerfile:1
# Naqsh app image: runs on any Docker host (VPS, Fly, Railway, Render, Kubernetes…).
# Pattern: Next.js standalone output + official with-docker example
# (https://nextjs.org/docs/app/api-reference/config/next-config-js/output).
# No secret is ever baked into a layer: runtime env comes from the host (env_file / platform env).

ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS base
WORKDIR /app
# sharp/next-swc on musl need glibc shims
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined into browser JS at build time (public by design).
ARG NEXT_PUBLIC_APP_URL=""
ARG NEXT_PUBLIC_TELEGRAM_BOT_NAME=""
ARG NEXT_PUBLIC_TELEGRAM_WIDGET=""
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_TELEGRAM_BOT_NAME=${NEXT_PUBLIC_TELEGRAM_BOT_NAME} \
    NEXT_PUBLIC_TELEGRAM_WIDGET=${NEXT_PUBLIC_TELEGRAM_WIDGET}
# DATABASE_URL is optional at build: pass it as a BuildKit secret (never stored in a layer):
#   docker build --secret id=database_url,env=DATABASE_URL .
# Without it an unreachable placeholder is used; DB-backed pages render at request time anyway.
# SESSION_SECRET is checked at module load (fail closed), so the build gets a throwaway value that
# exists only in this RUN step; the real one comes from the host at runtime. Verified 2026-09-26:
# `next build` succeeds with no .env and the placeholder appears nowhere in .next/.
RUN --mount=type=secret,id=database_url,required=false \
    DATABASE_URL="$(cat /run/secrets/database_url 2>/dev/null || echo 'postgres://build@127.0.0.1:1/build')" \
    SESSION_SECRET="build-only-placeholder-never-used-at-runtime" \
    npm run build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs \
    && mkdir -p .next/cache && chown -R nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
# /api/health runs a real DB query: 200 ok, 503 when the database is unreachable.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
# Next finishes in-flight requests and pending after() callbacks on SIGTERM.
STOPSIGNAL SIGTERM
CMD ["node", "server.js"]
