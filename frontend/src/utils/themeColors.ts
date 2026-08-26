// Unified theme color utilities
// Use these instead of hardcoded rgba values for consistency

export const themeColors = {
  // Brand colors with alpha variants (Ink)
  brand: {
    primary: '#232838',
    primaryAlpha: {
      5: 'rgba(35, 40, 56, 0.05)',
      8: 'rgba(35, 40, 56, 0.08)',
      10: 'rgba(35, 40, 56, 0.1)',
      12: 'rgba(35, 40, 56, 0.12)',
      20: 'rgba(35, 40, 56, 0.2)',
      25: 'rgba(35, 40, 56, 0.25)',
    },
  },

  // Accent colors (Iris)
  accent: {
    primary: '#6B6EF2',
    primaryAlpha: {
      5: 'rgba(107, 110, 242, 0.05)',
      8: 'rgba(107, 110, 242, 0.08)',
      10: 'rgba(107, 110, 242, 0.1)',
      12: 'rgba(107, 110, 242, 0.12)',
      20: 'rgba(107, 110, 242, 0.2)',
      25: 'rgba(107, 110, 242, 0.25)',
    },
  },

  // Success colors (Green — formerly brand green)
  success: {
    primary: '#10B981',
    primaryAlpha: {
      5: 'rgba(16, 185, 129, 0.05)',
      8: 'rgba(16, 185, 129, 0.08)',
      10: 'rgba(16, 185, 129, 0.1)',
      12: 'rgba(16, 185, 129, 0.12)',
      20: 'rgba(16, 185, 129, 0.2)',
      25: 'rgba(16, 185, 129, 0.25)',
    },
  },

  // Secondary colors (gray)
  secondary: {
    primary: '#6B7280',
    primaryAlpha: {
      5: 'rgba(107, 114, 128, 0.05)',
      8: 'rgba(107, 114, 128, 0.08)',
      10: 'rgba(107, 114, 128, 0.1)',
      12: 'rgba(107, 114, 128, 0.12)',
      20: 'rgba(107, 114, 128, 0.2)',
    },
  },

  // Support colors (blue)
  support: {
    primary: '#3B82F6',
    primaryAlpha: {
      5: 'rgba(59, 130, 246, 0.05)',
      8: 'rgba(59, 130, 246, 0.08)',
      10: 'rgba(59, 130, 246, 0.1)',
      12: 'rgba(59, 130, 246, 0.12)',
      20: 'rgba(59, 130, 246, 0.2)',
    },
  },

  // Startup context colors (orange)
  startup: {
    primary: '#FF9500',
    primaryAlpha: {
      5: 'rgba(255, 149, 0, 0.05)',
      8: 'rgba(255, 149, 0, 0.08)',
      10: 'rgba(255, 149, 0, 0.1)',
      12: 'rgba(255, 149, 0, 0.12)',
    },
  },

  // Investor context colors (green)
  investor: {
    primary: '#52C41A',
    primaryAlpha: {
      5: 'rgba(82, 196, 26, 0.05)',
      8: 'rgba(82, 196, 26, 0.08)',
      10: 'rgba(82, 196, 26, 0.1)',
      12: 'rgba(82, 196, 26, 0.12)',
    },
  },

  // Social media brand colors
  social: {
    linkedin: '#0077B5',
    facebook: '#1877F2',
    github: '#333333',
    google: '#4285F4',
  },

  // Semantic colors
  semantic: {
    white: '#FFFFFF',
    whiteAlpha: {
      10: 'rgba(255, 255, 255, 0.1)',
      70: 'rgba(255, 255, 255, 0.7)',
      80: 'rgba(255, 255, 255, 0.8)',
      95: 'rgba(255, 255, 255, 0.95)',
    },
    black: '#000000',
    blackAlpha: {
      6: 'rgba(0, 0, 0, 0.06)',
      12: 'rgba(0, 0, 0, 0.12)',
      30: 'rgba(0, 0, 0, 0.3)',
      70: 'rgba(0, 0, 0, 0.7)',
    },
  },

  // Gradients
  gradients: {
    brand: 'linear-gradient(135deg, #232838 0%, #6B6EF2 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    secondary: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    support: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    brandAlpha: 'linear-gradient(135deg, rgba(27, 42, 74, 0.1) 0%, rgba(0, 191, 255, 0.05) 100%)',
    secondaryAlpha: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)',
    supportAlpha: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
    overlay: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
  },
}

// Utility functions for consistent color usage
export const getAlphaColor = (baseColor: string, alpha: number): string => {
  // Convert hex to rgba with alpha
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const getHoverColor = (variant: 'default' | 'startup' | 'investor' = 'default'): string => {
  switch (variant) {
    case 'startup':
      return themeColors.startup.primaryAlpha[8]
    case 'investor':
      return themeColors.investor.primaryAlpha[8]
    default:
      return themeColors.brand.primaryAlpha[8]
  }
}

export const getActiveColor = (variant: 'default' | 'startup' | 'investor' = 'default'): string => {
  switch (variant) {
    case 'startup':
      return themeColors.startup.primaryAlpha[12]
    case 'investor':
      return themeColors.investor.primaryAlpha[12]
    default:
      return themeColors.brand.primaryAlpha[12]
  }
}

export default themeColors
