import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

// Color palette optimized for WCAG 2.2 AA compliance
const colors = {
  brand: {
    50: '#E6F3FF',
    100: '#B3DAFF',
    200: '#80C1FF',
    300: '#4DA8FF',
    400: '#1A8FFF',
    500: '#1890FF', // Primary brand color
    600: '#0066CC',
    700: '#004C99',
    800: '#003366',
    900: '#001933',
  },
  startup: {
    50: '#FFF5E6',
    100: '#FFE6B3',
    200: '#FFD780',
    300: '#FFC84D',
    400: '#FFB91A',
    500: '#FF9500', // Startup orange
    600: '#CC7700',
    700: '#995900',
    800: '#663B00',
    900: '#331D00',
  },
  invest: {
    50: '#E6F7F0',
    100: '#B3E6D1',
    200: '#80D5B2',
    300: '#4DC493',
    400: '#1AB374',
    500: '#52C41A', // Investment green
    600: '#419E15',
    700: '#317710',
    800: '#20500A',
    900: '#102905',
  },
  semantic: {
    error: '#FF4D4F',
    warning: '#FAAD14',
    success: '#52C41A',
    info: '#1890FF',
  },
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E8E8E8',
    300: '#D9D9D9',
    400: '#BFBFBF',
    500: '#8C8C8C',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#141414',
  },
}

// Typography system with accessibility focus
const fonts = {
  heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
}

const fontSizes = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  md: '1rem',      // 16px (base)
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
}

// Component style overrides for accessibility
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
      _focus: {
        boxShadow: '0 0 0 3px rgba(24, 144, 255, 0.3)',
        outline: 'none',
      },
      _disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    variants: {
      solid: (props: any) => ({
        bg: mode('brand.500', 'brand.200')(props),
        color: mode('white', 'gray.800')(props),
        _hover: {
          bg: mode('brand.600', 'brand.300')(props),
          _disabled: {
            bg: mode('brand.500', 'brand.200')(props),
          },
        },
        _active: {
          bg: mode('brand.700', 'brand.400')(props),
        },
      }),
      outline: (props: any) => ({
        border: '2px solid',
        borderColor: mode('brand.500', 'brand.200')(props),
        color: mode('brand.500', 'brand.200')(props),
        _hover: {
          bg: mode('brand.50', 'whiteAlpha.200')(props),
        },
      }),
      ghost: (props: any) => ({
        color: mode('brand.500', 'brand.200')(props),
        _hover: {
          bg: mode('brand.50', 'whiteAlpha.200')(props),
        },
      }),
      // Custom variant for CTA sections with dark backgrounds
      'cta-primary': {
        bg: 'white',
        color: 'brand.500',
        _hover: {
          bg: 'gray.100',
        },
        _focus: {
          boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.3)',
        },
      },
      'cta-secondary': {
        border: '2px solid white',
        borderColor: 'white',
        color: 'white',
        bg: 'transparent',
        _hover: {
          bg: 'whiteAlpha.200',
        },
        _focus: {
          boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.3)',
        },
      },
    },
    sizes: {
      sm: {
        h: '32px',
        minW: '32px',
        fontSize: 'sm',
        px: 3,
      },
      md: {
        h: '40px',
        minW: '40px',
        fontSize: 'md',
        px: 4,
      },
      lg: {
        h: '48px',
        minW: '48px',
        fontSize: 'lg',
        px: 6,
      },
    },
  },
  
  Input: {
    variants: {
      outline: (props: any) => ({
        field: {
          borderColor: mode('gray.300', 'gray.600')(props),
          _hover: {
            borderColor: mode('brand.300', 'brand.500')(props),
          },
          _focus: {
            borderColor: mode('brand.500', 'brand.300')(props),
            boxShadow: '0 0 0 1px rgba(24, 144, 255, 0.3)',
          },
          _invalid: {
            borderColor: 'semantic.error',
            boxShadow: '0 0 0 1px rgba(255, 77, 79, 0.3)',
          },
        },
      }),
    },
  },

  Card: {
    baseStyle: (props: any) => ({
      container: {
        bg: mode('white', 'gray.800')(props),
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: mode('gray.200', 'gray.700')(props),
        boxShadow: 'sm',
        _hover: {
          boxShadow: 'md',
        },
      },
    }),
  },

  Link: {
    baseStyle: (props: any) => ({
      color: mode('brand.500', 'brand.300')(props),
      _hover: {
        textDecoration: 'underline',
        color: mode('brand.600', 'brand.200')(props),
      },
      _focus: {
        boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.3)',
        outline: 'none',
        borderRadius: 'sm',
      },
    }),
  },

  Heading: {
    baseStyle: (props: any) => ({
      color: mode('gray.800', 'white')(props),
      fontWeight: 'bold',
      lineHeight: 'shorter',
    }),
  },

  Text: {
    baseStyle: (props: any) => ({
      color: mode('gray.700', 'gray.300')(props),
      lineHeight: 'base',
    }),
  },

  Alert: {
    variants: {
      solid: (props: any) => {
        const { status } = props
        const statusColors = {
          success: 'semantic.success',
          error: 'semantic.error',
          warning: 'semantic.warning',
          info: 'semantic.info',
        }
        return {
          container: {
            bg: statusColors[status as keyof typeof statusColors],
            color: 'white',
          },
        }
      },
    },
  },
}

// Global styles
const styles = {
  global: (props: any) => ({
    'html, body': {
      fontSize: 'md',
      bg: mode('gray.50', 'gray.900')(props),
      color: mode('gray.800', 'white')(props),
    },
    '*::placeholder': {
      color: mode('gray.400', 'gray.500')(props),
    },
    '*, *::before, *::after': {
      borderColor: mode('gray.200', 'gray.700')(props),
    },
    // Focus styles for keyboard navigation
    '*:focus-visible': {
      outline: '2px solid',
      outlineColor: 'brand.500',
      outlineOffset: '2px',
    },
    // High contrast mode support
    '@media (prefers-contrast: high)': {
      '*': {
        borderWidth: '2px',
      },
    },
    // Reduced motion support
    '@media (prefers-reduced-motion: reduce)': {
      '*': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
      },
    },
  }),
}

// Theme configuration
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
  disableTransitionOnChange: false,
}

// Create the theme
export const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  components,
  styles,
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  breakpoints: {
    base: '0em',
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
})

export default theme