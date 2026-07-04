import { test, expect } from '@playwright/test';
import { TEST_GROUP_NAME, TEST_EMAIL_PREFIX } from './db-cleanup';

test.describe('Splidot golden path', () => {
  test('sign up, sign in, create a group, add an expense, settle up, log out', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // Accept the confirm() shown when deleting a group.
    page.on('dialog', (dialog) => dialog.accept());

    const email = `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Welcome to Splidot/ })).toBeVisible();

    // --- Sign up ---
    await page.getByText('Sign up').click();
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Back on the sign-in form after a successful sign-up.
    await expect(page.locator('.sign-in-form')).toBeVisible();

    // --- Sign in ---
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('Groups')).toBeVisible();

    // --- Create a group ---
    await page.locator('.add-group-button').click();
    await page.getByLabel('Group Name').fill(TEST_GROUP_NAME);
    await page.getByLabel('Participant 1').fill('Alice');
    await page.getByRole('button', { name: 'Add a New Participant' }).click();
    await page.getByLabel('Participant 2').fill('Bob');
    await page.getByRole('button', { name: 'Create Group' }).click();

    const groupItem = page.locator('.group-item', { hasText: TEST_GROUP_NAME });
    await expect(groupItem).toBeVisible();

    // --- Reloading keeps us signed in (the JWT persists in localStorage) ---
    // The group is server-side data, so seeing it again after a full reload proves
    // the persisted token still authenticates us with no re-sign-in.
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(groupItem).toBeVisible();

    // --- Select the group and load its participants ---
    await groupItem.click();
    await expect(page.locator('.participant-item')).toHaveCount(2);
    await expect(page.getByText(/Me \/ Share/)).toBeVisible();
    await expect(page.getByText(/Bob \/ Share/)).toBeVisible();

    // --- Add an expense ---
    await page.getByRole('button', { name: 'Add Expense' }).click();
    await page.locator('.expense-form-modal select').first().selectOption({ index: 1 });
    await page.locator('.expense-form-modal input[type="number"]').fill('40');
    await page.locator('.expense-form-modal select').nth(1).selectOption('food');
    await page.locator('.expense-form-modal input[type="text"]').fill('Dinner');
    await page.locator('.expense-form-modal .submit-btn').click();

    await expect(page.locator('.expense-list li')).toHaveCount(1);
    await expect(page.getByText('Total Paid: $40.00')).toBeVisible();

    // --- Calculate settlements ---
    await page.locator('.splidot-button').click();
    await expect(page.locator('.settlements-display')).toBeVisible();
    await expect(page.getByText(/pays .*: \$20\.00/)).toBeVisible();

    // --- Delete the expense ---
    // Server-side this also wipes the (unpaid) settlement, so the display disappears.
    await page.locator('.delete-expense-btn').click();
    await expect(page.locator('.expense-list li')).toHaveCount(0);
    await expect(page.getByText('Total Paid: $0.00')).toBeVisible();
    await expect(page.locator('.settlements-display')).toHaveCount(0);

    // --- Delete the group ---
    await page.locator('.delete-group-btn').click();
    await expect(page.locator('.group-item', { hasText: TEST_GROUP_NAME })).toHaveCount(0);
    await expect(page.getByText('Groups')).toBeVisible();

    // --- Log out ---
    await page.locator('.logout-button').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /Welcome to Splidot/ })).toBeVisible();

    expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join('\n')}`).toEqual([]);
    expect(pageErrors, `Unexpected page errors: ${pageErrors.join('\n')}`).toEqual([]);
  });
});
