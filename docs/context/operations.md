# Platform Operations, Deployment & Database Management

This document covers operational procedures, environment configuration, database migration workflows, background jobs, caching strategies, and deployment routines.

---

## ⚙️ ENVIRONMENT CONFIGURATION

The application requires specific environment variables for database connections, payment gateways, SMS gateways, and Telegram integration.

### Core Environment Variables

```env
# Node & App Runtime
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Connection (PostgreSQL)
DATABASE_URL=postgres://vibecoding:vibecoding_secret@localhost:5432/vibecoding_db

# JWT & Authentication
JWT_SECRET=super-secret-jwt-key-min-32-chars-length
NEXTAUTH_SECRET=super-secret-nextauth-key

# Uzbek SMS Gateway (Eskiz.uz)
ESKIZ_EMAIL=admin@vibecoding.uz
ESKIZ_PASSWORD=eskiz-api-password

# Payment Gateways (Payme & Click)
PAYME_MERCHANT_ID=payme-merchant-id
PAYME_SECRET_KEY=payme-secret-key
CLICK_SERVICE_ID=click-service-id
CLICK_MERCHANT_ID=click-merchant-id
CLICK_SECRET_KEY=click-secret-key

# Telegram Bot & Notifications
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ADMIN_CHAT_ID=-100123456789

# Email Provider (Resend)
RESEND_API_KEY=re_123456789_abcdef
```

---

## 🗄️ DATABASE MIGRATIONS & SEEDING

Database schema is managed using **Drizzle ORM** with PostgreSQL.

### Workflow & Commands

1. **Schema Modifications**: Edit table definitions in `src/db/schema.ts`.
2. **Generate Migration**: Run `npm run db:generate` to produce SQL migration files in `drizzle/`.
3. **Apply Migration**: Run `npm run db:migrate` to execute pending migrations against `DATABASE_URL`.
4. **Seed Demo Data**: Run `npm run db:seed` to populate PostgreSQL with realistic Uzbek test data (users, cohorts, courses, leads).

---

## 🔄 BACKGROUND JOBS, CRON & QUEUES

- **Cron Triggers**: Located under `src/app/api/cron/`. Triggered by external schedulers (Vercel Cron, GitHub Actions, or crontab) with a bearer authorization token.
  - `/api/cron/drip-release`: Evaluates lesson drip release schedules and unlocks content.
  - `/api/cron/telegram-reminders`: Sends automated Telegram reminders for pending homework or upcoming meets.
  - `/api/cron/lead-cleanup`: Archives stale leads and produces daily sales digests.

---

## ⚡ CACHING & PERFORMANCE OPTIMIZATION

- **Incremental Static Regeneration (ISR)**: Public content pages (blog posts, course landing pages, FAQs, glossary) utilize ISR for high-speed delivery with automated background revalidation.
- **Dynamic Route Caching**: Dynamic user routes (`/kabinet/*`, `/admin/*`) bypass static caches and execute server queries per request with strict JWT session verification.

---

## 🐳 DOCKER & DEPLOYMENT ROUTINES

### Local Dev with Docker Compose
```bash
# Start PostgreSQL container
docker-compose up -d

# Seed database
npm run db:seed

# Start dev server
npm run dev
```

### Production Build & Launch
```bash
# 1. Typecheck and run tests
npx tsc --noEmit
npm run test

# 2. Build Next.js application
npm run build

# 3. Start production server
npm run start
```
