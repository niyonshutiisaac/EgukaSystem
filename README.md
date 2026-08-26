# EgukaSystem — AI-Powered Business Operating System (Frontend)

**Project:** Multi-tenant SaaS for Rwandan (then East-African) SMEs — bakeries, restaurants, retail, pharmacies, wholesalers, salons, gyms, small manufacturers, clinics.

**Current phase:** Frontend only (React + Vite + Tailwind). Backend (NestJS + PostgreSQL + Redis) comes later — all data is mock, behind a thin data layer so API swap is easy.

> **This README is the project progress tracker. Every session starts here — read the "Where we left off" section before continuing.**

---

## 1. How to run

```bash
npm install
npm run dev        # start dev server (Vite)
npm run build      # production build (tsc + vite)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

---

## 2. Tech stack (locked)

| Layer | Choice |
|---|---|
| Build | Vite 8 + React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin, CSS-first tokens, no config file) |
| Routing | react-router-dom v7 |
| Charts | recharts |
| Icons | lucide-react |
| State | zustand (session persist to localStorage) |
| Utils | clsx + tailwind-merge (`cn()`), RWF formatters |
| Font | Inter (Google Fonts import in `src/index.css`) |

Scripts: `dev`, `build` (tsc + vite), `typecheck`, `lint` (eslint flat config with typescript-eslint + react-hooks v7 purity rules), `preview`.

---

## 3. Product architecture (as built)

```
EgukaSystem.io
├── PUBLIC        Landing (/), Pricing, Login (role picker), Register business, Pending, Renew
├── /platform     SUPERADMIN CONSOLE — approve businesses, manage plans & subscriptions, platform metrics
└── /app          BUSINESS AREA — tenant users only; each role gets its own dashboard + permitted modules
```

### Tenancy & subscription flow (fully designed, mock-driven)

1. Business registers at `/register` (plan → business details → contact) → status `PENDING`
2. Superadmin approves in **Business Requests** (optionally with 14-day trial) or rejects with note
3. Tenant becomes `TRIAL`/`ACTIVE` → all its users can log in
4. Features = **plan entitlement** (what the business paid for) ∩ **role permission** (what the job allows)
5. Seats: Starter 2 · Growth 5 · Professional 15 · Enterprise unlimited — Users page blocks adding users at cap and shows an upgrade prompt
6. Non-payment → tenant `SUSPENDED`/`EXPIRED` → `/renew` screen (data preserved)

### Roles
`superadmin` (platform only) · `owner` · `manager` · `cashier` · `production` · `accountant` (tenant roles).

### Single source of truth — `src/lib/catalog.ts`
- `PLANS` — price, seats, `featureFlags`, AI credits per plan
- `PLAN_ROLES` — which roles each plan may create
- `BUSINESS_MODULES` — every module with `{ roles: [], feature? }`
- `canAccess(module, role, planId)` — the one combined gate used by sidebar, guards and matrices

### Route guards — `src/components/guards.tsx`
`RequireAuth` · `RequirePlatform` · `RequireRole` · `RequireTenantUsable` (redirects pending→/pending, suspended→/renew).

### Session — `src/lib/session.ts`
Zustand + persist (`egukasystem-session` key). `DEMO_ACCOUNTS` = 8 demo logins covering all roles + trial/pending tenants. Login screen has a role picker.

---

## 4. File map

```
src/
├── main.tsx / App.tsx        entry + lazy-loaded routes (code-split per page)
├── index.css                 Tailwind v4 theme, Inter font, scrollbar styles
├── lib/
│   ├── types.ts              domain types (Tenant, Plan, Role, Sale, Batch...)
│   ├── catalog.ts            plans, roles, modules, feature flags, gates  ★ the core
│   ├── session.ts            zustand auth store + demo accounts
│   ├── utils.ts              cn(), formatRWF(), dates, initials, percentChange
│   └── chart.ts              recharts tooltip formatters
├── data/                     mock data (swap for API later)
│   ├── tenants.ts            ABC Bakery (Professional/active), Imane (Growth/trial),
│   │                         Karibu Café (Starter/pending), NZA (Professional/suspended)
│   ├── requests.ts           registration request queue
│   ├── products.ts           products + ingredients + recipes
│   ├── customers.ts          CRM profiles
│   ├── inventory.ts          stock ledger movements
│   ├── business.ts           sales, batches, expenses, suppliers, notifications, AI insights
│   └── metrics.ts            platform metrics, daily sales series, branch performance, top products
├── components/
│   ├── ui/                   Button, Card, Badge, Field(Input/Select/Textarea), Modal,
│   │                         Table, Tabs, KpiCard, PageHeader, EmptyState, UserAvatar,
│   │                         StatusBadges (plan/tenant/role/user), Spinner
│   ├── guards.tsx            route guards
│   ├── UpgradeModal.tsx      plan paywall ("feature locked on {plan}")
│   └── layout/
│       ├── BusinessShell.tsx dark sidebar, branch switcher, notifications, role/plan-aware nav
│       └── PlatformShell.tsx superadmin console shell
└── pages/
    ├── public/  LandingPage
    ├── auth/    LoginPage (role picker), RegisterPage (3-step wizard), PendingPage, RenewPage
    ├── platform/ PlatformDashboard, PlatformRequests, PlatformBusinesses, PlatformPlans
    ├── dashboards/ Owner, Manager, Cashier, Production, Accountant (role-specific landing pages)
    └── app/     PosPage, InventoryPage, ProductionPage, CustomersPage, CustomerDetailPage,
                 ReportsPage, UsersPage, BillingPage, SettingsPage
```

---

## 5. Build status (progress tracker)

| # | Task | Status |
|---|---|---|
| 1 | Scaffold Vite + React + TS + Tailwind v4 + deps + lint/tsconfig | ✅ done |
| 2 | Design system primitives + app shells | ✅ done |
| 3 | Mock data + zustand session (tenants/plans/roles/statuses) | ✅ done |
| 4 | Feature catalog + route guards | ✅ done |
| 5 | Login (role picker), Register wizard, Pending, Renew, Landing/Pricing | ✅ done |
| 6 | Superadmin console (dashboard, requests, businesses, plans) | ✅ done |
| 7 | Owner dashboard (6AM view + AI panel) | ✅ done |
| 8 | Manager / Cashier / Production / Accountant dashboards | ✅ done |
| 9 | Users & Roles (seats, invites, upgrade modal) | ✅ done |
| 10 | POS (cart, payment modal, receipt, transactions) | ✅ done |
| 11 | Inventory (stock, ledger, transfers) | ✅ done |
| 12 | Customers CRM (list + detail, AI insights) | ✅ done |
| 13 | Production (plan, recipes, batches, waste) | ✅ done |
| 14 | Reports & Analytics (trends, top products, branch comparison) | ✅ done |
| 15 | Billing / Subscription (plan compare, upgrade request, payment methods) | ✅ done |
| 16 | Settings (org profile, receipt defaults, branches) | ✅ done |
| 17 | README tracker + build/typecheck/lint verified | ✅ done |

**Verification status (last run):**
- `npm run build` ✅ (code-split, ~95KB gzip main + per-page chunks)
- `npx tsc --noEmit` ✅
- `npm run lint` ✅ (incl. react-hooks v7 purity rules — note: impure calls like `Date.now()` in render are flagged; use module-level constants)
- Dev server serves HTTP 200 ✅

---

## 6. Where we left off / next steps

**Frontend MVP is functionally complete.** All planned screens exist and every role × plan combination is demo-able.

**UI/UX upgrade (done):** modern redesign inspired by rssb.rw — new animated landing page (aurora hero, floating dashboard mockup, business-type marquee, count-up stats band, reveal-on-scroll sections, showcase, quote, CTA band, multi-column footer), CSS-only animation system (GPU transforms/opacity only, zero new dependencies, `prefers-reduced-motion` respected), page-transition fades, modal scale-in, button press feedback, KPI card entrances. Bundle unchanged (~84KB gzip main).

Suggested next steps (pick where to continue):

1. **Visual QA pass** — open each demo role and check spacing, empty states, mobile layout (sidebar is mobile-ready; POS grid + tables are responsive).
2. **Real login flow** — replace the dummy role-picker with a real login screen wired to a backend (the `DEMO_ACCOUNTS` list in `src/lib/session.ts` is the single switch point).
3. **Backend (NestJS)** — start the API: auth, organizations/tenants, plans/subscriptions, products, sales, inventory ledger, production, AI gateway. The frontend data layer (`src/data/*`) mirrors the domain types in `src/lib/types.ts` so HTTP services can replace imports one-by-one.
4. **Plan-aware routing hardening** — currently the sidebar hides locked modules and `/app/*` routes are guarded at shell level; add a per-module `RequirePlan` wrapper if deep links to locked pages should show the paywall instead of rendering.
5. **Multi-tenant login** — demo users are pre-bound to one tenant; a real session should carry `tenantId` and validate it server-side.
6. **i18n** — add Kinyarwanda via react-i18next when ready (all UI text is English now).
7. **Offline-tolerant POS** — design goal from the spec (queue + sync); requires service worker + IndexedDB.

**Known notes:**
- `src/lib/utils.ts` `formatRWF()` — compact mode used for charts; check large-value display on the platform console.
- Mock `SALES` are generated randomly on module load — totals vary slightly per refresh (fine for demo).
- Tailwind v4: theme tokens live in `src/index.css` `@theme`; no `tailwind.config.js`.
- Node 22+ required.

---

## 7. How the gating works (quick reference)

```ts
// src/lib/catalog.ts
BUSINESS_MODULES.find(m => m.key === 'reports')
// => { key:'reports', label:'Reports', feature:'advancedReports', roles:['owner','manager','accountant'], ... }

// Sidebar (BusinessShell) filters by role AND plan:
//   visible  = roles.includes(role) && (no feature || planHasFeature)
//   locked   = roles.includes(role) && feature && !planHasFeature  → shows "LOCKED ON {PLAN}" section

// Deep-link guard pattern (add when needed):
//   <RequirePlan module={m}>...</RequirePlan>
```