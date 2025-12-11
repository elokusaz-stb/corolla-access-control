# Corolla Architecture Documentation

## Overview

Corolla is a comprehensive access tracking tool built with Next.js 14, designed to manage and audit system access grants across an organization. The application follows a modern, layered architecture pattern optimized for maintainability and scalability.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Dashboard  │  │  Log Grant   │  │ Bulk Upload  │  │ Systems Admin│     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                 │                 │              │
│         └─────────────────┼─────────────────┼─────────────────┘              │
│                           │                 │                                │
│              ┌────────────▼─────────────────▼────────────┐                   │
│              │         SWR Data Fetching Layer          │                   │
│              │   (useAccessGrants, useSystems, etc.)    │                   │
│              └────────────────────────────────────────────┘                   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTP/REST
┌────────────────────────────────────▼────────────────────────────────────────┐
│                           SERVER (Next.js API)                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        API Route Handlers                             │   │
│  │   /api/users  /api/systems  /api/access-grants  /api/access-grants/bulk │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│         │ Zod Validation                                                     │
│  ┌──────▼───────────────────────────────────────────────────────────────┐   │
│  │                        Authorization Layer                            │   │
│  │   fetchCurrentUser()  isSystemOwner()  assertAdmin()                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│  ┌──────▼───────────────────────────────────────────────────────────────┐   │
│  │                          Service Layer                                │   │
│  │   usersService  systemsService  accessGrantsService  bulkUploadService│   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│  ┌──────▼───────────────────────────────────────────────────────────────┐   │
│  │                         Repository Layer                              │   │
│  │   usersRepo  systemsRepo  accessGrantsRepo                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│         │                                                                    │
│  ┌──────▼───────────────────────────────────────────────────────────────┐   │
│  │                          Prisma ORM                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────────┐
│                           DATABASE (Supabase)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │    Users    │  │   Systems   │  │   Tiers     │  │   Instances     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘    │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │        AccessGrants            │  │        SystemOwners             │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Model

### Core Entities

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │──────▶│    System    │◀──────│  Instance    │
│              │       │              │       │              │
│ id           │       │ id           │       │ id           │
│ name         │       │ name         │       │ name         │
│ email        │       │ description  │       │ systemId     │
│ managerId?   │       │              │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
       │                      │                      │
       │                      │                      │
       ▼                      ▼                      │
┌──────────────┐       ┌──────────────┐             │
│ SystemOwner  │       │ AccessTier   │             │
│              │       │              │             │
│ userId       │       │ id           │             │
│ systemId     │       │ name         │             │
│              │       │ systemId     │             │
└──────────────┘       └──────────────┘             │
       │                      │                      │
       │                      ▼                      │
       │               ┌──────────────┐              │
       └──────────────▶│ AccessGrant  │◀─────────────┘
                       │              │
                       │ id           │
                       │ userId       │
                       │ systemId     │
                       │ instanceId?  │
                       │ tierId       │
                       │ status       │
                       │ grantedBy    │
                       │ grantedAt    │
                       │ removedAt?   │
                       │ notes?       │
                       └──────────────┘
```

### Entity Descriptions

| Entity | Description |
|--------|-------------|
| **User** | Employee who can receive access grants. Self-referential manager relationship. |
| **System** | Application/platform that requires access control (e.g., Magento, Salesforce). |
| **Instance** | Environment within a system (e.g., Production, Staging, Wellness store). |
| **AccessTier** | Permission level within a system (e.g., Admin, Editor, Viewer). |
| **AccessGrant** | Record of user access to a system/tier/instance combination. |
| **SystemOwner** | Many-to-many relationship linking users who can manage a system. |

### Grant Status Flow

```
┌──────────┐     create      ┌──────────┐     remove      ┌──────────┐
│          │ ─────────────▶ │          │ ─────────────▶  │          │
│  (none)  │                │  active  │                 │ removed  │
│          │                │          │                 │          │
└──────────┘                └──────────┘                 └──────────┘
```

## API Overview

### Users API

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/users` | GET | Search/list users with filters | Any user |
| `/api/users` | POST | Create new user | Admin |

### Systems API

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/systems` | GET | List systems with search | Any user |
| `/api/systems` | POST | Create new system | Admin |
| `/api/systems/[id]` | GET | Get system details | Any user |
| `/api/systems/[id]` | PATCH | Update system | System owner |
| `/api/systems/[id]/tiers` | GET/POST | Manage access tiers | GET: Any / POST: Owner |
| `/api/systems/[id]/instances` | GET/POST | Manage instances | GET: Any / POST: Owner |
| `/api/systems/[id]/owners` | GET/POST | Manage system owners | GET: Any / POST: Owner |

### Access Grants API

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/access-grants` | GET | List grants with filters | Any user |
| `/api/access-grants` | POST | Create new grant | Any user |
| `/api/access-grants/[id]` | PATCH | Mark as removed | System owner |
| `/api/access-grants/bulk` | GET | Download CSV template | Any user |
| `/api/access-grants/bulk` | POST | Bulk upload grants | Any user |

## Authentication & Authorization

### Authentication Flow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Supabase Auth  │────▶│  Magic Link     │
│             │     │                 │     │  Email Sent     │
└─────────────┘     └─────────────────┘     └─────────────────┘
       │                                            │
       │                                            │
       ▼                                            ▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Session   │◀────│  Supabase SSR   │◀────│  Email Link     │
│   Cookie    │     │  Cookie Refresh │     │  Clicked        │
└─────────────┘     └─────────────────┘     └─────────────────┘
```

### Authorization Model

```typescript
// Phase 1 Role Model
type Role = 'user' | 'system_owner' | 'admin';

// Permission Matrix
const permissions = {
  user: [
    'read:users',
    'read:systems',
    'read:access-grants',
    'create:access-grants',
  ],
  system_owner: [
    ...user,
    'update:system',
    'create:tier',
    'create:instance',
    'add:owner',
    'remove:access-grant',
  ],
  admin: [
    ...system_owner,
    'create:system',
    'create:user',
  ],
};
```

### Authorization Helpers

```typescript
// Check if user is system owner
isSystemOwner(userId: string, systemId: string): Promise<boolean>

// Check if user has admin privileges
isAdminEmail(email: string): boolean

// Assertion functions (throw AuthorizationError on failure)
assertSystemOwner(userId: string, systemId: string): Promise<void>
assertAdmin(user: AuthUser): void
assertCanModifySystem(user: AuthUser, systemId: string): Promise<void>
```

## Bulk Upload Validation

### Validation Pipeline

```
┌─────────────────┐
│    CSV File     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Parse CSV     │ ─── Extract rows into structured objects
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Cache    │ ─── Pre-fetch users, systems, tiers, instances
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validate Rows   │ ─── Check each row against cache
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ Valid │ │ Error │
│ Rows  │ │ Rows  │
└───┬───┘ └───────┘
    │
    │ (if no errors)
    ▼
┌─────────────────┐
│  Batch Insert   │ ─── prisma.$transaction + createMany
└─────────────────┘
```

### Validation Rules

| Field | Rule |
|-------|------|
| `user_email` | Must exist in database |
| `system_name` | Must exist in database |
| `instance_name` | If provided, must belong to the system |
| `access_tier_name` | Must exist AND belong to the system |
| Duplicate check | No active grant for same user/system/tier/instance |

## Future Phases

### Phase 2: Approval Workflow

```
┌──────────┐     request     ┌──────────┐     approve     ┌──────────┐
│          │ ─────────────▶ │          │ ─────────────▶  │          │
│  (none)  │                │ pending  │                 │  active  │
│          │                │          │                 │          │
└──────────┘                └──────────┘                 └──────────┘
                                   │
                                   │ reject
                                   ▼
                            ┌──────────┐
                            │ rejected │
                            └──────────┘
```

### Phase 3: Automated Lifecycle

- Automatic expiration dates on grants
- Scheduled access reviews
- Integration with HR systems for joiners/leavers
- Audit trail and compliance reporting

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TailwindCSS |
| **UI Components** | shadcn/ui (customized), Lucide Icons |
| **Data Fetching** | SWR (stale-while-revalidate) |
| **Validation** | Zod |
| **ORM** | Prisma |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth (Magic Links) |
| **Testing** | Vitest, React Testing Library, Playwright |
| **Linting** | ESLint, Prettier |

## File Structure

```
ai-bootcamp-access-control/
├── app/                      # Next.js App Router
│   ├── (app)/               # Authenticated routes
│   │   ├── access/          # Access grant pages
│   │   ├── admin/           # Admin pages
│   │   └── dashboard/       # Dashboard pages
│   ├── (auth)/              # Auth routes (login)
│   ├── api/                 # API route handlers
│   │   ├── access-grants/   # Access grants endpoints
│   │   ├── systems/         # Systems endpoints
│   │   └── users/           # Users endpoints
│   └── auth/                # Auth callback
├── docs/                    # Documentation
├── prisma/                  # Prisma schema & migrations
├── src/
│   ├── components/          # React components
│   │   ├── access/          # Access-related components
│   │   ├── bulk/            # Bulk upload components
│   │   ├── layout/          # Layout components
│   │   ├── nav/             # Navigation components
│   │   ├── systems/         # System admin components
│   │   └── ui/              # Base UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Shared utilities
│   │   ├── api/             # API helpers
│   │   ├── csv/             # CSV parsing
│   │   ├── supabase/        # Supabase clients
│   │   └── validation/      # Zod schemas
│   └── server/              # Server-side code
│       ├── authz/           # Authorization logic
│       ├── repositories/    # Data access layer
│       └── services/        # Business logic
├── supabase/                # Supabase migrations
└── tests/                   # Test files
    ├── components/          # Component tests
    ├── e2e/                 # Playwright E2E tests
    ├── fixtures/            # Test fixtures
    ├── hooks/               # Hook tests
    ├── integration/         # Integration tests
    └── unit/                # Unit tests
```


