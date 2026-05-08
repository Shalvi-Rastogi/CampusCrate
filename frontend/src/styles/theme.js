export const colors = {
  primary: {
    light: 'rgba(66, 133, 244, 0.85)',
    main: 'rgb(66, 133, 244)',
    dark: 'rgb(25, 103, 210)',
    hover: 'rgb(45, 118, 230)',
    contrast: '#FFFFFF'
  },
  secondary: {
    light: 'rgba(52, 168, 83, 0.85)',
    main: 'rgb(52, 168, 83)',
    dark: 'rgb(39, 143, 67)',
    hover: 'rgb(46, 155, 75)',
    contrast: '#FFFFFF'
  },
  accent: {
    light: 'rgba(251, 188, 5, 0.85)',
    main: 'rgb(251, 188, 5)',
    dark: 'rgb(230, 167, 0)',
    hover: 'rgb(240, 177, 3)',
    contrast: '#000000'
  },
  error: {
    light: 'rgba(234, 67, 53, 0.85)',
    main: 'rgb(234, 67, 53)',
    dark: 'rgb(198, 40, 40)',
    hover: 'rgb(211, 47, 47)',
    contrast: '#FFFFFF'
  },
  warning: {
    light: 'rgba(251, 188, 5, 0.85)',
    main: 'rgb(251, 188, 5)',
    dark: 'rgb(249, 168, 37)',
    hover: 'rgb(251, 192, 45)',
    contrast: '#000000'
  },
  success: {
    light: 'rgba(52, 168, 83, 0.85)',
    main: 'rgb(52, 168, 83)',
    dark: 'rgb(46, 125, 50)',
    hover: 'rgb(56, 142, 60)',
    contrast: '#FFFFFF'
  },
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124',
  },
  background: {
    default: '#F8F9FA',
    paper: '#FFFFFF',
    dark: '#202124',
  },
  text: {
    primary: '#202124',
    secondary: '#5F6368',
  }
};

export const shadows = {
  small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  medium: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
  large: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const typography = {
  h1: {
    fontSize: '32px',
    fontWeight: 'bold',
    lineHeight: '40px',
  },
  h2: {
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '32px',
  },
  h3: {
    fontSize: '20px',
    fontWeight: 'bold',
    lineHeight: '28px',
  },
  body1: {
    fontSize: '16px',
    lineHeight: '24px',
  },
  body2: {
    fontSize: '14px',
    lineHeight: '20px',
  },
  button: {
    fontSize: '14px',
    fontWeight: '500',
    textTransform: 'uppercase',
  }
};

export const borderRadius = {
  small: '4px',
  medium: '8px',
  large: '16px',
  round: '50%',
};

export const transitions = {
  default: 'all 0.3s ease',
  fast: 'all 0.15s ease',
  slow: 'all 0.45s ease',
};

export const commonStyles = {
  card: {
    background: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    boxShadow: shadows.small,
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: borderRadius.small,
      cursor: 'pointer',
      transition: transitions.default,
      '&:hover': {
        backgroundColor: '#3367D6',
      },
      '&:disabled': {
        opacity: 0.7,
        cursor: 'not-allowed',
      },
    },
    secondary: {
      backgroundColor: colors.white,
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: borderRadius.small,
      cursor: 'pointer',
      transition: transitions.default,
      '&:hover': {
        backgroundColor: colors.gray[50],
      },
    },
  },
  input: {
    base: {
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: borderRadius.small,
      border: `1px solid ${colors.gray[300]}`,
      fontSize: typography.body1.fontSize,
      transition: transitions.default,
      '&:focus': {
        outline: 'none',
        borderColor: colors.primary,
        boxShadow: `0 0 0 2px ${colors.primary}25`,
      },
    },
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${spacing.md}`,
  },
};
