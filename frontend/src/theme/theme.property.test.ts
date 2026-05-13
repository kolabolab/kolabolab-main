import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { theme } from './index';

/**
 * Property-based tests for the brand theme overhaul.
 * Feature: brand-theme-overhaul
 */

/**
 * Property 1: Brand color token resolves to navy palette
 * Validates: Requirements 1.4, 9.2
 *
 * For any valid shade level in the Chakra UI `brand` color scheme,
 * the resolved hex value SHALL correspond to the navy palette and
 * NOT contain any green palette value.
 */
describe('Feature: brand-theme-overhaul, Property 1: Brand color token resolves to navy palette', () => {
  const navyPalette: Record<number, string> = {
    50: '#E8EBF0',
    100: '#C5CCD9',
    200: '#9FADBF',
    300: '#7A8EA6',
    400: '#5E7793',
    500: '#1B2A4A',
    600: '#162240',
    700: '#111A33',
    800: '#0C1226',
    900: '#070B19',
  };

  const greenPaletteValues = [
    '#10B981',
    '#059669',
    '#047857',
    '#065F46',
    '#064E3B',
    '#ECFDF5',
    '#D1FAE5',
    '#A7F3D0',
    '#6EE7B7',
    '#34D399',
  ];

  const shadeArbitrary = fc.constantFrom(50, 100, 200, 300, 400, 500, 600, 700, 800, 900);

  it('brand color token resolves to navy palette and not green palette', () => {
    fc.assert(
      fc.property(shadeArbitrary, (shade) => {
        const brandColors = (theme.colors as any).brand;
        const value = brandColors[shade];

        // Assert it matches the expected navy palette value
        expect(value).toBe(navyPalette[shade]);

        // Assert it does NOT match any green palette value
        const upperValue = value.toUpperCase();
        for (const greenValue of greenPaletteValues) {
          expect(upperValue).not.toBe(greenValue.toUpperCase());
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 3: Text-to-background contrast meets WCAG AA
 * Validates: Requirements 7.1, 10.3
 *
 * For any navy shade (brand.500–brand.900) used as text color against the
 * light mode base background (#F8FAFF), and for any accent shade
 * (accent.300–accent.500) used as text color against the dark mode base
 * background (#0A0A0B), the computed contrast ratio SHALL be at least 4.5:1.
 */
describe('Feature: brand-theme-overhaul, Property 3: Text-to-background contrast meets WCAG AA', () => {
  /**
   * Convert a hex color string to its sRGB components (0–1 range).
   */
  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const cleaned = hex.replace('#', '');
    return {
      r: parseInt(cleaned.slice(0, 2), 16) / 255,
      g: parseInt(cleaned.slice(2, 4), 16) / 255,
      b: parseInt(cleaned.slice(4, 6), 16) / 255,
    };
  }

  /**
   * Linearize an sRGB channel value per WCAG 2.x relative luminance formula.
   */
  function linearize(channel: number): number {
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  }

  /**
   * Compute relative luminance of a color per WCAG 2.x.
   */
  function relativeLuminance(hex: string): number {
    const { r, g, b } = hexToRgb(hex);
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  }

  /**
   * Compute contrast ratio between two colors per WCAG 2.x.
   */
  function contrastRatio(color1: string, color2: string): number {
    const l1 = relativeLuminance(color1);
    const l2 = relativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  const WCAG_AA_MIN = 4.5;

  const lightBackground = '#F8FAFF';
  const darkBackground = '#0A0A0B';

  // Navy shades brand.500–brand.900 (dark text on light background)
  const navyTextShades = fc.constantFrom(500, 600, 700, 800, 900);

  // Accent shades accent.300–accent.500 (light text on dark background)
  const accentTextShades = fc.constantFrom(300, 400, 500);

  it('navy text (brand.500–900) on light background (#F8FAFF) meets WCAG AA 4.5:1', () => {
    fc.assert(
      fc.property(navyTextShades, (shade) => {
        const brandColors = (theme.colors as any).brand;
        const textColor = brandColors[shade];
        const ratio = contrastRatio(textColor, lightBackground);

        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_MIN);
      }),
      { numRuns: 100 }
    );
  });

  it('accent text (accent.300–500) on dark background (#0A0A0B) meets WCAG AA 4.5:1', () => {
    fc.assert(
      fc.property(accentTextShades, (shade) => {
        const accentColors = (theme.colors as any).accent;
        const textColor = accentColors[shade];
        const ratio = contrastRatio(textColor, darkBackground);

        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_MIN);
      }),
      { numRuns: 100 }
    );
  });
});
