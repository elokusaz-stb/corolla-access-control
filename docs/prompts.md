# Corolla Development Prompts

This document records all prompts used to build Corolla Phase 1.

---

## Prompt 001 — Initialize Project Infrastructure

**Goal:** Set up the foundational project scaffolding.

**Deliverables:**
- Next.js App Router project with TypeScript
- TailwindCSS and shadcn/ui configuration
- Prisma initialized with Supabase connection
- Supabase Auth integration (client + server)
- Vitest, React Testing Library, Playwright setup
- ESLint, Prettier, TypeScript strict settings
- Project folder structure and boilerplate

---

## Prompt 002 — Implement Prisma Schema

**Goal:** Create the complete database schema for access tracking.

**Deliverables:**
- User model with manager self-relation
- System model with tiers, instances, owners
- Instance and AccessTier models
- AccessGrant model with status enum
- SystemOwner join table
- All relationships and indexes
- Initial migration SQL (with `ai_bootcamp_` prefix)

---

## Prompt 003 — Implement Users API + Search

**Goal:** Build the Users API for search and creation.

**Deliverables:**
- `GET /api/users` — Search/list users
- `POST /api/users` — Create user
- Zod validation schemas
- usersService and usersRepo
- Unit and integration tests

---

## Prompt 004 — Implement Systems API

**Goal:** Build complete systems management backend.

**Deliverables:**
- `GET/POST /api/systems` — List/create systems
- `GET/PATCH /api/systems/[id]` — Get/update system
- `GET/POST /api/systems/[id]/tiers` — Manage tiers
- `GET/POST /api/systems/[id]/instances` — Manage instances
- `GET/POST /api/systems/[id]/owners` — Manage owners
- Zod validation schemas
- systemsService and systemsRepo
- Unit and integration tests

---

## Prompt 005 — Implement Access Grants API

**Goal:** Build the core access grants management API.

**Deliverables:**
- `GET /api/access-grants` — List with filters
- `POST /api/access-grants` — Create grant
- `PATCH /api/access-grants/[id]` — Mark as removed
- Duplicate prevention logic
- Tier/instance validation
- accessGrantsService and accessGrantsRepo
- Unit and integration tests

---

## Prompt 006 — Implement Bulk Upload API

**Goal:** Enable bulk grant creation via CSV upload.

**Deliverables:**
- `POST /api/access-grants/bulk` — CSV upload endpoint
- `GET /api/access-grants/bulk` — CSV template download
- CSV parsing utility
- Row validation with entity lookups
- Batch insert with transaction
- bulkUploadService
- Unit and integration tests

---

## Prompt 007 — Implement Authorization Layer

**Goal:** Build centralized authorization for all APIs.

**Deliverables:**
- `fetchCurrentUser()` — Get authenticated user
- `isSystemOwner()` — Check ownership
- `assertSystemOwner()` — Throw on unauthorized
- `assertAdmin()` — Admin-only check
- AuthenticationError and AuthorizationError classes
- Apply authorization to protected routes
- Unit and integration tests

---

## Prompt 008 — Implement Global Layout & Navigation

**Goal:** Build the app shell with authentication guard.

**Deliverables:**
- Root layout with fonts and CSS
- Auth layout for login pages
- App layout with auth guard
- Sidebar navigation component
- Topbar with page title and CTA
- Login page with magic link
- Page skeletons for all routes
- Component and E2E tests

---

## Prompt 008B — Apply Corolla Design System

**Goal:** Refactor UI to match Corolla visual specification.

**Deliverables:**
- Tailwind color tokens for Corolla palette
- Floating window container
- Pill-shaped navigation items
- Typography hierarchy
- Shadow and border harmonization
- Updated Sidebar, Topbar components
- Component tests

---

## Prompt 009 — Build Access Overview Screen

**Goal:** Implement the main access grants dashboard.

**Deliverables:**
- Filter bar with user/system/status filters
- Quick Grant mini-card CTA
- Access grants list with CSS Grid
- AccessGrantRow component
- Status badges (active/removed)
- Remove action with optimistic UI
- Pagination
- SWR data fetching hooks
- Component and E2E tests

---

## Prompt 010 — Build Log Access Grant Screen

**Goal:** Implement the form for logging new access grants.

**Deliverables:**
- Autocomplete user field
- Autocomplete system field
- Tier dropdown (dynamic)
- Instance dropdown (dynamic, optional)
- Notes textarea
- Form validation with Zod
- Submit with success toast
- useDebounce and useCreateAccessGrant hooks
- Component and E2E tests

---

## Prompt 011 — Build Bulk Upload UI

**Goal:** Implement the bulk upload interface.

**Deliverables:**
- File upload card with drag-and-drop
- CSV preview table
- Valid/error row styling
- Error messages per row
- Insert button (only when valid)
- Success animation
- useBulkUpload hook
- Component and E2E tests

---

## Prompt 012 — Build Systems Admin Screens

**Goal:** Implement the systems administration interface.

**Deliverables:**
- Systems list with search
- System row component
- Create system modal
- System drawer with tabs
- Info tab (edit name/description)
- Tiers tab (list/add tiers)
- Instances tab (list/add instances)
- Owners tab (list/add owners)
- useSystemManagement hook
- Component and E2E tests

---

## Prompt 013 — Implement E2E Test Suite

**Goal:** Create comprehensive Playwright E2E tests.

**Deliverables:**
- Database seed script
- Test data constants
- Login helper (cookie bypass)
- auth.spec.ts — Login flow
- log-access-grant.spec.ts — Grant creation
- remove-access-grant.spec.ts — Grant removal
- bulk-upload.spec.ts — Bulk upload flow
- systems-admin.spec.ts — Systems management
- Playwright configuration
- E2E test documentation

---

## Prompt 014 — UX Polish Pass

**Goal:** Apply final visual and interaction refinements.

**Deliverables:**
- Global transitions and animations
- Shadow/border harmonization
- Typography audit
- Accessibility improvements (ARIA, focus)
- Loading skeletons
- Empty states
- Stagger animations
- Success/error animations
- Updated globals.css and tailwind.config.ts

---

## Prompt 015 — Final Cleanup & Documentation

**Goal:** Prepare the project for demo and production.

**Deliverables:**
- Code cleanup (unused imports, console logs)
- ESLint and Prettier pass
- API consistency audit
- Documentation files:
  - README.md (updated)
  - ARCHITECTURE.md
  - UI-UX-SPEC.md
  - TESTING.md
  - prompts.md
- Final test run validation

---

## Phase 1 Complete ✓

All 15 prompts have been executed successfully. Corolla Phase 1 is demo-ready with:

- Full access tracking functionality
- Beautiful Corolla design system
- Comprehensive test coverage
- Complete documentation

