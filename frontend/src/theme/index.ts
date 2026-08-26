import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

/**
 * KolaboLab Design System — "Ink & Iris" (experiment)
 * ----------------------------------------------------
 * Design language inspired by the current generation of successful
 * innovation platforms: near-black ink primary, electric iris accent,
 * lime "signal" highlights, editorial display type (Space Grotesk),
 * hairline borders and crisp shadows over heavy glassmorphism.
 *
 * Token contract is unchanged from the previous brand theme:
 * same scale names (brand/accent/success/gray/blue/neutral),
 * same semantic tokens, same component variant names.
 */

const colors = {
  brand: {
    // Ink — near-black with a cool undertone. Primary surface + action color.
    50: '#F5F6F8',
    100: '#EBECF0',
    200: '#D6D8E0',
    300: '#B3B7C4',
    400: '#838BA1',
    500: '#232838', // Primary Ink
    600: '#1B1F2C',
    700: '#151822',
    800: '#0F1119',
    900: '#090A0F',
  },
  accent: {
    // Electric Iris — interactive accent, focus, links.
    50: '#F0F0FF',
    100: '#E2E3FF',
    200: '#C9CAFE',
    300: '#A8AAFB',
    400: '#8487F5',
    500: '#6B6EF2', // Iris accent
    600: '#4B4EDB',
    700: '#3C3EB5',
    800: '#2F318C',
    900: '#252766',
  },
  signal: {
    // Electric Lime — celebratory highlights, badges, marketing pops.
    50: '#F9FEE7',
    100: '#F1FCC5',
    200: '#E4F996',
    300: '#D4F55F',
    400: '#C7F13B',
    500: '#B7E51D',
    600: '#94BE10',
    700: '#71930E',
    800: '#597211',
    900: '#4B5F14',
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
    500: '#6B7280',
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
      light: '#FAFAFB',
      dark: '#0B0C11',
    },
    surface: {
      light: '#FFFFFF',
      dark: '#12141C',
    },
    elevated: {
      light: '#FFFFFF',
      dark: '#171A24',
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.72)',
      dark: 'rgba(18, 20, 28, 0.72)',
    },
    raised: {
      light: '#FFFFFF',
      dark: '#171A24',
    },
    overlay: {
      light: '#FAFAFB',
      dark: '#12141C',
    },
  },
  text: {
    primary: {
      light: 'rgba(9, 10, 15, 0.92)',
      dark: 'rgba(255, 255, 255, 0.92)',
    },
    secondary: {
      light: 'rgba(9, 10, 15, 0.64)',
      dark: 'rgba(255, 255, 255, 0.64)',
    },
    tertiary: {
      // 0.42 failed AA for small text (2.86:1 on bg-base). 0.58 -> 4.82:1 light,
      // 6.86:1 dark. Verified by gan-harness/a11y-contrast.mjs.
      light: 'rgba(9, 10, 15, 0.58)',
      dark: 'rgba(255, 255, 255, 0.58)',
    },
  },
  interactive: {
    accent: {
      light: '#4B4EDB',
      dark: '#A8AAFB',
    },
    hover: {
      light: 'rgba(35, 40, 56, 0.06)',
      dark: 'rgba(107, 110, 242, 0.14)',
    },
    active: {
      light: 'rgba(35, 40, 56, 0.1)',
      dark: 'rgba(107, 110, 242, 0.22)',
    },
  },
};

const fonts = {
  heading: `'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif`,
  body: `'Inter', system-ui, -apple-system, sans-serif`,
  accent: `'Space Grotesk', system-ui, -apple-system, sans-serif`,
};

const radii = {
  sm: '6px',
  base: '8px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  '2xl': '28px',
  full: '9999px',
};

const shadows = {
  sm: '0 1px 2px rgba(9, 10, 15, 0.05)',
  md: '0 2px 8px rgba(9, 10, 15, 0.07)',
  lg: '0 12px 24px -8px rgba(9, 10, 15, 0.12)',
  xl: '0 24px 48px -12px rgba(9, 10, 15, 0.18)',
  outline: '0 0 0 3px rgba(107, 110, 242, 0.4)',
  'sm-dark': '0 1px 2px rgba(0, 0, 0, 0.3)',
  'md-dark': '0 2px 8px rgba(0, 0, 0, 0.35)',
  'lg-dark': '0 12px 24px -8px rgba(0, 0, 0, 0.5)',
  'xl-dark': '0 24px 48px -12px rgba(0, 0, 0, 0.6)',
};

// Focus ring shared by interactive components
const focusRing = {
  boxShadow: '0 0 0 3px rgba(107, 110, 242, 0.4)',
  outline: '2px solid transparent',
  outlineOffset: '2px',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      borderRadius: 'md',
      minH: '44px', // WCAG/HIG tap target — never render a primary control smaller
      transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      _focusVisible: focusRing,
      _hover: { transform: 'translateY(-1px)', _disabled: { transform: 'none' } },
      _active: { transform: 'translateY(0) scale(0.985)' },
    },
    sizes: {
      xl: { h: '56px', minW: '56px', fontSize: 'lg', px: 8 },
      lg: { h: '48px', minW: '48px', fontSize: 'md', px: 7 },
      md: { h: '44px', minW: '44px', fontSize: 'sm', px: 5 },
      sm: { h: '36px', minW: '36px', fontSize: 'sm', px: 4 },
      xs: { h: '30px', minW: '30px', fontSize: 'xs', px: 3 },
    },
    variants: {
      // Ink solid — primary action. colorScheme brand/gray both resolve to ink;
      // in dark mode the solid flips to white-on-ink (inverse) for contrast.
      solid: (props: Record<string, any>) => {
        const c = props.colorScheme;
        if (c === 'brand' || c === 'gray') {
          return {
            bg: mode('brand.500', 'neutral.0')(props),
            color: mode('white', 'brand.700')(props),
            _hover: {
              bg: mode('brand.600', 'neutral.100')(props),
              boxShadow: '0 8px 20px -6px rgba(107, 110, 242, 0.45)',
              _disabled: { bg: mode('brand.500', 'neutral.0')(props) },
            },
            _active: { bg: mode('brand.700', 'neutral.200')(props) },
          };
        }
        // accent.500 is reserved for text/decoration; white-text fills use 600+
        const base = c === 'accent' ? 600 : 500;
        return {
          bg: `${c}.${base}`,
          color: 'white',
          _hover: {
            bg: `${c}.${base + 100}`,
            boxShadow: '0 8px 20px -6px rgba(107, 110, 242, 0.45)',
            _disabled: { bg: `${c}.${base}` },
          },
          _active: { bg: `${c}.${base + 200}` },
        };
      },
      // Alias used across the app; identical to ink solid.
      primary: (props: Record<string, any>) => ({
        bg: mode('brand.500', 'neutral.0')(props),
        color: mode('white', 'brand.700')(props),
        _hover: {
          bg: mode('brand.600', 'neutral.100')(props),
          boxShadow: '0 8px 20px -6px rgba(107, 110, 242, 0.45)',
          _disabled: { bg: mode('brand.500', 'neutral.0')(props) },
        },
        _active: { bg: mode('brand.700', 'neutral.200')(props) },
      }),
      // Iris subtle — secondary emphasis.
      secondary: (props: Record<string, any>) => ({
        bg: mode('accent.50', 'rgba(107, 110, 242, 0.16)')(props),
        color: mode('accent.700', 'accent.200')(props),
        _hover: {
          bg: mode('accent.100', 'rgba(107, 110, 242, 0.24)')(props),
        },
        _active: {
          bg: mode('accent.200', 'rgba(107, 110, 242, 0.32)')(props),
        },
      }),
      success: {
        bg: 'success.500',
        color: 'white',
        _hover: {
          bg: 'success.600',
          boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.45)',
          _disabled: { bg: 'success.500' },
        },
        _active: { bg: 'success.700' },
      },
      outline: (props: Record<string, any>) => ({
        border: '1px solid',
        borderColor: mode('neutral.300', 'whiteAlpha.300')(props),
        color: 'text-primary',
        bg: 'transparent',
        _hover: {
          bg: 'interactive-hover',
          borderColor: mode('brand.400', 'whiteAlpha.400')(props),
        },
        _active: { bg: 'interactive-active' },
      }),
      'outline-secondary': (props: Record<string, any>) => ({
        border: '1px solid',
        borderColor: mode('accent.300', 'accent.700')(props),
        color: mode('accent.600', 'accent.300')(props),
        bg: 'transparent',
        _hover: {
          bg: mode('accent.50', 'rgba(107, 110, 242, 0.16)')(props),
          borderColor: mode('accent.500', 'accent.500')(props),
        },
        _active: {
          bg: mode('accent.100', 'rgba(107, 110, 242, 0.24)')(props),
        },
      }),
      ghost: {
        color: 'text-secondary',
        _hover: { bg: 'interactive-hover', color: 'text-primary' },
        _active: { bg: 'interactive-active' },
      },
      glass: (props: Record<string, any>) => ({
        bg: 'bg-glass',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid',
        borderColor: mode('rgba(9, 10, 15, 0.08)', 'whiteAlpha.200')(props),
        color: 'text-primary',
        _hover: {
          bg: mode('rgba(255, 255, 255, 0.9)', 'rgba(18, 20, 28, 0.9)')(props),
          boxShadow: 'md',
        },
      }),
      // Signature button — ink→iris gradient with an asymmetric corner.
      asymmetric: (_props: Record<string, any>) => ({
        bgGradient: 'linear(to-r, brand.500, accent.600)',
        color: 'white',
        borderRadius: '12px 12px 12px 2px',
        _hover: {
          boxShadow: '0 8px 24px rgba(107, 110, 242, 0.45)',
          transform: 'translateY(-1px)',
          _disabled: { transform: 'none' },
        },
        _active: { transform: 'translateY(0)' },
      }),
      link: {
        color: 'interactive-accent',
        fontWeight: 600,
        _hover: { textDecoration: 'underline', textUnderlineOffset: '3px' },
      },
    },
    defaultProps: {
      variant: 'solid',
      size: 'md',
      colorScheme: 'gray',
    },
  },

  Card: {
    baseStyle: (_props: Record<string, any>) => ({
      container: {
        bg: 'bg-surface',
        border: '1px solid',
        borderColor: 'border-subtle',
        borderRadius: 'xl',
        transition:
          'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease',
        _hover: { transform: 'translateY(-2px)', borderColor: 'border-default' },
      },
    }),
    variants: {
      elevated: {
        container: {
          boxShadow: 'sm',
          _hover: { boxShadow: 'lg', transform: 'translateY(-2px)' },
        },
      },
      outline: {
        container: { boxShadow: 'none', borderColor: 'border-default' },
      },
      filled: {
        container: { bg: 'chakra-subtle-bg', border: 'none' },
      },
      glass: {
        container: {
          bg: 'bg-glass',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'border-subtle',
          boxShadow: 'md',
        },
      },
      primary: {
        container: {
          borderLeft: '3px solid',
          borderLeftColor: 'accent.500',
          boxShadow: 'sm',
        },
      },
      secondary: {
        container: {
          borderLeft: '3px solid',
          borderLeftColor: 'signal.500',
          boxShadow: 'sm',
        },
      },
      success: {
        container: {
          borderLeft: '3px solid',
          borderLeftColor: 'success.500',
          boxShadow: 'sm',
        },
      },
    },
    defaultProps: {
      variant: 'elevated',
      size: 'md',
    },
  },

  Heading: {
    baseStyle: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      // No `color` here on purpose: body sets text-primary and everything
      // inherits. Hardcoding it breaks inverted surfaces (dark panels), where
      // the parent sets `color="white"`.
    },
  },

  Text: {
    baseStyle: {
      // Inherit — see Heading note above.
    },
  },

  Link: {
    baseStyle: {
      color: 'interactive-accent',
      fontWeight: 500,
      transition: 'color 0.15s ease',
      _hover: {
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
      },
      _focusVisible: focusRing,
    },
  },

  Input: {
    variants: {
      outline: (props: Record<string, any>) => ({
        field: {
          bg: 'bg-surface',
          borderColor: mode('neutral.300', 'whiteAlpha.300')(props),
          borderRadius: 'md',
          _hover: { borderColor: mode('neutral.400', 'whiteAlpha.400')(props) },
          _placeholder: { color: 'text-tertiary' },
          _focusVisible: {
            borderColor: 'accent.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)',
          },
        },
      }),
      glass: (props: Record<string, any>) => ({
        field: {
          bg: 'bg-glass',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: mode('rgba(9, 10, 15, 0.08)', 'whiteAlpha.200')(props),
          borderRadius: 'md',
          _placeholder: { color: 'text-tertiary' },
          _focusVisible: {
            borderColor: 'accent.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)',
          },
        },
      }),
    },
    defaultProps: { size: 'md', variant: 'outline' },
  },

  Select: {
    variants: {
      outline: (props: Record<string, any>) => ({
        field: {
          bg: 'bg-surface',
          borderColor: mode('neutral.300', 'whiteAlpha.300')(props),
          borderRadius: 'md',
          _hover: { borderColor: mode('neutral.400', 'whiteAlpha.400')(props) },
          _focusVisible: {
            borderColor: 'accent.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)',
          },
        },
      }),
    },
  },

  Textarea: {
    variants: {
      outline: (props: Record<string, any>) => ({
        bg: 'bg-surface',
        borderColor: mode('neutral.300', 'whiteAlpha.300')(props),
        borderRadius: 'md',
        _hover: { borderColor: mode('neutral.400', 'whiteAlpha.400')(props) },
        _placeholder: { color: 'text-tertiary' },
        _focusVisible: {
          borderColor: 'accent.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-accent-500)',
        },
      }),
    },
  },

  Badge: {
    baseStyle: {
      borderRadius: 'full',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0',
      px: 2.5,
      py: 0.5,
    },
    defaultProps: {
      variant: 'subtle',
      colorScheme: 'gray',
    },
  },

  Tag: {
    baseStyle: {
      container: { borderRadius: 'full', fontWeight: 500 },
    },
    defaultProps: {
      size: 'md',
      variant: 'subtle',
      colorScheme: 'gray',
    },
  },

  Menu: {
    baseStyle: {
      list: {
        bg: 'bg-elevated',
        border: '1px solid',
        borderColor: 'border-subtle',
        borderRadius: 'lg',
        boxShadow: 'lg',
        py: 2,
        overflow: 'hidden',
      },
      item: {
        bg: 'transparent',
        fontSize: 'sm',
        px: 3,
        py: 2,
        _hover: { bg: 'interactive-hover' },
        _focus: { bg: 'interactive-hover' },
      },
    },
  },

  Modal: {
    baseStyle: {
      dialog: {
        bg: 'bg-elevated',
        borderRadius: 'xl',
        boxShadow: 'xl',
      },
      header: { fontFamily: 'heading', letterSpacing: '-0.01em' },
    },
  },

  Drawer: {
    baseStyle: {
      dialog: { bg: 'bg-elevated' },
    },
    defaultProps: { size: 'xs' },
  },

  Popover: {
    baseStyle: {
      content: {
        bg: 'bg-elevated',
        border: '1px solid',
        borderColor: 'border-subtle',
        borderRadius: 'lg',
        boxShadow: 'lg',
        _focusVisible: { outline: 'none', boxShadow: 'lg' },
      },
    },
  },

  Tooltip: {
    baseStyle: {
      bg: 'brand.600',
      color: 'white',
      borderRadius: 'md',
      fontSize: 'xs',
      fontWeight: 500,
      px: 3,
      py: 1.5,
    },
  },

  Table: {
    variants: {
      simple: {
        th: {
          color: 'text-tertiary',
          fontFamily: 'body',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: 'xs',
          borderColor: 'border-subtle',
        },
        td: { borderColor: 'border-subtle' },
      },
    },
    defaultProps: { variant: 'simple', size: 'md', colorScheme: 'gray' },
  },

  Tabs: {
    variants: {
      line: {
        tab: {
          fontWeight: 500,
          color: 'text-secondary',
          _selected: { color: 'interactive-accent', borderColor: 'interactive-accent' },
          _hover: { color: 'text-primary' },
        },
      },
      // Chakra's default soft-rounded tab colour is gray.600, which measured
      // 2.59:1 on the dark surface. Drive it from semantic tokens instead.
      'soft-rounded': (props: Record<string, any>) => ({
        tab: {
          fontWeight: 600,
          borderRadius: 'full',
          color: 'text-secondary',
          _hover: { color: 'text-primary', bg: 'interactive-hover' },
          // Selected pill inverts the same way solid buttons do: ink-on-light in
          // light mode, light-on-ink in dark. (chakra-inverse-text alone gave
          // ink text on an ink pill in dark mode = 1.21:1.)
          _selected: {
            bg: mode('brand.500', 'neutral.0')(props),
            color: mode('white', 'brand.700')(props),
          },
        },
      }),
    },
    defaultProps: { size: 'md', variant: 'line', colorScheme: 'accent' },
  },

  FormLabel: {
    baseStyle: {
      fontSize: 'sm',
      fontWeight: 600,
      color: 'text-secondary',
      mb: 1.5,
    },
  },

  Checkbox: {
    defaultProps: { size: 'md', colorScheme: 'accent' },
  },

  Radio: {
    defaultProps: { size: 'md', colorScheme: 'accent' },
  },

  Switch: {
    defaultProps: { size: 'md', colorScheme: 'accent' },
  },

  Progress: {
    baseStyle: {
      track: { borderRadius: 'full' },
    },
    defaultProps: { size: 'md', colorScheme: 'accent' },
  },

  Slider: {
    defaultProps: { size: 'md', colorScheme: 'accent' },
  },

  Stepper: {
    defaultProps: { size: 'md', colorScheme: 'accent' },
  },

  Alert: {
    baseStyle: {
      container: { borderRadius: 'lg' },
    },
    defaultProps: { variant: 'subtle', colorScheme: 'blue' },
  },

  Divider: {
    baseStyle: { borderColor: 'border-subtle', opacity: 1 },
    defaultProps: { variant: 'solid' },
  },

  Skeleton: {
    defaultProps: {
      startColor: 'neutral.100',
      endColor: 'neutral.200',
    },
  },

  Stat: {
    baseStyle: {
      number: {
        fontFamily: 'heading',
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      label: { color: 'text-secondary', fontWeight: 500 },
    },
    defaultProps: { size: 'md' },
  },

  Container: {
    sizes: {
      sm: { maxW: '640px' },
      md: { maxW: '768px' },
      lg: { maxW: '1024px' },
      xl: { maxW: '1280px' },
      '2xl': { maxW: '1440px' },
      '3xl': { maxW: '1600px' },
      '4xl': { maxW: '1800px' },
      full: { maxW: '100%' },
      responsive: {
        maxW: { base: '100%', md: '90%', xl: '1280px' },
        px: { base: 4, md: 6, lg: 8 },
      },
    },
  },

  SkipLink: {
    baseStyle: {
      position: 'absolute',
      top: '-48px',
      left: 4,
      zIndex: 10000,
      bg: 'brand.600',
      color: 'signal.300',
      px: 4,
      py: 2,
      borderRadius: 'md',
      fontWeight: 600,
      transition: 'top 0.15s ease',
      _focus: { top: 4 },
    },
  },
};

const styles = {
  global: (props: Record<string, any>) => ({
    html: {
      bg: 'bg-base',
    },
    body: {
      bg: 'bg-base',
      color: 'text-primary',
      fontFeatureSettings: `'cv11', 'ss01'`,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    },
    '::selection': {
      bg: mode('accent.200', 'accent.700')(props),
      color: mode('brand.700', 'white')(props),
    },
    '*::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
    },
    '*::-webkit-scrollbar-track': {
      bg: 'transparent',
    },
    '*::-webkit-scrollbar-thumb': {
      bg: mode('rgba(9, 10, 15, 0.18)', 'rgba(255, 255, 255, 0.18)')(props),
      borderRadius: 'full',
      border: '2px solid transparent',
      backgroundClip: 'content-box',
    },
    '.full-width-site': {
      width: '100%',
    },
    '.skip-link': {
      position: 'absolute',
      top: '-48px',
      left: '16px',
      zIndex: 10000,
      background: 'var(--chakra-colors-brand-600)',
      color: 'var(--chakra-colors-signal-300)',
      padding: '8px 16px',
      borderRadius: '10px',
      fontWeight: 600,
      transition: 'top 0.15s ease',
    },
    '.skip-link:focus': {
      top: '16px',
    },
  }),
};

const config: ThemeConfig = {
  useSystemColorMode: true,
  initialColorMode: 'light',
  cssVarPrefix: 'chakra',
};

const semanticTokens = {
  colors: {
    'chakra-body-bg': { default: 'bg.base.light', _dark: 'bg.base.dark' },
    'chakra-body-text': { default: 'text.primary.light', _dark: 'text.primary.dark' },
    'chakra-border-color': { default: 'border-default', _dark: 'border-default' },
    'chakra-inverse-text': { default: 'white', _dark: 'brand.700' },
    'chakra-subtle-bg': { default: 'brand.50', _dark: 'whiteAlpha.100' },
    'chakra-subtle-text': { default: 'text.secondary.light', _dark: 'text.secondary.dark' },
    'chakra-placeholder-color': { default: 'text.tertiary.light', _dark: 'text.tertiary.dark' },

    'bg-base': { default: '#FAFAFB', _dark: '#0B0C11' },
    'bg-surface': { default: 'bg.surface.light', _dark: 'bg.surface.dark' },
    'bg-elevated': { default: 'bg.elevated.light', _dark: 'bg.elevated.dark' },
    'bg-glass': { default: 'bg.glass.light', _dark: 'bg.glass.dark' },
    'bg-surface-raised': { default: 'bg.raised.light', _dark: 'bg.raised.dark' },
    'bg-surface-overlay': { default: 'bg.overlay.light', _dark: 'bg.overlay.dark' },

    'text-primary': { default: 'text.primary.light', _dark: 'text.primary.dark' },
    'text-secondary': { default: 'text.secondary.light', _dark: 'text.secondary.dark' },
    'text-tertiary': { default: 'text.tertiary.light', _dark: 'text.tertiary.dark' },

    'interactive-accent': { default: 'accent.600', _dark: 'accent.300' },
    // red.500 as body text measured 3.95:1 (light) / 4.3:1 (dark) — under AA.
    'text-error': { default: 'red.600', _dark: 'red.300' },
    'interactive-hover': { default: 'interactive.hover.light', _dark: 'interactive.hover.dark' },

    'border-subtle': {
      default: 'rgba(9, 10, 15, 0.08)',
      _dark: 'rgba(255, 255, 255, 0.08)',
    },
    'border-default': {
      default: 'rgba(9, 10, 15, 0.14)',
      _dark: 'rgba(255, 255, 255, 0.14)',
    },
    'interactive-active': {
      default: 'interactive.active.light',
      _dark: 'interactive.active.dark',
    },
  },
};

export const theme = extendTheme({
  colors,
  fonts,
  radii,
  shadows,
  components,
  styles,
  config,
  semanticTokens,
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
