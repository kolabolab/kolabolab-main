import { test, expect } from '@playwright/test';

test.describe('Website Link Audit', () => {
  // Track visited URLs to avoid revisiting
  const visitedUrls = new Set<string>();
  // Store link issues for reporting
  const linkIssues: {url: string, issue: string}[] = [];
  // Store improvement suggestions
  const suggestions: {component: string, suggestion: string}[] = [];

  test('Homepage links load correctly and content is accessible', async ({ page }) => {
    // Start at the homepage
    await page.goto('/');
    console.log('🔍 Auditing homepage links and accessibility');
    
    // Check page title and meta description
    const title = await page.title();
    expect(title).toBeTruthy();
    if (title === 'Vite + React + TS') {
      linkIssues.push({url: '/', issue: 'Default Vite title not changed to proper website title'});
    }

    // Get all navigation links from the homepage
    const allLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent?.trim() || '',
        ariaLabel: link.getAttribute('aria-label') || '',
        hasVisibleText: !!link.textContent?.trim(),
        location: {
          inHeader: link.closest('header, nav') !== null,
          inFooter: link.closest('footer') !== null,
          inMain: link.closest('main') !== null,
        }
      }));
    });

    console.log(`Found ${allLinks.length} links on the homepage`);    // Check for links without visible text (accessibility issue)
    const linksWithoutText = allLinks.filter(link => !link.hasVisibleText && !link.ariaLabel);
    if (linksWithoutText.length > 0) {
      suggestions.push({
        component: 'Accessibility',
        suggestion: `${linksWithoutText.length} links don't have visible text or aria-label: ${linksWithoutText.map(l => l.href).join(', ')}`
      });
    }
    
    // Check for duplicate link text pointing to different locations (confusing for users)
    const linkTextMap = new Map<string, string[]>();
    allLinks.forEach(link => {
      if (link.text && !link.text.includes('Kolabolab')) { // Exclude logo text that might repeat
        if (!linkTextMap.has(link.text)) {
          linkTextMap.set(link.text, []);
        }
        linkTextMap.get(link.text)?.push(link.href || '');
      }
    });
    
    linkTextMap.forEach((hrefs, text) => {
      if (new Set(hrefs).size > 1) {
        suggestions.push({
          component: 'UX',
          suggestion: `Same link text "${text}" points to different URLs: ${hrefs.join(', ')}`
        });
      }
    });
    
    // Now test each navigation link
    for (const link of allLinks) {
      const href = link.href;
      
      // Skip external links and anchors for this test
      if (!href || href.startsWith('http') || href.startsWith('#') || href === '/') {
        continue;
      }
      
      if (visitedUrls.has(href)) {
        continue;
      }
      
      visitedUrls.add(href);
      
      console.log(`Testing link: ${link.text} (${href})`);
      
      try {
        // Navigate to the link
        const response = await page.goto(href);
        
        // Check if page loaded successfully
        if (!response) {
          linkIssues.push({url: href, issue: 'No response when navigating to page'});
          continue;
        }        if (!response.ok()) {
          linkIssues.push({url: href, issue: `HTTP status ${response.status()}: ${response.statusText()}`});
          continue;
        }
        
        // Check page title
        const title = await page.title();
        if (!title || title === 'Vite + React + TS') {
          linkIssues.push({url: href, issue: 'Missing or default page title'});
        }
        
        // Check for main heading (h1)
        const h1Count = await page.locator('h1').count();
        if (h1Count === 0) {
          linkIssues.push({url: href, issue: 'Page is missing an H1 heading (SEO issue)'});
        } else if (h1Count > 1) {
          suggestions.push({
            component: 'SEO',
            suggestion: `Page ${href} has ${h1Count} H1 headings. Better to have just one for SEO.`
          });
        }
        
        // Test for basic content presence
        const hasContent = await page.locator('main, article, section, .content').count() > 0;
        if (!hasContent) {
          suggestions.push({
            component: 'Content',
            suggestion: `Page ${href} may be empty or missing main content containers`
          });
        }
      } catch (error) {
        linkIssues.push({url: href, issue: `Error navigating to page: ${error}`});
      }
    }
    
    // Check for common UX patterns
    const hasBreadcrumbs = await page.locator('nav[aria-label="breadcrumb"], .breadcrumbs, [role="navigation"][aria-label*="bread"]').count() > 0;
    if (!hasBreadcrumbs) {
      suggestions.push({
        component: 'UX',
        suggestion: 'Consider adding breadcrumb navigation for better user orientation and UX'
      });
    }
    
    const hasSearch = await page.locator('input[type="search"], [role="search"], form:has(input[placeholder*="search" i])').count() > 0;
    if (!hasSearch) {
      suggestions.push({
        component: 'UX', 
        suggestion: 'Consider adding search functionality to help users find content quickly'
      });
    }    // Performance suggestions
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    const navData = JSON.parse(performanceEntries);
    if (navData.length > 0) {
      const loadTime = navData[0].loadEventEnd - navData[0].startTime;
      if (loadTime > 3000) {
        suggestions.push({
          component: 'Performance',
          suggestion: `Homepage load time is slow (${Math.round(loadTime)}ms). Consider optimizing images and reducing initial bundle size.`
        });
      }
    }
    
    // Check for mobile-friendly navigation
    const hasMobileMenu = await page.locator('button[aria-label*="menu" i], [aria-label*="navigation" i]').count() > 0;
    if (!hasMobileMenu) {
      suggestions.push({
        component: 'Responsive Design',
        suggestion: 'Consider adding a mobile-friendly navigation menu toggle for better mobile experience'
      });
    }

    // Test specific links that should be present on most sites
    const expectedPages = [
      {path: '/startups', name: 'Startups page'},
      {path: '/collaborate', name: 'Collaborate page'},
      {path: '/investors', name: 'Investors page'},
      {path: '/startups/create', name: 'Create Startup page'}
    ];

    for (const page of expectedPages) {
      if (!allLinks.some(link => link.href === page.path)) {
        suggestions.push({
          component: 'Navigation',
          suggestion: `${page.name} (${page.path}) isn't linked from the homepage. Consider adding it to main navigation.`
        });
      }
    }
    
    // Print report at the end of the test
    console.log('\n---- LINK ISSUES REPORT ----');
    if (linkIssues.length === 0) {
      console.log('✅ No link issues found!');
    } else {
      linkIssues.forEach((issue, i) => {
        console.log(`❌ ${i+1}. ${issue.url}: ${issue.issue}`);
      });
    }    console.log('\n---- IMPROVEMENT SUGGESTIONS ----');
    if (suggestions.length === 0) {
      console.log('✨ No suggestions - the website looks great!');
    } else {
      suggestions.forEach((item, i) => {
        console.log(`💡 ${i+1}. [${item.component}] ${item.suggestion}`);
      });
    }
    
    // Take screenshots of key pages for visual reference
    await page.screenshot({ path: './test-results/homepage-audit.png', fullPage: true });
    
    // Assert that critical paths don't have issues
    const criticalPaths = ['/startups', '/collaborate', '/investors', '/startups/create'];
    const criticalIssues = linkIssues.filter(issue => criticalPaths.includes(issue.url));
    expect(criticalIssues, 'Critical path pages should not have issues').toHaveLength(0);
  });
  
  test('Check for broken links and unreachable pages', async ({ page }) => {
    // Start at the homepage
    await page.goto('/');
    
    // Get all unique links from the site
    const allLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links.map(link => link.getAttribute('href')).filter(Boolean);
    });
    
    // Filter for internal links only
    const internalLinks = allLinks.filter(href => 
      href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')
    );
    
    const uniqueLinks = [...new Set(internalLinks)];
    
    // Check each internal link
    console.log(`Testing ${uniqueLinks.length} unique internal links for accessibility...`);
    
    const results = {
      broken: [] as string[],
      slow: [] as {url: string, time: number}[],
      noH1: [] as string[]
    };
    
    for (const href of uniqueLinks) {
      try {
        // Measure navigation time
        const startTime = Date.now();
        const response = await page.goto(href || '/');
        const loadTime = Date.now() - startTime;
        
        if (!response || !response.ok()) {
          results.broken.push(href || '/');
          continue;
        }        // Check for slow pages
        if (loadTime > 2000) {
          results.slow.push({ url: href || '/', time: loadTime });
        }
        
        // Check for missing H1
        const hasH1 = await page.locator('h1').count() > 0;
        if (!hasH1) {
          results.noH1.push(href || '/');
        }
        
      } catch (error) {
        results.broken.push(href || '/');
      }
    }
    
    // Report results
    console.log('\n---- LINK HEALTH CHECK ----');
    console.log(`Total internal links tested: ${uniqueLinks.length}`);
    
    if (results.broken.length > 0) {
      console.log(`\n❌ Broken links (${results.broken.length}):`);
      results.broken.forEach(url => console.log(`  - ${url}`));
    }
    
    if (results.slow.length > 0) {
      console.log(`\n⚠️ Slow loading pages (${results.slow.length}):`);
      results.slow.forEach(item => console.log(`  - ${item.url}: ${item.time}ms`));
    }
    
    if (results.noH1.length > 0) {
      console.log(`\n⚠️ Pages without H1 heading (${results.noH1.length}):`);
      results.noH1.forEach(url => console.log(`  - ${url}`));
    }
    
    // Save a JSON report
    await page.evaluate((data) => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
      element.setAttribute('download', 'link-audit-report.json');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, results);
    
    // Assertions
    expect(results.broken, 'There should be no broken links').toHaveLength(0);
  });
});