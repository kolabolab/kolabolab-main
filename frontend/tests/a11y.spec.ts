import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('KolaboLab Accessibility Tests', () => {
  test('Home page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('http://localhost/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations 
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('Startups page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('http://localhost/startups');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('Collaborate page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('http://localhost/collaborate');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('Keyboard navigation works properly', async ({ page }) => {
    await page.goto('http://localhost/');
    
    // Focus on the first interactive element (logo)
    await page.keyboard.press('Tab');
    
    // Check if the logo is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedElement).toContain('Kolabolab');
    
    // Navigate through navigation items: Startups, Collaborate, Get Started
    await page.keyboard.press('Tab'); // Startups link
    await page.keyboard.press('Tab'); // Collaborate link  
    await page.keyboard.press('Tab'); // Get Started button
    
    // Check if a navigation element is focused
    const focusedNav = await page.evaluate(() => document.activeElement?.textContent);
    expect(focusedNav).toMatch(/Startups|Collaborate|Get Started/);
    
    // Navigate to the Get Started button specifically
    await page.focus('a[href="/startups/create"]');
    await page.keyboard.press('Enter');
    
    // Should navigate to startups/create
    await expect(page).toHaveURL(/.*\/startups\/create/);
  });
});
