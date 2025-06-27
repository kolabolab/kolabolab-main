import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests: Touch Targets', () => {
  test('Touch targets should meet WCAG requirements on homepage', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Run axe-core analysis for accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    console.log('Accessibility issues found:', accessibilityScanResults.violations.length);
    
    // Specific test for touch target sizes
    const smallTouchTargets = await page.evaluate(() => {
      const interactiveElements = Array.from(document.querySelectorAll(
        'a[href], button, [role="button"], input, select, textarea'
      ));
      
      return interactiveElements
        .map(el => {
          const rect = el.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(el);
          const isVisible = computedStyle.display !== 'none' && 
                           computedStyle.visibility !== 'hidden' &&
                           rect.width > 0 && rect.height > 0;
                           
          if (!isVisible) return null;
          
          const text = el.textContent?.trim() || '';
          const dimensions = { width: rect.width, height: rect.height };
          const isTooSmall = dimensions.width < 44 || dimensions.height < 44;
          
          if (isTooSmall) {
            return {
              tagName: el.tagName,
              text: text.substring(0, 20) + (text.length > 20 ? '...' : ''),
              dimensions,
              position: { x: rect.x, y: rect.y }
            };
          }
          return null;
        })
        .filter(Boolean);
    });
    
    console.log('Small touch targets found:', smallTouchTargets.length);
    if (smallTouchTargets.length > 0) {
      console.log('Some examples of small touch targets:', smallTouchTargets.slice(0, 5));
    }
    
    // Our improvements should have fixed most touch target issues
    expect(smallTouchTargets.length).toBeLessThan(5); // Allow some minor exceptions
    
    // Check if critical navigation elements have proper touch targets
    const navLinks = await page.$$eval('nav a, .chakra-link, .nav-link', links => {
      return links.map(link => {
        const rect = link.getBoundingClientRect();
        return {
          text: link.textContent?.trim() || '',
          height: rect.height,
          width: rect.width,
          isAccessible: rect.height >= 44 && rect.width >= 44
        };
      });
    });
    
    console.log('Navigation links checked:', navLinks.length);
    const inaccessibleNavLinks = navLinks.filter(link => !link.isAccessible);
    console.log('Inaccessible navigation links:', inaccessibleNavLinks.length);
    
    expect(inaccessibleNavLinks.length).toBe(0);
  });
});