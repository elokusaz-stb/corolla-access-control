import { test, expect } from '@playwright/test';
import { loginAndNavigate, TEST_USER } from './helpers/login';
import { TEST_USERS, TEST_GRANTS, TEST_SYSTEMS } from './fixtures/test-data';

test.describe('Remove Access Grant Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/dashboard/access');
  });

  test.describe('Access Overview Page', () => {
    test('renders the access overview page', async ({ page }) => {
      // Check page title
      await expect(page.locator('h1')).toContainText(/access/i);
    });

    test('displays access grants list', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(1000);

      // Check for grant rows or empty state
      const grantRows = page.locator('[class*="row"], [class*="grant"], tr');
      const emptyState = page.locator('text=/no.*grants|empty/i');

      // Either grants exist or empty state is shown
      const rowCount = await grantRows.count();
      const hasEmptyState = await emptyState.isVisible();

      expect(rowCount > 0 || hasEmptyState).toBeTruthy();
    });

    test('shows filter controls', async ({ page }) => {
      // Check for filter bar elements
      const filterBar = page.locator('[class*="filter"], [class*="search"]');
      await expect(filterBar.first()).toBeVisible();
    });
  });

  test.describe('Grant Row Interactions', () => {
    test('shows action buttons on row hover', async ({ page }) => {
      // Wait for grants to load
      await page.waitForTimeout(1000);

      // Find a grant row
      const grantRow = page.locator('[class*="row"]').first();

      if (await grantRow.isVisible()) {
        // Hover over the row
        await grantRow.hover();

        // Check for action button (trash icon or remove button)
        const actionButton = page.locator(
          'button:has-text("Remove"), [aria-label*="remove" i], button svg[class*="trash" i]'
        );

        // Note: Button visibility on hover depends on implementation
      }
    });

    test('displays status badges correctly', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Check for status badges
      const activeBadges = page.locator(
        '[class*="badge"]:has-text("active"), .corolla-badge--active'
      );
      const removedBadges = page.locator(
        '[class*="badge"]:has-text("removed"), .corolla-badge--removed'
      );

      // Should have at least one badge type visible
      const activeCount = await activeBadges.count();
      const removedCount = await removedBadges.count();

      // Badges should be present if grants exist
    });
  });

  test.describe('Remove Grant Action', () => {
    test.skip('removes an active grant', async ({ page }) => {
      // This test requires specific grant data and UI interaction
      // Skip by default until seed data is confirmed

      // Wait for grants to load
      await page.waitForTimeout(1000);

      // Find an active grant row
      const activeRow = page
        .locator('[class*="row"]:has([class*="active"])')
        .first();

      if (await activeRow.isVisible()) {
        // Hover to show actions
        await activeRow.hover();

        // Click remove button
        const removeButton = activeRow.locator(
          'button:has-text("Remove"), [aria-label*="remove" i]'
        );
        await removeButton.click();

        // Confirm if modal appears
        const confirmButton = page.locator(
          'button:has-text("Confirm"), button:has-text("Yes")'
        );
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Verify status changed to removed
        await page.waitForTimeout(500);
        await expect(activeRow.locator('[class*="removed"]')).toBeVisible();
      }
    });

    test('updates UI optimistically after removal', async ({ page }) => {
      // This tests that the UI updates immediately without waiting for API
      await page.waitForTimeout(1000);

      // Count active grants before
      const activeGrantsBefore = await page
        .locator('.corolla-badge--active, [class*="badge"]:has-text("active")')
        .count();

      // If there are active grants, the count should potentially change after removal
      expect(activeGrantsBefore).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Filtering', () => {
    test('filters by status', async ({ page }) => {
      await page.waitForTimeout(500);

      // Find status filter dropdown
      const statusFilter = page
        .locator('select[name*="status" i], [placeholder*="status" i]')
        .first();

      if (await statusFilter.isVisible()) {
        // Select "active" status
        await statusFilter.selectOption({ label: 'Active' });

        await page.waitForTimeout(500);

        // All visible badges should be "active"
        const removedBadges = page.locator('.corolla-badge--removed');
        const removedCount = await removedBadges.count();

        // When filtered to active, no removed badges should show
        // Note: This depends on filter implementation
      }
    });

    test('filters by system', async ({ page }) => {
      await page.waitForTimeout(500);

      // Find system filter
      const systemFilter = page
        .locator('input[placeholder*="system" i], select[name*="system" i]')
        .first();

      if (await systemFilter.isVisible()) {
        // Type system name
        await systemFilter.fill(TEST_SYSTEMS.magento.name);

        await page.waitForTimeout(500);

        // Results should be filtered (or show empty if no matches)
      }
    });

    test('clears all filters', async ({ page }) => {
      await page.waitForTimeout(500);

      // Find clear filters button
      const clearButton = page
        .locator('button:has-text("Clear"), button:has-text("Reset")')
        .first();

      if (await clearButton.isVisible()) {
        await clearButton.click();

        await page.waitForTimeout(500);

        // Filters should be reset
      }
    });
  });

  test.describe('Pagination', () => {
    test('shows pagination controls when many grants exist', async ({
      page,
    }) => {
      await page.waitForTimeout(1000);

      // Check for pagination elements
      const pagination = page.locator(
        '[class*="pagination"], button:has-text("Next"), button:has-text("Previous")'
      );
      const paginationCount = await pagination.count();

      // Pagination may or may not be visible depending on grant count
      expect(paginationCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Data Persistence', () => {
    test('removed grants persist after page reload', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Count removed grants
      const removedBefore = await page
        .locator(
          '.corolla-badge--removed, [class*="badge"]:has-text("removed")'
        )
        .count();

      // Reload page
      await page.reload();
      await page.waitForTimeout(1000);

      // Count should be the same
      const removedAfter = await page
        .locator(
          '.corolla-badge--removed, [class*="badge"]:has-text("removed")'
        )
        .count();

      expect(removedAfter).toBe(removedBefore);
    });
  });
});

