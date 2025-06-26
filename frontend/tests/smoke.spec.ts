import { test, expect } from '@playwright/test';

test.describe('KolaboLab Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test
    await page.goto('http://localhost/');
  });

  test('Basic navigation flow works', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/KolaboLab|Vite/);
    
    // Check if the navigation menu is visible
    const navBar = page.locator('nav.nav');
    await expect(navBar).toBeVisible();
    
    // Check logo in navigation header
    const logo = page.locator('.header .logo');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('Kolabolab');
    
    // Click on Startups link in the navigation
    await page.click('a.nav-link:has-text("Startups")');
    
    // Verify URL changed to /startups
    await expect(page).toHaveURL(/.*\/startups/);
    
    // Go back to homepage
    await page.click('.header .logo');
    await expect(page).toHaveURL('http://localhost/');
    
    // Click on Collaborate link
    await page.click('a.nav-link:has-text("Collaborate")');
    
    // Verify URL changed to /collaborate
    await expect(page).toHaveURL(/.*\/collaborate/);
    
    // Click on Get Started button
    await page.goBack();
    await page.click('a:has-text("Get Started")');
    
    // Verify URL changed to /startups/create
    await expect(page).toHaveURL(/.*\/startups\/create/);
  });

  test('Footer content is present', async ({ page }) => {
    // Check footer copyright text
    const footer = page.locator('footer.footer');
    await expect(footer).toBeVisible();
    
    // Check for copyright text in footer
    const copyright = page.locator('.footer-bottom');
    await expect(copyright).toContainText(/copyright|©|2025/i);
    
    // Check footer links
    const footerLinks = page.locator('.footer-links');
    await expect(footerLinks).toBeVisible();
    
    // Check for "Help Center" link in footer
    const helpLink = page.locator('.footer-links a:has-text("Help")');
    await expect(helpLink).toBeVisible();
  });
});
