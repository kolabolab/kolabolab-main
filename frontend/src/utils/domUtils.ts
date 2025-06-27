/**
 * DOM utilities for handling common edge cases and fixes
 */

/**
 * Safely get className from a DOM element
 * Handles cases where className might not be a string
 */
export const safeClassName = (element: HTMLElement | Element | null): string => {
  if (!element) return '';
  
  // Handle cases where className might be an object or undefined
  const className = element.className;
  
  if (typeof className === 'string') {
    return className;
  }
  
  // Handle SVG elements where className is an SVGAnimatedString
  if (className && typeof className === 'object' && 'baseVal' in className) {
    return className.baseVal;
  }
  
  return '';
};

/**
 * Safely add a className to an element
 */
export const safeAddClass = (element: HTMLElement | Element | null, className: string): void => {
  if (!element) return;
  
  // For SVG elements
  if (typeof element.className === 'object' && 'baseVal' in element.className) {
    element.className.baseVal = `${element.className.baseVal} ${className}`.trim();
    return;
  }
  
  // For regular HTML elements
  if (typeof element.className === 'string') {
    element.className = `${element.className} ${className}`.trim();
  }
};

/**
 * Fix zero-sized elements by ensuring minimum dimensions
 * This is particularly useful for accessibility improvements
 */
export const fixZeroSizedElements = (): void => {
  // Handle potentially zero-sized links
  const zeroLinks = document.querySelectorAll('a[href], button');
  
  zeroLinks.forEach(element => {
    const computed = window.getComputedStyle(element);
    const hasVisibleText = element.textContent?.trim().length > 0;
    const hasAriaLabel = element.getAttribute('aria-label')?.length > 0;
    
    // If element has no dimensions and no visible text or aria-label
    if ((computed.width === '0px' || computed.height === '0px') && 
        !hasVisibleText && !hasAriaLabel) {
      
      // If it's an empty icon button or similar
      if (element.children.length > 0) {
        // Add an accessible label
        if (!hasAriaLabel) {
          element.setAttribute('aria-label', 'Interactive element');
        }
        
        // Ensure minimum dimensions
        (element as HTMLElement).style.display = 'inline-flex';
        (element as HTMLElement).style.alignItems = 'center';
        (element as HTMLElement).style.justifyContent = 'center';
        (element as HTMLElement).style.minWidth = '44px';
        (element as HTMLElement).style.minHeight = '44px';
      }
    }
  });
};

/**
 * Initialize DOM fixes that should run when app starts
 */
export const initDomFixes = (): void => {
  // Run immediately
  fixZeroSizedElements();
  
  // Also run after DOM updates (use a debounced version in production)
  const observer = new MutationObserver(() => {
    fixZeroSizedElements();
  });
  
  observer.observe(document.body, { 
    childList: true,
    subtree: true
  });
};