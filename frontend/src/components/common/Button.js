import React, { useState } from 'react';
import { colors, typography, spacing, transitions, borderRadius } from '../../styles/theme';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  icon,
  fullWidth = false,
  disabled = false,
  onClick,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const getVariantStyles = () => {
    const variants = {
      primary: {
        backgroundColor: isActive ? colors.primary.dark : isHovered ? colors.primary.hover : colors.primary.main,
        color: colors.primary.contrast,
        border: 'none',
      },
      secondary: {
        backgroundColor: isActive ? colors.secondary.dark : isHovered ? colors.secondary.hover : colors.secondary.main,
        color: colors.secondary.contrast,
        border: 'none',
      },
      accent: {
        backgroundColor: isActive ? colors.accent.dark : isHovered ? colors.accent.hover : colors.accent.main,
        color: colors.accent.contrast,
        border: 'none',
      },
      outline: {
        backgroundColor: 'transparent',
        color: isHovered ? colors.primary.hover : colors.primary.main,
        border: `2px solid ${isHovered ? colors.primary.hover : colors.primary.main}`,
      },
      ghost: {
        backgroundColor: isHovered ? colors.gray[100] : 'transparent',
        color: colors.gray[800],
        border: 'none',
      },
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    const sizes = {
      small: {
        padding: `${spacing.xs} ${spacing.sm}`,
        fontSize: '0.875rem',
      },
      medium: {
        padding: `${spacing.sm} ${spacing.md}`,
        fontSize: '1rem',
      },
      large: {
        padding: `${spacing.md} ${spacing.lg}`,
        fontSize: '1.125rem',
      },
    };
    return sizes[size] || sizes.medium;
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.medium,
    fontWeight: typography.button.fontWeight,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: transitions.default,
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    transform: isActive ? 'scale(0.98)' : 'scale(1)',
    outline: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...getSizeStyles(),
    ...getVariantStyles(),
  };

  const rippleEffect = {
    '&::after': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      background: 'rgba(255, 255, 255, 0.2)',
      opacity: isActive ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }
  };

  return (
    <button
      {...props}
      style={{ ...baseStyles, ...rippleEffect, ...props.style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon && <i className={icon} style={{ fontSize: '1em' }} />}
      {children}
    </button>
  );
};
