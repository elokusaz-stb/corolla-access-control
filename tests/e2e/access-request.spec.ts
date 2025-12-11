import { test, expect } from '@playwright/test';
import { loginAndNavigate, TEST_USER } from './helpers/login';
import { TEST_USERS, TEST_SYSTEMS, TEST_TIERS, TEST_INSTANCES } from './fixtures/seed';

test.describe('Request Access Flow', () => {
    test('allows a user to request access for multiple systems', async ({ page }) => {
        // 1. Login and Navigate to Request Access Page
        await loginAndNavigate(page, '/access/request');

        // Check Header
        await expect(page.getByRole('heading', { name: 'Request Access' })).toBeVisible();

        // 2. Select User (Regular User selecting themselves or someone else)
        // Let's search for "New Hire"
        const userSearchInput = page.getByPlaceholderText(/search by name or email/i);
        await userSearchInput.fill('New Hire');
        await expect(page.getByText(TEST_USERS.newHire.name)).toBeVisible();
        await page.getByText(TEST_USERS.newHire.name).click();

        // Verify selection
        await expect(page.getByText(TEST_USERS.newHire.email)).toBeVisible();

        // 3. Add First Access Item (Magento)
        const systemSearchInput = page.getByPlaceholderText(/search systems/i);
        await systemSearchInput.fill('Magento');
        await page.getByText('Magento').click();

        // Select Tier
        const tierSelect = page.locator('select').nth(0); // First select is Tier
        await tierSelect.selectOption({ label: 'Admin' });

        // First item instance is optional or dependent. 
        // Magento has instances in seed. Let's select one if available.
        const instanceSelect = page.locator('select').nth(1);
        await instanceSelect.selectOption({ label: 'Wellness' });

        // Add to List
        await page.getByRole('button', { name: 'Add to List' }).click();

        // Verify item in list
        await expect(page.getByText(TEST_USERS.newHire.name)).toBeVisible(); // User still there
        await expect(page.getByText('Magento')).toBeVisible();
        await expect(page.getByText('Admin', { exact: true })).toBeVisible(); // Exact match to avoid partials
        await expect(page.getByText('Wellness')).toBeVisible();

        // 4. Add Second Access Item (Salesforce)
        await systemSearchInput.fill('Salesforce');
        await page.getByText('Salesforce').click();

        await tierSelect.selectOption({ label: 'User' });
        // Salesforce instances are Production, Staging.
        await instanceSelect.selectOption({ label: 'Production' });

        await page.getByRole('button', { name: 'Add to List' }).click();

        // Verify second item
        await expect(page.getByText('Salesforce')).toBeVisible();
        await expect(page.getByText('Production')).toBeVisible();

        // Check summary count
        await expect(page.getByText('2 items')).toBeVisible();

        // 5. Submit Request
        const submitButton = page.getByRole('button', { name: 'Submit Access Request' });
        await expect(submitButton).toBeEnabled();
        await submitButton.click();

        // 6. Verify Success
        // Wait for success toast
        await expect(page.getByText('Successfully submitted 2 access request(s)')).toBeVisible({ timeout: 10000 });

        // List should be cleared
        await expect(page.getByText('No access items added yet')).toBeVisible();
    });
});
