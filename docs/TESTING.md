# Corolla Testing Documentation

## Overview

Corolla uses a comprehensive testing strategy with three layers:

1. **Unit Tests** — Test individual functions and services in isolation
2. **Integration Tests** — Test API routes with mocked dependencies
3. **End-to-End (E2E) Tests** — Test complete user workflows in a browser

## Test Stack

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit & integration test runner |
| **React Testing Library** | Component testing utilities |
| **Playwright** | Browser-based E2E testing |
| **jsdom** | DOM environment for component tests |

## Running Tests

### All Unit & Integration Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test

# Run once (CI mode)
npm run test -- --run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Specific Test Files

```bash
# Run specific file
npm test -- tests/unit/usersService.test.ts

# Run tests matching pattern
npm test -- --grep "should create user"

# Run specific directory
npm test -- tests/integration/
```

### E2E Tests (Playwright)

```bash
# Seed database first
npm run e2e:seed

# Run all E2E tests
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Run with Playwright UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run specific E2E file
npx playwright test tests/e2e/auth.spec.ts
```

## Test Directory Structure

```
tests/
├── components/              # React component tests
│   ├── AccessGrantRow.test.tsx
│   ├── CorollaSidebar.test.tsx
│   ├── SystemRow.test.tsx
│   └── ...
├── e2e/                     # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── log-access-grant.spec.ts
│   ├── remove-access-grant.spec.ts
│   ├── bulk-upload.spec.ts
│   ├── systems-admin.spec.ts
│   ├── fixtures/
│   │   ├── seed.ts          # DB seed script
│   │   └── test-data.ts     # Test constants
│   ├── helpers/
│   │   └── login.ts         # Auth helper
│   └── README.md
├── fixtures/                # Test CSV files
│   ├── valid_grants.csv
│   ├── invalid_format.csv
│   └── ...
├── hooks/                   # Custom hook tests
│   ├── useAccessGrants.test.ts
│   ├── useBulkUpload.test.ts
│   └── ...
├── integration/             # API integration tests
│   └── api/
│       ├── accessGrants.test.ts
│       ├── authorization.test.ts
│       ├── bulkUpload.test.ts
│       ├── systems.test.ts
│       └── users.test.ts
├── lib/                     # Utility function tests
│   └── utils.test.ts
└── unit/                    # Service layer tests
    ├── accessGrantsService.test.ts
    ├── authorization.test.ts
    ├── bulkUploadService.test.ts
    ├── systemsService.test.ts
    └── usersService.test.ts
```

## Unit Tests

Unit tests verify individual functions and services work correctly in isolation.

### Service Tests

Located in `tests/unit/`, these test business logic:

```typescript
// tests/unit/usersService.test.ts
describe('usersService', () => {
  describe('searchUsers', () => {
    it('should return users matching search query', async () => {
      // Arrange
      vi.mocked(usersRepo.findMany).mockResolvedValue([mockUser]);
      
      // Act
      const result = await usersService.searchUsers({ search: 'john' });
      
      // Assert
      expect(result.users).toHaveLength(1);
      expect(usersRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'john' })
      );
    });
  });
});
```

### Mocking Pattern

```typescript
// Mock the entire repository module
vi.mock('@/server/repositories/usersRepo', () => ({
  usersRepo: {
    findMany: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    exists: vi.fn(),
  },
}));

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Integration Tests

Integration tests verify API routes work correctly with services.

### API Route Tests

Located in `tests/integration/api/`:

```typescript
// tests/integration/api/users.test.ts
describe('GET /api/users', () => {
  it('should return users matching search', async () => {
    // Arrange
    vi.mocked(usersService.searchUsers).mockResolvedValue({
      users: [mockUser],
      total: 1,
    });

    // Act
    const request = new NextRequest('http://localhost/api/users?search=john');
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.data.users).toHaveLength(1);
  });
});
```

### Testing Authorization

```typescript
// tests/integration/api/authorization.test.ts
describe('Protected Routes', () => {
  it('should return 403 when non-owner tries to update system', async () => {
    // Mock non-owner user
    vi.mocked(authorization.getAuthContext).mockResolvedValue({
      user: { id: 'non-owner', email: 'user@test.com' },
      isAdmin: false,
    });

    const request = new NextRequest('http://localhost/api/systems/sys-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New Name' }),
    });

    const response = await PATCH(request, { params: { id: 'sys-1' } });
    
    expect(response.status).toBe(403);
  });
});
```

## Component Tests

Component tests verify UI components render and behave correctly.

### Testing Components

```typescript
// tests/components/AccessGrantRow.test.tsx
describe('AccessGrantRow', () => {
  const mockGrant: AccessGrant = {
    id: 'grant-1',
    user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    system: { id: 'system-1', name: 'Magento' },
    tier: { id: 'tier-1', name: 'Admin' },
    status: 'active',
    // ...
  };

  it('renders user information correctly', () => {
    render(<AccessGrantRow grant={mockGrant} onRemove={vi.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const mockOnRemove = vi.fn().mockResolvedValue(undefined);
    render(<AccessGrantRow grant={mockGrant} onRemove={mockOnRemove} />);
    
    const removeButton = screen.getByRole('button', { 
      name: /remove access grant/i 
    });
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith('grant-1');
    });
  });
});
```

### Testing Hooks

```typescript
// tests/hooks/useAccessGrants.test.ts
describe('useAccessGrants', () => {
  it('should fetch access grants', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { grants: [], total: 0 } }),
    });

    const { result } = renderHook(() => useAccessGrants(), {
      wrapper: ({ children }) => (
        <SWRConfig value={{ provider: () => new Map() }}>
          {children}
        </SWRConfig>
      ),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.grants).toEqual([]);
  });
});
```

## E2E Tests (Playwright)

E2E tests verify complete user workflows in a real browser.

### Test Structure

```typescript
// tests/e2e/log-access-grant.spec.ts
import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/login';

test.describe('Log Access Grant', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/access/new');
  });

  test('should log a new access grant', async ({ page }) => {
    // Fill user autocomplete
    await page.fill('[placeholder="Search by name or email..."]', 'test');
    await page.click('text=Test User');
    
    // Fill system autocomplete
    await page.fill('[placeholder="Search systems..."]', 'Magento');
    await page.click('text=Magento');
    
    // Select tier
    await page.click('button:has-text("Select a tier")');
    await page.click('text=Admin');
    
    // Submit
    await page.click('button:has-text("Grant Access")');
    
    // Verify success
    await expect(page.locator('text=Access granted')).toBeVisible();
  });
});
```

### Authentication Helper

```typescript
// tests/e2e/helpers/login.ts
import { Page } from '@playwright/test';
import { TEST_USER } from '../fixtures/test-data';

export async function login(page: Page, user = TEST_USER) {
  // Bypass auth by setting test cookies
  await page.context().addCookies([
    {
      name: 'x-test-user-id',
      value: user.id,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'x-test-user-email',
      value: user.email,
      domain: 'localhost',
      path: '/',
    },
  ]);
}

export async function loginAndNavigate(page: Page, url: string) {
  await login(page);
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}
```

### Database Seeding

```typescript
// tests/e2e/fixtures/seed.ts
import { PrismaClient } from '@prisma/client';
import { TEST_USER, MAGENTO_SYSTEM, /* ... */ } from './test-data';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.accessGrant.deleteMany();
  await prisma.systemOwner.deleteMany();
  // ...

  // Create test users
  await prisma.user.create({ data: TEST_USER });
  
  // Create test systems with tiers and instances
  await prisma.system.create({ data: MAGENTO_SYSTEM });
  // ...

  console.log('✅ Database seeded for E2E tests');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Test Coverage

### Current Coverage Summary

| Category | Files | Tests |
|----------|-------|-------|
| Unit Tests | 6 | ~80 |
| Integration Tests | 5 | ~60 |
| Component Tests | 20 | ~180 |
| Hook Tests | 5 | ~40 |
| E2E Tests | 5 | ~25 |
| **Total** | **41** | **~385** |

### Coverage by Feature

| Feature | Unit | Integration | Component | E2E |
|---------|------|-------------|-----------|-----|
| Users API | ✓ | ✓ | — | — |
| Systems API | ✓ | ✓ | — | ✓ |
| Access Grants API | ✓ | ✓ | — | ✓ |
| Bulk Upload | ✓ | ✓ | ✓ | ✓ |
| Authorization | ✓ | ✓ | — | — |
| Access Overview | — | — | ✓ | ✓ |
| Log Access Grant | — | — | ✓ | ✓ |
| Systems Admin | — | — | ✓ | ✓ |
| Layout/Nav | — | — | ✓ | ✓ |

## Test Patterns & Best Practices

### 1. Arrange-Act-Assert

```typescript
it('should do something', async () => {
  // Arrange - set up test data and mocks
  const mockData = { ... };
  vi.mocked(service.method).mockResolvedValue(mockData);

  // Act - perform the action being tested
  const result = await functionUnderTest(input);

  // Assert - verify the expected outcome
  expect(result).toEqual(expectedOutput);
});
```

### 2. Test Isolation

```typescript
beforeEach(() => {
  vi.clearAllMocks();  // Reset all mocks between tests
});
```

### 3. Meaningful Test Names

```typescript
// Good
it('should return 400 when email already exists', ...)
it('should filter users by search query case-insensitively', ...)

// Bad
it('test 1', ...)
it('email error', ...)
```

### 4. Testing Error Cases

```typescript
it('should throw ServiceError when user not found', async () => {
  vi.mocked(usersRepo.findById).mockResolvedValue(null);

  await expect(usersService.getUserById('invalid'))
    .rejects
    .toThrow(ServiceError);
});
```

### 5. Async Testing

```typescript
// Using waitFor for async operations
await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});

// Using findBy for async DOM updates
const element = await screen.findByText('Success');
```

## Troubleshooting

### Common Issues

**Tests fail with "Cannot find module"**
- Ensure path aliases are configured in `vitest.config.ts`
- Check that the module is properly exported

**E2E tests fail with auth errors**
- Run `npm run e2e:seed` to reset test database
- Verify test user cookies are being set correctly

**Component tests fail with "not wrapped in act"**
- Wrap state-changing operations in `act()`
- Use `waitFor()` for async state updates

**Mocked functions not being called**
- Verify the mock is set up before the test runs
- Check the import path matches the actual import

### Debug Tips

```bash
# Debug specific test
npm test -- --reporter=verbose tests/unit/usersService.test.ts

# Debug E2E test
PWDEBUG=1 npx playwright test tests/e2e/auth.spec.ts

# See Playwright trace viewer
npx playwright show-trace trace.zip
```

