# Corolla E2E Test Suite

This directory contains comprehensive end-to-end tests for the Corolla Phase 1 access tracking tool using Playwright.

## 📁 Structure

```
tests/e2e/
├── auth.spec.ts                 # Authentication flow tests
├── log-access-grant.spec.ts     # Log access grant workflow
├── remove-access-grant.spec.ts  # Remove access grant workflow
├── bulk-upload.spec.ts          # Bulk upload workflow
├── systems-admin.spec.ts        # Systems administration workflow
├── fixtures/
│   ├── seed.ts                  # Database seed script
│   └── test-data.ts             # Test data constants
├── helpers/
│   └── login.ts                 # Authentication helper
└── README.md                    # This file
```

## 🚀 Running Tests

### Prerequisites

1. **Database Setup**: Ensure your database is configured and accessible
2. **Environment Variables**: Create `.env.local` with your Supabase credentials
3. **Dependencies**: Run `npm install`

### Seed the Test Database

Before running E2E tests, seed the database with test data:

```bash
npm run e2e:seed
```

This creates:

- 4 test users (admin, regular, manager, new hire)
- 3 systems (Magento, Salesforce, SAP)
- 7 access tiers across all systems
- 4 instances across Magento and Salesforce
- System owner assignments
- 3 sample access grants (2 active, 1 removed)

### Run All E2E Tests

```bash
# Seed and run in one command
npm run e2e:run

# Or run separately
npm run e2e:seed
npm run test:e2e
```

### Run Specific Test Files

```bash
# Run auth tests only
npx playwright test auth.spec.ts

# Run bulk upload tests
npx playwright test bulk-upload.spec.ts

# Run with specific browser
npx playwright test --project=chromium
```

### Interactive Mode

```bash
# Open Playwright UI
npm run test:e2e:ui

# Run tests with browser visible
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug
```

## 🔐 Authentication

The test suite uses a cookie-based authentication bypass for E2E testing:

```typescript
// In your tests
import { loginAndNavigate } from './helpers/login';

test('my test', async ({ page }) => {
  await loginAndNavigate(page, '/dashboard');
  // Test proceeds as authenticated user
});
```

### Test Users

| User         | Email                    | Role                              |
| ------------ | ------------------------ | --------------------------------- |
| Test Admin   | admin@test.corolla.com   | System owner (Magento)            |
| Test User    | user@test.corolla.com    | Regular user                      |
| Test Manager | manager@test.corolla.com | System owner (Salesforce, SAP)    |
| New Hire     | newhire@test.corolla.com | Regular user (no existing grants) |

## 📊 Test Coverage

### Phase 1 Requirements Mapping

| Requirement         | Test File                   | Coverage                        |
| ------------------- | --------------------------- | ------------------------------- |
| User Authentication | auth.spec.ts                | Login flow, session, redirects  |
| Log Access Grant    | log-access-grant.spec.ts    | Form, autocomplete, submission  |
| Remove Access Grant | remove-access-grant.spec.ts | Status update, UI feedback      |
| Bulk Upload         | bulk-upload.spec.ts         | CSV upload, validation, preview |
| Systems Management  | systems-admin.spec.ts       | CRUD, tiers, instances, owners  |

### Test Scenarios

#### Authentication (auth.spec.ts)

- ✅ Redirects unauthenticated users to login
- ✅ Renders login form
- ✅ Shows authenticated layout after login
- ✅ Maintains session across navigations

#### Log Access Grant (log-access-grant.spec.ts)

- ✅ Renders form with all required fields
- ✅ User autocomplete functionality
- ✅ System selection loads tiers
- ✅ Form validation
- ✅ Success toast on submission

#### Remove Access Grant (remove-access-grant.spec.ts)

- ✅ Displays grants list
- ✅ Shows status badges
- ✅ Hover reveals remove action
- ✅ Status updates optimistically
- ✅ Changes persist after reload

#### Bulk Upload (bulk-upload.spec.ts)

- ✅ Drag-and-drop file upload
- ✅ CSV template download
- ✅ Preview table with validation
- ✅ Error row highlighting
- ✅ Insert button visibility logic

#### Systems Admin (systems-admin.spec.ts)

- ✅ Systems list display
- ✅ Search filtering
- ✅ Drawer/modal for management
- ✅ Tab navigation (Info, Tiers, Instances, Owners)
- ✅ Add tier/instance/owner forms

## 🛠️ Configuration

### Playwright Config Highlights

```typescript
// playwright.config.ts
{
  timeout: 30000,           // 30s per test
  retries: 2,               // Retry failed tests on CI
  screenshot: 'only-on-failure',
  video: 'on-first-retry',
  baseURL: 'http://localhost:3000',
}
```

### Browsers Tested

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

## 📝 Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/login';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/feature-path');
  });

  test('does something', async ({ page }) => {
    // Arrange
    const element = page.locator('selector');

    // Act
    await element.click();

    // Assert
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Using Test Data

```typescript
import { TEST_USERS, TEST_SYSTEMS } from './fixtures/test-data';

test('uses seeded data', async ({ page }) => {
  // Reference seeded data by ID or name
  const systemName = TEST_SYSTEMS.magento.name;
  await page.fill('input', systemName);
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Tests fail with "element not found"**
   - Increase timeout: `await page.waitForTimeout(1000)`
   - Check if element is in viewport
   - Verify selector matches current UI

2. **Authentication not working**
   - Ensure cookies are being set correctly
   - Check if app recognizes test auth cookies
   - Verify BASE_URL matches running server

3. **Database seed fails**
   - Check DATABASE_URL is configured
   - Run `npx prisma generate` first
   - Ensure migrations are up to date

### Viewing Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports include:

- Test results summary
- Screenshots of failures
- Video recordings (on retry)
- Trace viewer for debugging

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)

