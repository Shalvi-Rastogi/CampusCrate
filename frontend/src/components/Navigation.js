import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { colors, shadows, spacing, typography, borderRadius, transitions } from '../styles/theme';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || location.pathname.includes('/login') || location.pathname.includes('/register') || location.pathname.includes('/admin')) return null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <img 
            src="/lost-found-logo.png" 
            alt="Lost & Found"
            style={styles.brandLogo}
            onError={(e) => e.target.style.display = 'none'}
          />
          <span>Lost & Found</span>
        </Link>
        
        <div style={styles.links}>
          <Link 
            to="/dashboard/lost" 
            style={location.pathname === '/dashboard/lost' ? {...styles.link, ...styles.active} : styles.link}
          >
            <i className="fas fa-search" style={styles.icon}></i>
            Lost Items
          </Link>
          <Link 
            to="/dashboard/found"
            style={location.pathname === '/dashboard/found' ? {...styles.link, ...styles.active} : styles.link}
          >
            <i className="fas fa-box-open" style={styles.icon}></i>
            Found Items
          </Link>
          <Link 
            to="/post-lost"
            style={location.pathname === '/post-lost' ? {...styles.link, ...styles.active} : styles.link}
          >
            <i className="fas fa-exclamation-circle" style={styles.icon}></i>
            Report Lost
          </Link>
          <Link 
            to="/post-found"
            style={location.pathname === '/post-found' ? {...styles.link, ...styles.active} : styles.link}
          >
            <i className="fas fa-hand-holding" style={styles.icon}></i>
            Report Found
          </Link>
        </div>

        <div style={styles.profile} onClick={() => setMenuOpen(!menuOpen)}>
          <img 
            src={user.photoURL || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="lightgray"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E'} 
            alt={user.displayName} 
            style={styles.avatar}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="lightgray"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E';
            }}
          />
          <span style={styles.userName}>{user.displayName}</span>
          <i className={`fas fa-chevron-${menuOpen ? 'up' : 'down'}`} style={styles.chevron}></i>
          
          {menuOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownItem} onClick={handleLogout}>
                <i className="fas fa-sign-out-alt" style={styles.dropdownIcon}></i>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: colors.white,
    boxShadow: shadows.small,
    padding: `${spacing.md} 0`,
    marginBottom: spacing.xl,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${spacing.md}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: colors.primary,
    textDecoration: 'none',
    transition: transitions.default,
    '&:hover': {
      color: colors.primary,
    },
  },
  brandLogo: {
    width: '32px',
    height: '32px',
  },
  links: {
    display: 'flex',
    gap: spacing.md,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    color: colors.gray[700],
    textDecoration: 'none',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.medium,
    transition: transitions.default,
    fontSize: typography.body2.fontSize,
    '&:hover': {
      backgroundColor: colors.gray[50],
      color: colors.primary,
    },
  },
  active: {
    backgroundColor: `${colors.primary}15`,
    color: colors.primary,
    fontWeight: 'bold',
  },
  icon: {
    fontSize: '16px',
  },
  profile: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.medium,
    cursor: 'pointer',
    transition: transitions.default,
    '&:hover': {
      backgroundColor: colors.gray[50],
    },
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: borderRadius.round,
    border: `2px solid ${colors.primary}`,
  },
  userName: {
    color: colors.gray[800],
    fontSize: typography.body2.fontSize,
  },
  chevron: {
    color: colors.gray[600],
    fontSize: '12px',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    boxShadow: shadows.large,
    minWidth: '200px',
    padding: `${spacing.xs} 0`,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.md}`,
    color: colors.gray[800],
    fontSize: typography.body2.fontSize,
    cursor: 'pointer',
    transition: transitions.default,
    '&:hover': {
      backgroundColor: colors.gray[50],
    },
  },
  dropdownIcon: {
    width: '16px',
    color: colors.gray[600],
  },
  divider: {
    height: '1px',
    backgroundColor: colors.gray[200],
    margin: `${spacing.xs} 0`,
  },
};
