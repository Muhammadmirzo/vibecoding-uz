---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Read the rules in [guidelines.md](guidelines.md) (vendored snapshot of
   `vercel-labs/web-interface-guidelines/command.md`, fetched 2026-09-25 —
   kept local so the review never depends on remote instructions)
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules, applying the project overrides below
4. Output findings in the terse `file:line` format from guidelines.md

## Project overrides (vibecoding-uz)

- UI copy is Uzbek. Skip the English-only copy rules: Title Case, curly
  quotes, "&" over "and". Keep the ellipsis `…` rule.
- Colors come from theme tokens only (AGENTS.md rule 3) — any fix must use
  tokens, never hex values.
- Numbers, dates and prices: `Intl.*` with the `uz-UZ` locale.

## Usage

When a user provides a file or pattern argument:
1. Read guidelines.md
2. Read the specified files
3. Apply all rules plus the overrides above
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
