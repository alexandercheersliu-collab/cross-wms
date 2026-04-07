# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version Notes

This project uses Next.js 16.2.2, which has breaking changes from earlier versions. Always read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Build, Test, and Development Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint with ESLint
npm run lint
```

## Project Structure

- **app/**: App Router directory containing all routes, layouts, and pages
  - **layout.tsx**: Root layout with Geist font configuration
  - **page.tsx**: Home page component
  - **globals.css**: Global styles with Tailwind v4 CSS import
- **public/**: Static assets (images, SVGs)
- **next.config.ts**: Next.js configuration (TypeScript)
- **postcss.config.mjs**: PostCSS config with @tailwindcss/postcss plugin
- **eslint.config.mjs**: ESLint configuration using flat config format

## Technology Stack

- **Framework**: Next.js 16.2.2 (App Router)
- **React**: 19.2.4
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4 with `@import "tailwindcss"` syntax
- **Fonts**: Geist (Sans + Mono) via next/font/google
- **Database ORM**: Prisma 7.6.0 (dependency present, schema not yet configured)
- **Icons**: Lucide React
- **Utilities**: class-variance-authority, clsx, tailwind-merge

## Key Configuration Details

### Tailwind CSS v4
This project uses Tailwind CSS v4, which has significant differences from v3:
- CSS-first configuration (no `tailwind.config.js`)
- Use `@import "tailwindcss"` in globals.css
- Theme customization via `@theme inline` in CSS
- See `node_modules/next/dist/docs/01-app/02-guides/tailwind-v3-css.md` for migration details

### Path Aliases
TypeScript is configured with `@/*` mapping to `./*`, allowing imports like:
```typescript
import { something } from "@/lib/utils";
```

### ESLint
Uses the new flat config format (`eslint.config.mjs`) with:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

## Local Documentation Reference

Next.js documentation is available locally at:
- `node_modules/next/dist/docs/01-app/01-getting-started/` - Getting started guides
- `node_modules/next/dist/docs/01-app/02-guides/` - In-depth guides
- `node_modules/next/dist/docs/01-app/03-api-reference/` - API documentation
- `node_modules/next/dist/docs/04-glossary.md` - Terminology glossary

@AGENTS.md
