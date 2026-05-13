import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const colors = {
  brand: {
    50: '#E8EBF0',
    100: '#C5CCD9',
    200: '#9FADBF',
    300: '#7A8EA6',
    400: '#5E7793',
    500: '#1B2A4A', // Primary Navy - matches brand logo
    600: '#162240',
    700: '#111A33',
    800: '#0C1226',
    900: '#070B19',
  },
  accent: {
    50: '#E0F7FF',
    100: '#B3ECFF',
    200: '#80E0FF',
    300: '#4DD4FF',
    400: '#26CAFF',
    500: '#00BFFF', // Cyan accent
    600: '#00A3DB',
    700: '#0087B8',
    800: '#006B94',
    900: '#004F70',
  },
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Green for success semantics only
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280', // Professional Accent Gray
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Support Blue - used sparingly
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E8E8E8',
    300: '#D9D9D9',
    400: '#BFBFBF',
    500: '#8C8C8C',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#1F1F1F',
    950: '#141414',
  },
  bg: {
    base: {
      light: '#F8FAFF',
      dark: '#0A0A0B',
    },
    surface: {
      light: 'rgba(255, 255, 255, 0.8)',
      dark: 'rgba(17, 26, 51, 0.8)',
    },
    elevated: {
      light: 'rgba(255, 255, 255, 0.95)',
      dark: 'rgba(22, 34, 64, 0.95)',
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.7)',
      dark: 'rgba(17, 26, 51, 0.7)',
    },
    raised: {
      light: '#FFFFFF',
      dark: '#162240',
    },
    overlay: {
      light: '#F8FAFF',
      dark: '#111A33',
    },
  },
  text: {
    primary: {
      light: 'rgba(0, 0, 0, 0.92)',
      dark: 'rgba(255, 255, 255, 0.92)',
    },
    secondary: {
      light: 'rgba(0, 0, 0, 0.64)',
      dark: 'rgba(255, 255, 255, 0.64)',
    },
    tertiary: {
      light: 'rgba(0, 0, 0, 0.38)',
      dark: 'rgba(255, 255, 255, 0.38)',
    },
  },
  interactive: {
    accent: {
      light: '#00BFFF',
      dark: '#4DD4FF',
    },
    hover: {
      light: 'rgba(27, 42, 74, 0.08)',
      dark: 'rgba(0, 191, 255, 0.12)',
    },
    active: {
      light: 'rgba(27, 42, 74, 0.12)',
      dark: 'rgba(0, 191, 255, 0.2)',
    },
  },
};

const fonts = {
  heading: `'Poppins', system-ui, -apple-system, sans-serif`,
  body: `'Inter', system-ui, -apple-system, sans-serif`,
  accent: `'Space Grotesk', system-ui, -apple-system, sans-serif`,
};

const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
  md: '0 8px 32px rgba(0, 0, 0, 0.05)',
  lg: '0 12px 40px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 60px rgba(0, 0, 0, 0.15)',
  'sm-dark': '0 2px 8px rgba(0, 0, 0, 0.2)',
  'md-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
  'lg-dark': '0 12px 40px rgba(0, 0, 0, 0.4)',
  'xl-dark': '0 20px 60px rgba(0, 0, 0, 0.5)',
};

const components = {
  Button: {
    baseStyle: {
      fontFamily: 'heading',
      fontWeight: '600',
      borderRadius: '16px',
      minH: '44px',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      _hover: {
        transform: 'translateY(-3px) scale(1.02)',
      },
      _active: {
        transform: 'translateY(1px) scale(0.98)',
      },
      _focusVisible: {
        outline: '3px solid rgba(0, 191, 255, 0.5)',
        outlineOffset: '2px',
      },
    },
    variants: {
      solid: (props: any) => ({
        bg: `${props.colorScheme}.500`,
        color: 'white',
        boxShadow: mode(shadows.md, shadows['md-dark'])(props),
        _hover: {
          bg: `${props.colorScheme}.600`,
          boxShadow: props.colorScheme === 'brand'
            ? '0 8px 25px rgba(0, 191, 255, 0.3)'
            : mode(shadows.lg, shadows['lg-dark'])(props),
        },
      }),
      asymmetric: () => ({
        bgGradient: 'linear(to-r, brand.500, accent.500)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(27, 42, 74, 0.25)',
        _hover: {
          bgGradient: 'linear(to-r, brand.600, accent.400)',
          boxShadow: '0 8px 25px rgba(0, 191, 255, 0.3)',
          transform: 'translateY(-3px) scale(1.02)',
        },
      }),
      secondary: () => ({
        bg: 'gray.500',
        color: 'white',
        boxShadow: '0 4px 20px rgba(107, 114, 128, 0.2)',
        _hover: {
          bg: 'gray.600',
          boxShadow: '0 8px 25px rgba(107, 114, 128, 0.3)',
        },
      }),
      success: () => ({
        bg: 'green.500',
        color: 'white',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
        _hover: {
          bg: 'green.600',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.35)',
        },
      }),
      glass: (props: any) => ({
        bg: mode('bg.glass.light', 'bg.glass.dark')(props),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid',
        borderColor: mode('rgba(0, 0, 0, 0.06)', 'rgba(0, 191, 255, 0.06)')(props),
        color: mode('text.primary.light', 'text.primary.dark')(props),
        boxShadow: mode(shadows.sm, shadows['sm-dark'])(props),
        _hover: {
          bg: mode('rgba(255, 255, 255, 0.9)', 'rgba(17, 26, 51, 0.9)')(props),
        },
      }),
      ghost: (props: any) => ({
        bg: 'transparent',
        color: mode('text.secondary.light', 'text.secondary.dark')(props),
        _hover: {
          bg: mode('rgba(27, 42, 74, 0.08)', 'rgba(0, 191, 255, 0.12)')(props),
        },
      }),
      outline: (props: any) => ({
        bg: 'transparent',
        border: '2px solid',
        borderColor: `${props.colorScheme}.500`,
        color: `${props.colorScheme}.500`,
        _hover: {
          bg: `${props.colorScheme}.50`,
        },
      }),
      'outline-secondary': () => ({
        bg: 'transparent',
        border: '2px solid',
        borderColor: 'gray.500',
        color: 'gray.500',
        _hover: {
          bg: 'gray.50',
        },
      }),
    },
    sizes: {
      sm: {
        h: '36px',
        minH: '36px',
        px: 4,
        py: 0,
        fontSize: 'xs',
        lineHeight: 1,
      },
      md: {
        h: { base: '48px', md: '44px' },
        minH: { base: '48px', md: '44px' },
        px: 6,
        py: 0,
        fontSize: 'sm',
        lineHeight: 1,
      },
      lg: {
        h: '52px',
        minH: '52px',
        px: 8,
        py: 0,
        fontSize: 'md',
        lineHeight: 1,
      },
      xl: {
        h: '60px',
        minH: '60px',
        px: 10,
        py: 0,
        fontSize: 'lg',
        lineHeight: 1,
      },
    },
  },
  Menu: {
    baseStyle: {
      list: {
        zIndex: 'popover',
        position: 'absolute',
        minW: '220px',
        py: 2,
        borderRadius: 'xl',
        border: '2px solid',
        borderColor: 'accent.200',
        bg: 'white',
        boxShadow: 'xl',
      },
      item: {
        borderRadius: 'md',
        _hover: {
          bg: 'brand.50',
        },
        _focus: {
          bg: 'brand.50',
        },
      },
    },
  },
  Card: {
    baseStyle: (props: any) => ({
      container: {
        bg: mode('bg.surface.light', 'bg.surface.dark')(props),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid',
        borderColor: mode('rgba(0, 0, 0, 0.06)', 'rgba(0, 191, 255, 0.06)')(props),
        boxShadow: mode(shadows.md, shadows['md-dark'])(props),
        overflow: 'hidden',
        transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        _hover: {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: mode(shadows.xl, shadows['xl-dark'])(props),
        },
      },
    }),
    variants: {
      primary: () => ({
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'brand.500',
        },
      }),
      secondary: () => ({
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'gray.500',
        },
      }),
      success: () => ({
        container: {
          borderLeft: '4px solid',
          borderLeftColor: 'green.500',
        },
      }),
      glass: (props: any) => ({
        container: {
          bg: mode('bg.glass.light', 'bg.glass.dark')(props),
        },
      }),
    },
  },
  Heading: {
    baseStyle: (props: any) => ({
      fontFamily: 'heading',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
      color: mode('text.primary.light', 'text.primary.dark')(props),
    }),
  },
  Text: {
    baseStyle: (props: any) => ({
      color: mode('text.secondary.light', 'text.secondary.dark')(props),
      lineHeight: '1.6',
    }),
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: '12px',
        minH: '44px',
        transition: 'all 0.3s ease',
        _focusVisible: {
          outline: '3px solid rgba(0, 191, 255, 0.5)',
          outlineOffset: '2px',
        },
      },
    },
    variants: {
      glass: (props: any) => ({
        field: {
          bg: mode('bg.glass.light', 'bg.glass.dark')(props),
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: mode('rgba(0, 0, 0, 0.06)', 'rgba(0, 191, 255, 0.06)')(props),
        },
      }),
    },
  },
  Container: {
    baseStyle: {
      maxW: '1200px',
      px: { base: 4, md: 6, lg: 8 },
    },
    sizes: {
      sm: { maxW: '640px' },
      md: { maxW: '768px' },
      lg: { maxW: '1024px' },
      xl: { maxW: '1280px' },
      '2xl': { maxW: '1536px' },
      '3xl': { maxW: '1920px' },
      '4xl': { maxW: '2560px' },
      full: { maxW: '100%' },
      responsive: { 
        maxW: { 
          base: 'container.sm', 
          md: 'container.md', 
          lg: 'container.lg', 
          xl: 'container.xl', 
          '2xl': '90%' 
        } 
      },
    },
  },
};

const styles = {
  global: (props: any) => ({
    body: {
      bg: mode('bg.base.light', 'bg.base.dark')(props),
      color: mode('text.primary.light', 'text.primary.dark')(props),
      fontFamily: 'body',
      lineHeight: '1.6',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    },
    '*': {
      boxSizing: 'border-box',
    },
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: 'heading',
      fontWeight: '700',
      letterSpacing: '-0.02em',
      lineHeight: '1.2',
    },
    h1: {
      fontSize: { base: '2rem', md: '3rem', lg: '3.5rem' },
    },
    h2: {
      fontSize: { base: '1.5rem', md: '2rem', lg: '2.5rem' },
    },
    h3: {
      fontSize: { base: '1.25rem', md: '1.5rem', lg: '1.875rem' },
    },
    // Focus management for accessibility
    '.skip-link': {
      position: 'absolute',
      top: '-40px',
      left: '6px',
      bg: 'brand.500',
      color: 'white',
      p: 2,
      textDecoration: 'none',
      borderRadius: 'sm',
      zIndex: 10000,
      transition: 'top 0.15s ease',
      _focus: {
        top: '6px',
      },
    },
  }),
};

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const semanticTokens = {
  colors: {
    // Base backgrounds
    'bg-base': {
      default: '#F8FAFF',
      _dark: '#0A0A0B',
    },
    'bg-surface': {
      default: 'rgba(255, 255, 255, 0.8)',
      _dark: 'rgba(17, 26, 51, 0.8)',
    },
    'bg-elevated': {
      default: 'rgba(255, 255, 255, 0.95)',
      _dark: 'rgba(22, 34, 64, 0.95)',
    },
    'bg-glass': {
      default: 'rgba(255, 255, 255, 0.7)',
      _dark: 'rgba(17, 26, 51, 0.7)',
    },
    // Dark mode surface variants using lighter navy shades
    'bg-surface-raised': {
      default: 'white',
      _dark: '#162240',
    },
    'bg-surface-overlay': {
      default: 'gray.50',
      _dark: '#111A33',
    },
    // Text colors
    'text-primary': {
      default: 'rgba(0, 0, 0, 0.92)',
      _dark: 'rgba(255, 255, 255, 0.92)',
    },
    'text-secondary': {
      default: 'rgba(0, 0, 0, 0.64)',
      _dark: 'rgba(255, 255, 255, 0.64)',
    },
    'text-tertiary': {
      default: 'rgba(0, 0, 0, 0.38)',
      _dark: 'rgba(255, 255, 255, 0.38)',
    },
    // Interactive elements - brighter cyan in dark mode
    'interactive-accent': {
      default: 'accent.500',
      _dark: 'accent.300',
    },
    'interactive-hover': {
      default: 'rgba(27, 42, 74, 0.08)',
      _dark: 'rgba(0, 191, 255, 0.12)',
    },
    // Border colors - cyan-tinted in dark mode
    'border-subtle': {
      default: 'rgba(0, 0, 0, 0.06)',
      _dark: 'rgba(0, 191, 255, 0.06)',
    },
    'border-default': {
      default: 'rgba(0, 0, 0, 0.12)',
      _dark: 'rgba(0, 191, 255, 0.12)',
    },
  },
};

export const theme = extendTheme({
  config,
  colors,
  fonts,
  shadows,
  semanticTokens,
  components,
  styles,
  breakpoints: {
    base: '0px',
    sm: '480px',
    md: '768px',
    lg: '992px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
    '4xl': '2560px',
  },
  space: {
    0: '0',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px',
  },
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
});

export default theme;