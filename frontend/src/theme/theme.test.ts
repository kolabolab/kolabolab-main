import { describe, it, expect } from 'vitest';
import { theme } from './index';
import { themeColors } from '../utils/themeColors';

/**
 * Unit tests for the brand theme overhaul.
 * Validates: Requirements 5.1, 9.4
 */

describe('Theme structure', () => {
  it('matches the expected theme snapshot', () => {
    expect(theme.colors).toMatchSnapshot();
  });

  describe('accent color group', () => {
    it('exists in theme colors', () => {
      const colors = theme.colors as any;
      expect(colors.accent).toBeDefined();
    });

    it('has a full shade scale (50–900)', () => {
      const colors = theme.colors as any;
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      for (const shade of shades) {
        expect(colors.accent[shade]).toBeDefined();
      }
    });

    it('has cyan #00BFFF as the 500 shade', () => {
      const colors = theme.colors as any;
      expect(colors.accent[500]).toBe('#00BFFF');
    });
  });

  describe('success color group', () => {
    it('exists in theme colors', () => {
      const colors = theme.colors as any;
      expect(colors.success).toBeDefined();
    });

    it('has a full shade scale (50–900)', () => {
      const colors = theme.colors as any;
      const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      for (const shade of shades) {
        expect(colors.success[shade]).toBeDefined();
      }
    });

    it('has green #10B981 as the 500 shade', () => {
      const colors = theme.colors as any;
      expect(colors.success[500]).toBe('#10B981');
    });
  });

  describe('startup and investor colors are unchanged', () => {
    it('startup primary color is #FF9500', () => {
      expect(themeColors.startup.primary).toBe('#FF9500');
    });

    it('startup alpha variants are preserved', () => {
      expect(themeColors.startup.primaryAlpha[5]).toBe('rgba(255, 149, 0, 0.05)');
      expect(themeColors.startup.primaryAlpha[8]).toBe('rgba(255, 149, 0, 0.08)');
      expect(themeColors.startup.primaryAlpha[10]).toBe('rgba(255, 149, 0, 0.1)');
      expect(themeColors.startup.primaryAlpha[12]).toBe('rgba(255, 149, 0, 0.12)');
    });

    it('investor primary color is #52C41A', () => {
      expect(themeColors.investor.primary).toBe('#52C41A');
    });

    it('investor alpha variants are preserved', () => {
      expect(themeColors.investor.primaryAlpha[5]).toBe('rgba(82, 196, 26, 0.05)');
      expect(themeColors.investor.primaryAlpha[8]).toBe('rgba(82, 196, 26, 0.08)');
      expect(themeColors.investor.primaryAlpha[10]).toBe('rgba(82, 196, 26, 0.1)');
      expect(themeColors.investor.primaryAlpha[12]).toBe('rgba(82, 196, 26, 0.12)');
    });
  });
});

describe('Button variants', () => {
  it('asymmetric variant includes navy-to-cyan gradient', () => {
    const buttonTheme = (theme.components as any)?.Button;
    expect(buttonTheme).toBeDefined();
    expect(buttonTheme.variants.asymmetric).toBeDefined();

    // Call the variant function to get the style object
    const styles = buttonTheme.variants.asymmetric({});
    expect(styles.bgGradient).toContain('brand.500');
    expect(styles.bgGradient).toContain('accent.500');
  });

  it('asymmetric variant hover includes navy/cyan box shadow', () => {
    const buttonTheme = (theme.components as any)?.Button;
    const styles = buttonTheme.variants.asymmetric({});
    // Hover shadow uses cyan rgba
    expect(styles._hover.boxShadow).toContain('rgba(0, 191, 255');
  });

  it('solid variant uses brand colorScheme with cyan-tinted hover', () => {
    const buttonTheme = (theme.components as any)?.Button;
    expect(buttonTheme.variants.solid).toBeDefined();

    // Call with brand colorScheme
    const styles = buttonTheme.variants.solid({ colorScheme: 'brand', theme });
    expect(styles.bg).toBe('brand.500');
    expect(styles._hover.bg).toBe('brand.600');
    // Brand hover uses cyan box shadow
    expect(styles._hover.boxShadow).toContain('rgba(0, 191, 255');
  });
});
