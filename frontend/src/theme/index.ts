import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const colors = {
  brand: {
    50: '#E6F4FF',
    100: '#B3D8FF', 
    200: '#80BCFF',
    300: '#4DA0FF',
    400: '#1A84FF',
    500: '#1890FF', // Primary Blue - matches design system
    600: '#0050B3',
    700: '#003A80',
    800: '#00244D',
    900: '#000E1A',
  },
  startup: {
    50: '#FFF7E6',
    100: '#FFE7B3',
    200: '#FFD780',
    300: '#FFC74D',
    400: '#FFB71A',
    500: '#FF9500', // Startup Orange
    600: '#CC7700',
    700: '#995900',
    800: '#663B00',
    900: '#331D00',
  },
  investor: {
    50: '#F0FFF4',
    100: '#C6F7D0',
    200: '#9CEFAB',
    300: '#72E787',
    400: '#48DF62',
    500: '#52C41A', // Investment Green
    600: '#237804',
    700: '#1A5A03',
    800: '#103C02',
    900: '#071E01',
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
      dark: 'rgba(18, 18, 19, 0.8)',
    },
    elevated: {
      light: 'rgba(255, 255, 255, 0.95)',
      dark: 'rgba(26, 26, 28, 0.95)',
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.7)',
      dark: 'rgba(18, 18, 19, 0.7)',
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
        outline: '3px solid rgba(24, 144, 255, 0.5)',
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
          boxShadow: mode(shadows.lg, shadows['lg-dark'])(props),
        },
      }),
      startup: {
        background: 'linear-gradient(135deg, #FF9500 0%, #FF5500 100%)',
        clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
        pl: 8,
        color: 'white',
        boxShadow: '0 4px 20px rgba(255, 149, 0, 0.3)',
        _hover: {
          boxShadow: '0 8px 25px rgba(255, 149, 0, 0.4)',
        },
      },
      investor: {
        background: 'linear-gradient(135deg, #52C41A 0%, #237804 100%)',
        borderRadius: '50px 16px 16px 50px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(82, 196, 26, 0.3)',
        _hover: {
          boxShadow: '0 8px 25px rgba(82, 196, 26, 0.4)',
        },
      },
      asymmetric: {
        clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
        pr: 8,
        background: 'linear-gradient(135deg, #1890FF 0%, #0050B3 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(24, 144, 255, 0.3)',
      },
      glass: (props: any) => ({
        bg: mode('bg.glass.light', 'bg.glass.dark')(props),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid',
        borderColor: mode('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.06)')(props),
        color: mode('text.primary.light', 'text.primary.dark')(props),
        boxShadow: mode(shadows.sm, shadows['sm-dark'])(props),
        _hover: {
          bg: mode('rgba(255, 255, 255, 0.9)', 'rgba(18, 18, 19, 0.9)')(props),
        },
      }),
      ghost: (props: any) => ({
        bg: 'transparent',
        color: mode('text.secondary.light', 'text.secondary.dark')(props),
        _hover: {
          bg: mode('rgba(24, 144, 255, 0.08)', 'rgba(24, 144, 255, 0.12)')(props),
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
    },
    sizes: {
      sm: {
        minH: '36px',
        px: 4,
        py: 2,
        fontSize: 'xs',
      },
      md: {
        minH: '44px',
        px: 6,
        py: 3,
        fontSize: 'sm',
      },
      lg: {
        minH: '56px',
        px: 8,
        py: 4,
        fontSize: 'md',
      },
      xl: {
        minH: '64px',
        px: 10,
        py: 5,
        fontSize: 'lg',
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
        borderColor: mode('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.06)')(props),
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
      startup: () => ({
        container: {
          borderRadius: '24px 50% 24px 24px',
          borderLeft: '4px solid',
          borderLeftColor: 'startup.500',
        },
      }),
      investor: () => ({
        container: {
          borderRadius: '50px 24px 24px 50px',
          borderLeft: '4px solid',
          borderLeftColor: 'investor.500',
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
          outline: '3px solid rgba(24, 144, 255, 0.5)',
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
          borderColor: mode('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.06)')(props),
        },
      }),
    },
  },
  Container: {
    baseStyle: {
      maxW: '1200px',
      px: { base: 4, md: 6, lg: 8 },
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

export const theme = extendTheme({
  config,
  colors,
  fonts,
  shadows,
  components,
  styles,
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
});

export default theme;