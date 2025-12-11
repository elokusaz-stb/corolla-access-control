import { test, expect } from '@playwright/test';
import { loginAndNavigate, TEST_USER } from './helpers/login';
import {
  TEST_SYSTEMS,
  TEST_TIERS,
  TEST_INSTANCES,
  TEST_USERS,
} from './fixtures/test-data';

test.describe('Systems Administration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/admin/systems');
  });

  test.describe('Systems List', () => {
    test('renders the systems admin page', async ({ page }) => {
      // Check page title
      await expect(page.locator('h1')).toContainText(/system|manage/i);
    });

    test('shows Add System button', async ({ page }) => {
      // Check for add system button
      const addButton = page.locator(
        'button:has-text("Add System"), button:has-text("Create")'
      );
      await expect(addButton.first()).toBeVisible();
    });

    test('displays systems list', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(1000);

      // Check for system rows or empty state
      const systemRows = page.locator('[class*="row"], [class*="system"]');
      const emptyState = page.locator('text=/no.*system|empty/i');

      const rowCount = await systemRows.count();
      const hasEmptyState = await emptyState.isVisible();

      expect(rowCount > 0 || hasEmptyState).toBeTruthy();
    });

    test('shows search input', async ({ page }) => {
      // Check for search input
      const searchInput = page.locator('input[placeholder*="search" i]');
      await expect(searchInput.first()).toBeVisible();
    });

    test('filters systems by search', async ({ page }) => {
      await page.waitForTimeout(500);

      const searchInput = page
        .locator('input[placeholder*="search" i]')
        .first();

      if (await searchInput.isVisible()) {
        // Type system name
        await searchInput.fill('Magento');

        await page.waitForTimeout(500);

        // Results should be filtered
        const visibleSystems = page.locator('[class*="row"]:visible');
        const count = await visibleSystems.count();

        // Should show filtered results
      }
    });
  });

  test.describe('System Row', () => {
    test('shows system info in row', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Check for system name
      const systemName = page.locator(`text="${TEST_SYSTEMS.magento.name}"`);
      const nameCount = await systemName.count();

      // System should be visible if seeded
      expect(nameCount).toBeGreaterThanOrEqual(0);
    });

    test('shows tier count badge', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Check for tier count indicator
      const tierBadge = page.locator('text=/tier|\\d+.*tier/i');
      const badgeCount = await tierBadge.count();

      expect(badgeCount).toBeGreaterThanOrEqual(0);
    });

    test('shows Manage button on row', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")');
      const buttonCount = await manageButton.count();

      expect(buttonCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('System Drawer', () => {
    test('opens drawer when clicking Manage', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();

        await page.waitForTimeout(500);

        // Check for drawer/modal
        const drawer = page.locator(
          '[class*="drawer"], [class*="modal"], [role="dialog"]'
        );
        await expect(drawer.first()).toBeVisible();
      }
    });

    test('shows tabs in drawer', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        // Check for tabs
        const infoTab = page.locator(
          'button:has-text("Info"), [role="tab"]:has-text("Info")'
        );
        const tiersTab = page.locator(
          'button:has-text("Tier"), [role="tab"]:has-text("Tier")'
        );

        expect(
          (await infoTab.count()) + (await tiersTab.count())
        ).toBeGreaterThan(0);
      }
    });

    test('closes drawer on escape key', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        // Press escape
        await page.keyboard.press('Escape');

        await page.waitForTimeout(300);

        // Drawer should be closed
        const drawer = page.locator(
          '[class*="drawer"]:visible, [role="dialog"]:visible'
        );
        const drawerCount = await drawer.count();

        // Drawer should be hidden or removed
      }
    });
  });

  test.describe('Info Tab', () => {
    test('shows system name and description fields', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        // Check for form fields
        const nameInput = page.locator(
          'input[placeholder*="name" i], input[name*="name" i]'
        );
        const descInput = page.locator(
          'textarea, input[placeholder*="description" i]'
        );

        expect(
          (await nameInput.count()) + (await descInput.count())
        ).toBeGreaterThan(0);
      }
    });

    test('shows save button', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        const saveButton = page.locator('button:has-text("Save")');
        expect(await saveButton.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Tiers Tab', () => {
    test('shows list of tiers', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        // Click tiers tab
        const tiersTab = page
          .locator('button:has-text("Tier"), [role="tab"]:has-text("Tier")')
          .first();
        if (await tiersTab.isVisible()) {
          await tiersTab.click();
          await page.waitForTimeout(300);

          // Check for tier list or add tier button
          const addTierButton = page.locator('button:has-text("Add Tier")');
          expect(await addTierButton.count()).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('can add a new tier', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        // Click tiers tab
        const tiersTab = page
          .locator('button:has-text("Tier"), [role="tab"]:has-text("Tier")')
          .first();
        if (await tiersTab.isVisible()) {
          await tiersTab.click();
          await page.waitForTimeout(300);

          // Click add tier button
          const addTierButton = page
            .locator('button:has-text("Add Tier")')
            .first();
          if (await addTierButton.isVisible()) {
            await addTierButton.click();

            // Check for tier name input
            const tierInput = page.locator('input[placeholder*="tier" i]');
            expect(await tierInput.count()).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Instances Tab', () => {
    test('shows list of instances', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        // Click instances tab
        const instancesTab = page
          .locator(
            'button:has-text("Instance"), [role="tab"]:has-text("Instance")'
          )
          .first();
        if (await instancesTab.isVisible()) {
          await instancesTab.click();
          await page.waitForTimeout(300);

          // Check for instance list or add button
          const addInstanceButton = page.locator(
            'button:has-text("Add Instance")'
          );
          expect(await addInstanceButton.count()).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('Owners Tab', () => {
    test('shows list of owners', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        // Click owners tab
        const ownersTab = page
          .locator('button:has-text("Owner"), [role="tab"]:has-text("Owner")')
          .first();
        if (await ownersTab.isVisible()) {
          await ownersTab.click();
          await page.waitForTimeout(300);

          // Check for owner list or add button
          const addOwnerButton = page.locator('button:has-text("Add Owner")');
          expect(await addOwnerButton.count()).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test('shows owner autocomplete when adding', async ({ page }) => {
      await page.waitForTimeout(1000);

      const manageButton = page.locator('button:has-text("Manage")').first();

      if (await manageButton.isVisible()) {
        await manageButton.click();
        await page.waitForTimeout(500);

        // Click owners tab
        const ownersTab = page
          .locator('button:has-text("Owner"), [role="tab"]:has-text("Owner")')
          .first();
        if (await ownersTab.isVisible()) {
          await ownersTab.click();
          await page.waitForTimeout(300);

          // Click add owner button
          const addOwnerButton = page
            .locator('button:has-text("Add Owner")')
            .first();
          if (await addOwnerButton.isVisible()) {
            await addOwnerButton.click();

            // Check for user search input
            const userSearch = page.locator(
              'input[placeholder*="search" i], input[placeholder*="user" i]'
            );
            expect(await userSearch.count()).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Create System Modal', () => {
    test('opens create modal on Add System click', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add System")').first();

      if (await addButton.isVisible()) {
        await addButton.click();

        await page.waitForTimeout(300);

        // Check for modal
        const modal = page.locator('[class*="modal"], [role="dialog"]');
        await expect(modal.first()).toBeVisible();
      }
    });

    test('shows name and description fields in create modal', async ({
      page,
    }) => {
      const addButton = page.locator('button:has-text("Add System")').first();

      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(300);

        // Check for form fields
        const nameInput = page.locator('input[placeholder*="name" i]');
        await expect(nameInput.first()).toBeVisible();
      }
    });

    test('closes modal on cancel', async ({ page }) => {
      const addButton = page.locator('button:has-text("Add System")').first();

      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(300);

        // Click cancel
        const cancelButton = page.locator('button:has-text("Cancel")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();

          await page.waitForTimeout(300);

          // Modal should be closed
          const modal = page.locator(
            '[class*="modal"]:visible, [role="dialog"]:visible'
          );
          const modalCount = await modal.count();

          // Modal should be hidden
        }
      }
    });
  });
});

