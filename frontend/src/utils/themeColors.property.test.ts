import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { themeColors } from './themeColors';

/**
 * Property-based tests for the themeColors utility.
 * Feature: brand-theme-overhaul
 */

/**
 * Property 2: Brand alpha variants use navy RGB components
 * Validates: Requirements 8.4
 *
 * For any alpha variant key in `themeColors.brand.primaryAlpha`,
 * the RGBA string SHALL contain RGB components (27, 42, 74) (navy)
 * and NOT (16, 185, 129) (green).
 */
describe('Feature: brand-theme-overhaul, Property 2: Brand alpha variants use navy RGB components', () => {
  const alphaKeys = Object.keys(themeColors.brand.primaryAlpha).map(Number) as Array<
    keyof typeof themeColors.brand.primaryAlpha
  >;

  const alphaKeyArbitrary = fc.constantFrom(...alphaKeys);

  it('brand primaryAlpha values use navy RGB (27, 42, 74) and not green RGB (16, 185, 129)', () => {
    fc.assert(
      fc.property(alphaKeyArbitrary, (key) => {
        const rgbaString = themeColors.brand.primaryAlpha[key];

        // Parse the RGBA string: expected format "rgba(R, G, B, A)"
        const match = rgbaString.match(
          /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/
        );

        expect(match).not.toBeNull();

        const r = parseInt(match![1], 10);
        const g = parseInt(match![2], 10);
        const b = parseInt(match![3], 10);

        // Assert RGB components are navy (27, 42, 74)
        expect(r).toBe(27);
        expect(g).toBe(42);
        expect(b).toBe(74);

        // Assert RGB components are NOT green (16, 185, 129)
        expect(r).not.toBe(16);
        expect(g).not.toBe(185);
        expect(b).not.toBe(129);
      }),
      { numRuns: 100 }
    );
  });
});
