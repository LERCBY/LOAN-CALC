# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Loan CAL (`artifacts/loan-cal`)
- **Type**: react-vite web app
- **Preview path**: `/`
- **Description**: SAMA-compliant Financial Loan Calculator
- **Stack**: React + Vite + Tailwind CSS + Recharts + Lucide icons
- **Features**:
  - Bilingual Arabic/English with RTL support
  - DSR (Debt Service Ratio) calculation per SAMA regulations (33.33% employees / 25% retirees)
  - APR calculation including admin fees (1% or max SAR 5,000)
  - Max eligible loan amount calculation
  - Principal vs. interest pie chart + monthly breakdown bar chart
  - Amortization schedule table with pagination
  - localStorage persistence for personal data
  - Dark/light mode toggle
  - Mobile-responsive design
