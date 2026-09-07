# Vibecoding Educational Platform — Production Architecture

This repository contains the full-stack codebase for **Vibecoding.uz**, a commercial-grade online education platform for cohort-based courses, AI workflow automations, and Vibe Coding mentorships in Uzbekistan.

## 🚀 Key Features Implemented in Phase 1
- **Next.js 15 App Router** + TypeScript + Tailwind CSS design system tokens (`globals.css`).
- **Dual Theme System**: Light (`Cream`) & Dark (`Ink`) mode switcher with `next-themes`.
- **Database Schema**: Full PostgreSQL schema built with **Drizzle ORM** (`src/db/schema.ts`) covering Users, Cohorts, LMS Curriculum, Homework Submissions, CRM Leads, Payme/Click Payments, Certificates, Experts, FAQs, and Audit Logs.
- **Native MCP Server (`mcp-server/`)**: Built-in Model Context Protocol server enabling AI agents (Claude, Cursor, DeepSeek) to interact with CRM leads, cohorts, and metrics.
- **Token-Saving AI Architecture**: Includes `AGENTS.md` and `.ai/context.md` for zero-token-waste AI coding.
- **Marketing UI Foundation**: Header with Telegram online advice headset badge, Hero Section with Instrument Serif typography accents, Proof Stats, and Course Selection grid.

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Database Migration & Seeding
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run MCP Server for AI Agents
```bash
npm run mcp:start
```
