import { test, expect } from '@playwright/test';

test.describe('Kolabolab Forms and Features E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/');
  });

  test('Startup submission form works end-to-end', async ({ page }) => {
    // Navigate to startup creation form
    await page.click('a[href="/startups/create"]');
    await expect(page).toHaveURL(/.*\/startups\/create/);
    
    // Verify page loads with proper heading
    await expect(page.locator('h1')).toContainText('Submit Your Startup Idea');
    
    // Fill out the form with realistic data
    await page.fill('#name', 'EcoTrack Solutions');
    await page.fill('#description', 'AI-powered carbon footprint tracking for small businesses with accessibility-first design');
    await page.selectOption('#industry', 'CleanTech');
    await page.selectOption('#stage', 'Pre-seed');
    await page.fill('#location', 'San Francisco, CA (Remote)');
    await page.fill('#teamSize', '3');
    
    // Social impact section
    await page.selectOption('#impactArea', 'Environmental Sustainability');
    await page.fill('#accessibilityFeatures', 'Voice navigation, high contrast mode, keyboard-only navigation, screen reader optimization');
    
    // Detailed pitch
    await page.fill('#pitch', 'EcoTrack Solutions addresses the urgent need for small businesses to understand and reduce their carbon footprint. Our AI-powered platform makes sustainability tracking accessible to businesses of all sizes, with particular focus on inclusive design for users with disabilities. We provide actionable insights and automated reporting that helps businesses make meaningful environmental impact while saving costs.');
    
    // Select collaboration needs
    await page.check('input[type="checkbox"]', { force: true }); // Check at least one collaboration need
    
    // Contact information
    await page.fill('#contactEmail', 'founder@ecotrack.solutions');
    await page.fill('#website', 'https://ecotrack.solutions');
    await page.fill('#fundingGoal', '$150,000');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify success page
    await expect(page.locator('h1')).toContainText('Your Startup Idea Has Been Submitted!');
    await expect(page.locator('.success-message')).toBeVisible();
    
    // Test navigation from success page
    await page.click('a[href="/startups"]');
    await expect(page).toHaveURL(/.*\/startups/);
  });

  test('Startup discovery and filtering works', async ({ page }) => {
    // Navigate to startups page
    await page.click('a[href="/startups"]');
    await expect(page).toHaveURL(/.*\/startups/);
    
    // Verify page loads with proper content
    await expect(page.locator('h1')).toContainText('Discover Startups');
    
    // Test search functionality
    await page.fill('.search-input', 'EcoTech');
    await expect(page.locator('.startup-card')).toHaveCount(1);
    
    // Test industry filter
    await page.click('.filter-btn:has-text("CleanTech")');
    await expect(page.locator('.filter-btn.active')).toContainText('CleanTech');
    
    // Clear search and verify more results show
    await page.fill('.search-input', '');
    const cardCount = await page.locator('.startup-card').count();
    expect(cardCount).toBeGreaterThan(1);
    
    // Test startup card interactions
    const firstCard = page.locator('.startup-card').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('.startup-description')).toBeVisible();
    
    // Test collaborate button
    await firstCard.locator('a:has-text("Collaborate")').click();
    await expect(page).toHaveURL(/.*\/collaborate/);
  });

  test('Collaborator discovery and search works', async ({ page }) => {
    // Navigate to collaborate page
    await page.click('a[href="/collaborate"]');
    await expect(page).toHaveURL(/.*\/collaborate/);
    
    // Verify page loads properly
    await expect(page.locator('h1')).toContainText('Find Collaborators');
    
    // Test search functionality
    await page.fill('.search-input', 'Sarah');
    const searchResults = page.locator('.collaborator-card');
    const searchCount = await searchResults.count();
    expect(searchCount).toBeGreaterThan(0);
    
    // Test skills filter
    await page.selectOption('select[aria-label="Filter by skill"]', 'React');
    
    // Test location filter
    await page.selectOption('select[aria-label="Filter by location"]', 'Remote');
    
    // Test impact area filter
    await page.selectOption('select[aria-label="Filter by impact area"]', 'Accessibility & Inclusion');
    
    // Verify collaborator card content
    const firstCollaborator = page.locator('.collaborator-card').first();
    await expect(firstCollaborator.locator('h3')).toBeVisible();
    await expect(firstCollaborator.locator('.collaborator-bio')).toBeVisible();
    await expect(firstCollaborator.locator('.skills-tags')).toBeVisible();
    await expect(firstCollaborator.locator('.impact-tags')).toBeVisible();
    
    // Test action buttons
    await expect(firstCollaborator.locator('button:has-text("Connect")')).toBeVisible();
    await expect(firstCollaborator.locator('button:has-text("View Profile")')).toBeVisible();
    
    // Clear all filters
    await page.fill('.search-input', '');
    await page.selectOption('select[aria-label="Filter by skill"]', '');
    await page.selectOption('select[aria-label="Filter by location"]', '');
    await page.selectOption('select[aria-label="Filter by impact area"]', '');
    
    // Verify more results show up
    const allCollaboratorCount = await page.locator('.collaborator-card').count();
    expect(allCollaboratorCount).toBeGreaterThan(3);
  });

  test('Full user journey: Browse → Create → Collaborate', async ({ page }) => {
    // Start on homepage
    await expect(page.locator('h1')).toContainText('Kolabolab');
    
    // Explore startups first
    await page.click('a:has-text("Explore Startups")');
    await expect(page).toHaveURL(/.*\/startups/);
    
    // Look at startup details and get inspired
    await expect(page.locator('.startup-card').first()).toBeVisible();
    
    // Decide to create own startup
    await page.click('a[href="/startups/create"]');
    await expect(page).toHaveURL(/.*\/startups\/create/);
    
    // Quick form fill (minimal viable submission)
    await page.fill('#name', 'HealthConnect Pro');
    await page.fill('#description', 'Telemedicine platform with comprehensive accessibility features');
    await page.selectOption('#industry', 'HealthTech');
    await page.selectOption('#impactArea', 'Healthcare Access');
    await page.fill('#pitch', 'Building accessible telemedicine that works for everyone, including users with disabilities.');
    await page.fill('#contactEmail', 'test@healthconnect.pro');
    
    // Submit quickly
    await page.click('button[type="submit"]');
    
    // Success page → go find collaborators
    await expect(page.locator('h1')).toContainText('Your Startup Idea Has Been Submitted!');
    await page.click('a:has-text("Find Collaborators")');
    await expect(page).toHaveURL(/.*\/collaborate/);
    
    // Search for specific skills needed
    await page.fill('.search-input', 'accessibility');
    const accessibilityCollaborators = await page.locator('.collaborator-card').count();
    expect(accessibilityCollaborators).toBeGreaterThan(0);
    
    // Filter by healthcare impact area
    await page.selectOption('select[aria-label="Filter by impact area"]', 'Healthcare Access');
    
    // View potential collaborator
    const targetCollaborator = page.locator('.collaborator-card').first();
    await expect(targetCollaborator).toBeVisible();
    
    // Complete the journey
    await targetCollaborator.locator('button:has-text("Connect")').click();
    // Note: In a real app, this would open a modal or navigate to a profile page
  });

  test('Form validation and error handling', async ({ page }) => {
    // Test startup creation form validation
    await page.click('a[href="/startups/create"]');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Form should not submit (browser validation)
    await expect(page).toHaveURL(/.*\/startups\/create/);
    
    // Fill required fields only
    await page.fill('#name', 'Test Startup');
    await page.fill('#description', 'A test startup description');
    await page.selectOption('#industry', 'AI/ML');
    await page.selectOption('#impactArea', 'Healthcare Access');
    await page.fill('#pitch', 'This is a test pitch for validation purposes.');
    await page.fill('#contactEmail', 'test@example.com');
    
    // Now submit should work
    await page.click('button[type="submit"]');
    await expect(page.locator('h1')).toContainText('Your Startup Idea Has Been Submitted!');
  });

  test('Accessibility features work properly', async ({ page }) => {
    // Test keyboard navigation on forms
    await page.click('a[href="/startups/create"]');
    
    // Tab through form elements
    await page.keyboard.press('Tab'); // Name field
    await page.keyboard.type('Accessible Startup');
    
    await page.keyboard.press('Tab'); // Description field
    await page.keyboard.type('A startup focused on accessibility');
    
    // Test that form labels are properly associated
    const nameField = page.locator('#name');
    const nameLabel = page.locator('label[for="name"]');
    await expect(nameLabel).toBeVisible();
    await expect(nameField).toHaveAttribute('aria-describedby', 'name-help');
    
    // Test that help text is available
    await expect(page.locator('#name-help')).toBeVisible();
    
    // Test focus management
    await nameField.focus();
    await expect(nameField).toBeFocused();
  });

  test('Mobile responsive design works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test navigation on mobile
    await expect(page.locator('.nav')).toBeVisible();
    await expect(page.locator('.header .logo')).toBeVisible();
    
    // Test startup cards are properly stacked
    await page.click('a[href="/startups"]');
    const startupsGrid = page.locator('.startups-grid');
    await expect(startupsGrid).toBeVisible();
    
    // Test collaborator cards on mobile
    await page.click('a[href="/collaborate"]');
    const collaboratorGrid = page.locator('.collaborators-grid');
    await expect(collaboratorGrid).toBeVisible();
    
    // Test form is usable on mobile
    await page.click('a[href="/startups/create"]');
    await expect(page.locator('.startup-form')).toBeVisible();
    
    // Form should be scrollable and usable
    await page.fill('#name', 'Mobile Test Startup');
    await page.selectOption('#industry', 'EdTech');
    await expect(page.locator('#name')).toHaveValue('Mobile Test Startup');
  });
});