import React from 'react';
import { colors, shadows, spacing, borderRadius, transitions } from '../../styles/theme';

export const Card = ({ children, hoverable = false, ...props }) => {
  const style = {
    background: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    boxShadow: shadows.small,
    transition: transitions.default,
    ...(hoverable && {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: shadows.medium,
      },
    }),
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
};

export const Badge = ({ children, variant = 'primary', ...props }) => {
  const style = {
    display: 'inline-block',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.small,
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
      ...(variant === 'primary' && {
        backgroundColor: `${colors.primary.main}15`,
        color: colors.primary.main,
      }),
      ...(variant === 'success' && {
        backgroundColor: `${colors.secondary.main}15`,
        color: colors.secondary.main,
      }),
    ...(variant === 'warning' && {
      backgroundColor: '#FFEEBA',
      color: '#856404',
    }),
    ...props.style,
  };

  return (
    <span style={style} {...props}>
      {children}
    </span>
  );
};

export const Button = ({ children, variant = 'primary', icon, ...props }) => {
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.medium,
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: transitions.default,
    ...(variant === 'primary' && {
      backgroundColor: colors.primary.main,
      color: colors.primary.contrast,
      '&:hover': {
        backgroundColor: '#3367D6',
      },
    }),
    ...(variant === 'secondary' && {
      backgroundColor: colors.white,
      color: colors.primary.main,
      border: `1px solid ${colors.primary.main}`,
      '&:hover': {
        backgroundColor: `${colors.primary.main}10`,
      },
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
      color: colors.gray[700],
      '&:hover': {
        backgroundColor: colors.gray[100],
      },
    }),
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
    ...props.style,
  };

  return (
    <button style={style} {...props}>
      {icon && <i className={icon}></i>}
      {children}
    </button>
  );
};

export const EmptyState = ({ icon, title, description, action }) => {
  const styles = {
    container: {
      textAlign: 'center',
      padding: spacing.xl,
    },
    icon: {
      fontSize: '48px',
      color: colors.gray[400],
      marginBottom: spacing.md,
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: colors.gray[800],
      marginBottom: spacing.sm,
    },
    description: {
      color: colors.gray[600],
      marginBottom: spacing.lg,
    },
  };

  return (
    <div style={styles.container}>
      <i className={icon} style={styles.icon}></i>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
      {action}
    </div>
  );
};
