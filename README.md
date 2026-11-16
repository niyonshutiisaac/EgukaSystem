# EgukaSystem 🏢

**A Multi-Tenant SaaS Platform Empowering Rwandan SMEs to Manage Their Entire Business Operations — From Point of Sale to Production, Inventory, and AI-Powered Insights.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Live_Demo-egukasystem.vercel.app-success)](https://egukasystem.vercel.app)


## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Tenancy & Subscription Model](#-tenancy--subscription-model)
- [Role-Based Access Control](#-role-based-access-control)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Project Structure](#-project-structure)
- [Build Status](#-build-status)
- [Technical Decisions & Trade-offs](#-technical-decisions--trade-offs)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 The Problem

Small and medium-sized enterprises (SMEs) in Rwanda—bakeries, restaurants, retail shops, pharmacies, salons, and clinics—operate on fragmented systems. They use separate tools for point-of-sale, inventory tracking, production planning, customer management, and accounting. This fragmentation leads to:

- **Data Silos:** Sales data doesn't talk to inventory, and inventory doesn't talk to production.
- **Operational Blind Spots:** Business owners lack a unified view of their performance across branches and departments.
- **Manual Overhead:** Staff rely on spreadsheets and paper trails, increasing errors and inefficiency.
- **No Scalability:** Existing enterprise solutions are too expensive and complex for local SMEs.

---

## 💡 The Solution

**EgukaSystem** is a **multi-tenant, role-based business operating system** built specifically for the realities of East African SMEs. It consolidates point-of-sale, inventory management, production planning, customer CRM, and financial reporting into a single, cohesive platform.

The system is designed as a **SaaS product from day one**, with a superadmin console for platform management, a tenant onboarding flow with subscription plans, and granular role-based access control that mirrors real-world business hierarchies.

> **Current Status:** The frontend MVP is **functionally complete**. All planned screens exist, and every role × plan combination is demo-able. The data layer is mock-driven but architected behind a thin abstraction layer, making the swap to a real backend (NestJS + PostgreSQL) straightforward. A live demo is available at [egukasystem.vercel.app](https://egukasystem.vercel.app).

---

## ✨ Key Features

- **🏢 Multi-Tenant SaaS Architecture:** Supports multiple independent businesses (tenants) on a single platform, with data isolation and subscription-based access.
- **🔐 Granular Role-Based Access Control (RBAC):** Six distinct roles—`superadmin`, `owner`, `manager`, `cashier`, `production`, and `accountant`—each with its own dashboard and permitted modules.
- **📊 Role-Specific Dashboards:** Tailored landing pages for every role, including a "6AM view" for owners and operational dashboards for managers, cashiers, production staff, and accountants.
- **💳 Subscription & Plan Management:** Tiered plans (Starter, Growth, Professional, Enterprise) with feature flags, seat limits, and AI credits. A superadmin console handles business approvals, plan management, and platform metrics.
- **🛒 Point of Sale (POS):** Full cart, payment modal, receipt generation, and transaction history.
- **📦 Inventory Management:** Stock tracking, ledger movements, and inter-branch transfers.
- **🏭 Production Planning:** Recipes, batch management, and waste tracking for businesses that manufacture goods.
- **👥 Customer CRM:** Customer profiles with AI-generated insights.
- **📈 Reports & Analytics:** Sales trends, top products, and branch performance comparisons using Recharts.
- **🤖 AI-Powered Insights:** Integrated AI panel for business intelligence and customer insights (mock-driven in the frontend MVP).
- **🎨 Modern, Responsive UI:** Built with Tailwind CSS v4 and an animated landing page (aurora hero, count-up stats, reveal-on-scroll sections) with a CSS-only animation system that respects `prefers-reduced-motion`.

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Build** | Vite 8 + React 19 + TypeScript 6 | Fast HMR, modern React features, strong type safety |
| **Styling** | Tailwind CSS v4 | CSS-first configuration, no `tailwind.config.js`, rapid UI development |
| **Routing** | React Router DOM v7 | Lazy-loaded routes with code-splitting per page |
| **State** | Zustand | Lightweight session store with `localStorage` persistence |
| **Charts** | Recharts | Declarative, composable charting for dashboards and reports |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |
| **Utilities** | clsx + tailwind-merge (`cn()`), RWF formatters | Clean conditional class merging and locale-aware currency formatting |
| **Font** | Inter (Google Fonts) | Clean, modern typography |
| **Linting** | ESLint (flat config) + typescript-eslint + react-hooks v7 | Enforces purity rules and code quality |
| **Backend (Planned)** | NestJS + PostgreSQL + Redis | Production-grade API, relational data modeling, and caching |

---

## 🏗️ Architecture Overview

The application is organized around **two distinct areas**, separated by access level:

```
EgukaSystem.io
├── PUBLIC
│   ├── Landing (/)
│   ├── Pricing
│   ├── Login (role picker)
│   ├── Register Business
│   ├── Pending (awaiting approval)
│   └── Renew (subscription renewal)
│
├── /platform — SUPERADMIN CONSOLE
│   ├── Platform Dashboard (metrics)
│   ├── Business Requests (approve/reject)
│   ├── Platform Businesses (manage tenants)
│   └── Platform Plans (manage subscriptions)
│
└── /app — BUSINESS AREA (tenant users only)
    ├── Role-Specific Dashboards
    │   ├── Owner, Manager, Cashier, Production, Accountant
    ├── Operational Modules
    │   ├── POS, Inventory, Production, Customers CRM
    │   ├── Reports & Analytics, Users & Roles
    │   └── Billing, Settings
```

**Request Flow:**
1. A business registers at `/register` → status becomes `PENDING`.
2. A superadmin approves the request in **Business Requests** (optionally granting a 14-day trial).
3. The tenant becomes `TRIAL` or `ACTIVE` → its users can log in.
4. Feature access is determined by **plan entitlement** (what the business paid for) ∩ **role permission** (what the job allows).
5. Non-payment leads to `SUSPENDED`/`EXPIRED` status → the `/renew` screen is shown (data is preserved).

---

## 🏢 Tenancy & Subscription Model

The platform implements a **sophisticated yet pragmatic** SaaS subscription model:

| Plan | Seats | AI Credits | Key Feature Flags |
| :--- | :--- | :--- | :--- |
| **Starter** | 2 | Limited | Core POS & Inventory |
| **Growth** | 5 | Standard | + Production & CRM |
| **Professional** | 15 | Enhanced | + Advanced Reports |
| **Enterprise** | Unlimited | Unlimited | All features + Priority support |

- **Single Source of Truth:** All plan, role, and module definitions live in `src/lib/catalog.ts`. The `canAccess(module, role, planId)` function is the **one combined gate** used by the sidebar, route guards, and feature matrices.
- **Seat Enforcement:** The Users page blocks adding users at the plan's seat cap and displays an upgrade prompt.

---

## 🔐 Role-Based Access Control

The system implements **six distinct roles** with clearly separated concerns:

| Role | Scope | Primary Responsibilities |
| :--- | :--- | :--- |
| **`superadmin`** | Platform-wide | Approve businesses, manage plans, view platform metrics |
| **`owner`** | Tenant-wide | Full business oversight, financial reports, user management |
| **`manager`** | Tenant-wide | Daily operations, inventory, staff management |
| **`cashier`** | POS | Sales transactions, receipts, customer checkout |
| **`production`** | Production | Batch planning, recipe management, waste tracking |
| **`accountant`** | Financial | Expense tracking, financial reports, reconciliation |

Route guards (`RequireAuth`, `RequirePlatform`, `RequireRole`, `RequireTenantUsable`) enforce access at the routing level, redirecting users appropriately (e.g., `pending` → `/pending`, `suspended` → `/renew`).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 22+** (required)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/niyonshutiisaac/EgukaSystem.git
   cd EgukaSystem
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (`tsc` + `vite`) |
| `npm run typecheck` | Run TypeScript compiler (`tsc --noEmit`) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

---

## 🔑 Demo Accounts

The login screen includes a **role picker** with **8 demo accounts** covering all roles and tenant states (active, trial, pending, suspended). Simply select a role to log in and explore the corresponding dashboard.

| Demo Account | Role | Tenant Status |
| :--- | :--- | :--- |
| Superadmin | `superadmin` | Platform |
| Owner (ABC Bakery) | `owner` | Active (Professional) |
| Manager (ABC Bakery) | `manager` | Active (Professional) |
| Cashier (ABC Bakery) | `cashier` | Active (Professional) |
| Owner (Imane) | `owner` | Trial (Growth) |
| Owner (Karibu Café) | `owner` | Pending (Starter) |
| Owner (NZA) | `owner` | Suspended (Professional) |
| Accountant (ABC Bakery) | `accountant` | Active (Professional) |

> **Note:** All data is mock-driven. The mock data layer (`src/data/*`) mirrors the domain types in `src/lib/types.ts`, making it easy to swap in real API calls later.

---

## 📁 Project Structure

```
src/
├── main.tsx / App.tsx          # Entry + lazy-loaded routes (code-split per page)
├── index.css                   # Tailwind v4 theme, Inter font, scrollbar styles
├── lib/
│   ├── types.ts                # Domain types (Tenant, Plan, Role, Sale, Batch...)
│   ├── catalog.ts              # Plans, roles, modules, feature flags, gates ★ core
│   ├── session.ts              # Zustand auth store + demo accounts
│   ├── utils.ts                # cn(), formatRWF(), dates, initials, percentChange
│   └── chart.ts                # Recharts tooltip formatters
├── data/                       # Mock data (swap for API later)
│   ├── tenants.ts              # ABC Bakery, Imane, Karibu Café, NZA
│   ├── requests.ts             # Registration request queue
│   ├── products.ts             # Products + ingredients + recipes
│   ├── customers.ts            # CRM profiles
│   ├── inventory.ts            # Stock ledger movements
│   ├── business.ts             # Sales, batches, expenses, suppliers, AI insights
│   └── metrics.ts              # Platform metrics, daily sales series, branch performance
├── components/
│   ├── ui/                     # Button, Card, Badge, Field, Modal, Table, Tabs, KpiCard, etc.
│   ├── guards.tsx              # Route guards
│   ├── UpgradeModal.tsx        # Plan paywall ("feature locked on {plan}")
│   └── layout/
│       ├── BusinessShell.tsx   # Dark sidebar, branch switcher, role/plan-aware nav
│       └── PlatformShell.tsx   # Superadmin console shell
└── pages/
    ├── public/                 # LandingPage
    ├── auth/                   # LoginPage (role picker), RegisterPage (3-step wizard), PendingPage, RenewPage
    ├── platform/               # PlatformDashboard, PlatformRequests, PlatformBusinesses, PlatformPlans
    ├── dashboards/             # Owner, Manager, Cashier, Production, Accountant
    └── app/                    # PosPage, InventoryPage, ProductionPage, CustomersPage, ReportsPage, UsersPage, BillingPage, SettingsPage
```

---

## 📊 Build Status

The frontend MVP is **functionally complete** with all planned screens and role × plan combinations demo-able.

| # | Task | Status |
| :--- | :--- | :--- |
| 1 | Scaffold Vite + React + TS + Tailwind v4 + deps + lint/tsconfig | ✅ Done |
| 2 | Design system primitives + app shells | ✅ Done |
| 3 | Mock data + Zustand session (tenants/plans/roles/statuses) | ✅ Done |
| 4 | Feature catalog + route guards | ✅ Done |
| 5 | Login (role picker), Register wizard, Pending, Renew, Landing/Pricing | ✅ Done |
| 6 | Superadmin console (dashboard, requests, businesses, plans) | ✅ Done |
| 7 | Owner dashboard (6AM view + AI panel) | ✅ Done |
| 8 | Manager / Cashier / Production / Accountant dashboards | ✅ Done |
| 9 | Users & Roles (seats, invites, upgrade modal) | ✅ Done |
| 10 | POS (cart, payment modal, receipt, transactions) | ✅ Done |
| 11 | Inventory (stock, ledger, transfers) | ✅ Done |
| 12 | Customers CRM (list + detail, AI insights) | ✅ Done |
| 13 | Production (plan, recipes, batches, waste) | ✅ Done |
| 14 | Reports & Analytics (trends, top products, branch comparison) | ✅ Done |
| 15 | Billing / Subscription (plan compare, upgrade request, payment methods) | ✅ Done |
| 16 | Settings (org profile, receipt defaults, branches) | ✅ Done |
| 17 | README tracker + build/typecheck/lint verified | ✅ Done |

**Verification Status:**
- `npm run build` ✅ (code-split, ~95KB gzip main + per-page chunks)
- `npx tsc --noEmit` ✅
- `npm run lint` ✅ (includes react-hooks v7 purity rules)

---

## ⚖️ Technical Decisions & Trade-offs

| Decision | Rationale | Trade-off |
| :--- | :--- | :--- |
| **Frontend-first with mock data** | Allows rapid UI/UX iteration and full demo-ability before backend investment. The data layer is abstracted behind `src/data/*`, mirroring domain types for seamless API swap. | Requires disciplined separation of concerns to avoid costly refactoring later. |
| **Tailwind CSS v4 (CSS-first config)** | Eliminates `tailwind.config.js`, simplifies theme customization, and leverages modern CSS features like `@theme` tokens. | Smaller ecosystem of plugins compared to v3. |
| **Zustand for state** | Minimal boilerplate, session persistence to `localStorage`, and a clear separation between session state and UI state. | Less opinionated structure than Redux; requires team discipline. |
| **Single source of truth for gating (`catalog.ts`)** | One file defines plans, roles, modules, and feature flags. The `canAccess()` function is reused by sidebar, guards, and matrices—eliminating drift between UI and permissions. | Adding a new module requires updating the catalog, but the centralized approach ensures consistency. |
| **Route guards as components** | Declarative, composable guards (`RequireAuth`, `RequireRole`, etc.) keep access logic close to routing and easy to reason about. | Guards must be applied consistently across routes; omissions can create gaps. |
| **Lazy-loaded routes (code-splitting)** | Each page is loaded on demand, keeping the initial bundle small (~84KB gzip main). | Slight delay on first navigation to a new page (mitigated by prefetching). |

---

## 🔮 Roadmap

The following are the **next high-priority steps** to take the project from frontend MVP to a production-ready SaaS:

- [ ] **Real Login Flow:** Replace the demo role-picker with a real authentication screen wired to a backend. The `DEMO_ACCOUNTS` list in `src/lib/session.ts` is the single switch point.
- [ ] **Backend (NestJS + PostgreSQL + Redis):** Build the API: auth, organizations/tenants, plans/subscriptions, products, sales, inventory ledger, production, and an AI gateway. The frontend data layer (`src/data/*`) mirrors domain types, making HTTP service replacement straightforward.
- [ ] **Plan-Aware Routing Hardening:** Add per-module `RequirePlan` wrappers so deep links to locked pages show the paywall instead of rendering.
- [ ] **Multi-Tenant Login:** Extend the session to carry `tenantId` and validate it server-side (demo users are currently pre-bound to one tenant).
- [ ] **Internationalization (i18n):** Add Kinyarwanda via `react-i18next` (all UI text is currently English).
- [ ] **Offline-Tolerant POS:** Design goal from the spec—queue sales and sync when connectivity is restored, using a service worker and IndexedDB.
- [ ] **Visual QA Pass:** Systematic review of spacing, empty states, and mobile layout across all demo roles (sidebar is mobile-ready; POS grid and tables are responsive).

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---



## 📬 Contact

**Isaac Niyonshuti**

- GitHub: [@niyonshutiisaac](https://github.com/niyonshutiisaac)
- Live Demo: [egukasystem.vercel.app](https://egukasystem.vercel.app)
- Project Link: [https://github.com/niyonshutiisaac/EgukaSystem](https://github.com/niyonshutiisaac/EgukaSystem)

---

*Built with a focus on empowering Rwandan SMEs through thoughtful, scalable software.*
