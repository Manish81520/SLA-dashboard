// Centralized CGI Design System Theme Tokens
// Source of truth for branding, colors, typography, spacing, shadows, and radii.

export const theme = {
  colors: {
    // Primary CGI Palette
    primary: '#2E1852',
    primaryLight: '#5136AA',
    primaryHover: '#664383',
    accentRed: '#CF2C43',

    // Neutral Palette
    white: '#FFFFFF',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#D4D2D6',
    gray400: '#B7B4B9',
    gray500: '#8B8698',
    gray600: '#666666',
    gray700: '#4A4A4A',
    gray900: '#242321',

    // Semantic Colors
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#3B82F6',
    error: '#CF2C43',

    // Background & Surface
    canvas: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceHeader: '#F5F5F5',
    border: '#EEEEEE',
    borderDark: '#D4D2D6',

    // Text Colors
    textPrimary: '#242321',
    textSecondary: '#666666',
    textMuted: '#8B8698',
    textLight: '#FFFFFF',
  },

  typography: {
    fontFamily: "'Roboto', sans-serif",

    scale: {
      displayLarge: '56px',
      displayMedium: '48px',
      h1: '40px',
      h2: '32px',
      h3: '28px',
      h4: '24px',
      title: '20px',
      bodyLarge: '18px',
      body: '16px',
      small: '14px',
      caption: '12px',
    },

    weights: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
  },

  radius: {
    none: '0px',
    small: '4px',
    input: '8px',
    button: '8px',
    card: '16px',
    pill: '9999px',
  },

  shadows: {
    card: '0 4px 20px rgba(46, 24, 82, 0.05)',
    cardHover: '0 8px 30px rgba(46, 24, 82, 0.08)',
    dropdown: '0 10px 25px rgba(46, 24, 82, 0.12)',
    subtle: '0 1px 3px rgba(36, 35, 33, 0.05)',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    huge: '48px',
  },

  transitions: {
    default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.15s ease-in-out',
  },

  zIndex: {
    base: 0,
    sticky: 10,
    header: 100,
    dropdown: 200,
    modal: 500,
    tooltip: 1000,
  },

  charts: [
    '#2E1852',
    '#5136AA',
    '#664383',
    '#CF2C43',
    '#22C55E',
    '#3B82F6',
    '#F59E0B',
    '#8B8698',
  ],
}

export default theme