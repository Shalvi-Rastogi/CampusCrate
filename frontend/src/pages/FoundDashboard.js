import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, EmptyState } from '../components/common';
import { colors, spacing, typography } from '../styles/theme';
import { getImageUrl } from '../utils/imageUrl';

export default function FoundDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/items?type=found');
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching found items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Found Items</h1>
          <p style={styles.subtitle}>Browse through items found on campus</p>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.viewToggle}>
            <Button
              variant={view === 'grid' ? 'primary' : 'ghost'}
              icon="fas fa-th-large"
              onClick={() => setView('grid')}
            />
            <Button
              variant={view === 'list' ? 'primary' : 'ghost'}
              icon="fas fa-list"
              onClick={() => setView('list')}
            />
          </div>
          <Link to="/post-found" style={styles.reportButton}>
            <Button 
              icon="fas fa-plus" 
              style={styles.reportBtnStyle}
            >
              <span style={{ marginLeft: '8px' }}>Report Found Item</span>
            </Button>
          </Link>
        </div>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <i className="fas fa-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Search found items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.categories}>
          {['all', 'electronics', 'clothing', 'accessories', 'documents', 'other'].map(category => (
            <Button
              key={category}
              variant={filter === category ? 'primary' : 'ghost'}
              onClick={() => setFilter(category)}
              style={styles.categoryButton}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon="fas fa-box-open"
          title="No items found"
          description="Try adjusting your search or filters, or report a new found item."
          action={
            <Link to="/post-found" style={styles.emptyStateButton}>
              <Button 
                style={styles.emptyStateBtnStyle}
              >
                <span style={{ marginLeft: '8px', fontWeight: '600' }}>Report Found Item</span>
              </Button>
            </Link>
          }
        />
      ) : (
        <div style={styles.grid}>
          {filteredItems.map(item => (
            <Link to={`/item/${item._id}`} key={item._id} style={{ textDecoration: 'none' }}>
              <div style={styles.card}>
                <div style={styles.imageContainer}>
                  <img 
                    src={getImageUrl(item.photoUrl) || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={item.title}
                    style={styles.image}
                  />
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.title}>{item.title}</h3>
                  <p style={styles.description}>{item.description}</p>
                  
                  <div style={styles.tags}>
                    <span style={styles.tag}>{item.category}</span>
                    {item.tags?.map(tag => (
                      <span key={tag} style={styles.tag}>{tag}</span>
                    ))}
                  </div>

                  <div style={styles.meta}>
                    <div>
                      <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: 'rgb(147, 88, 254)' }}></i>
                      {item.location}
                    </div>
                    <div>
                      <i className="far fa-calendar-alt" style={{ marginRight: '8px', color: 'rgb(147, 88, 254)' }}></i>
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

// Keyframe animation for the background effect
const keyframes = {
  '@keyframes pulse': {
    '0%': {
      opacity: 0.5,
      transform: 'scale(1)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1.2)',
    },
  },
};

const styles = {
  ...keyframes,
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(147, 88, 254, 0.15) 50%, rgba(126, 34, 206, 0.2) 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at top right, rgba(147, 88, 254, 0.25) 0%, transparent 60%)',
      pointerEvents: 'none',
      animation: 'pulse 8s infinite alternate',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at bottom left, rgba(167, 139, 250, 0.25) 0%, transparent 60%)',
      pointerEvents: 'none',
      animation: 'pulse 8s infinite alternate-reverse',
    },
  },
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '24px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(147, 88, 254, 0.1)',
    boxShadow: '0 8px 32px rgba(147, 88, 254, 0.1)',
  },
  header: {
    marginBottom: '24px',
    padding: '24px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(147, 88, 254, 0.1)',
    boxShadow: '0 4px 16px rgba(147, 88, 254, 0.08)',
  },
  titleSection: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'rgb(147, 88, 254)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(55, 65, 81, 0.8)',
    marginBottom: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '16px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(147, 88, 254, 0.1)',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(147, 88, 254, 0.08)',
    border: '1px solid rgba(147, 88, 254, 0.1)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(147, 88, 254, 0.15)',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(147, 88, 254, 0.05) 100%)',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(147, 88, 254, 0.1)',
    borderTop: '4px solid rgba(147, 88, 254, 0.8)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyStateContainer: {
    textAlign: 'center',
    padding: '48px 20px',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '16px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(147, 88, 254, 0.1)',
    boxShadow: '0 4px 16px rgba(147, 88, 254, 0.08)',
  },
  emptyStateTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'rgb(147, 88, 254)',
    marginBottom: '12px',
  },
  emptyStateText: {
    fontSize: '1.1rem',
    color: 'rgba(55, 65, 81, 0.8)',
    marginBottom: '24px',
  },
  // Empty state button styles
  emptyStateButton: {
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '16px',
  },
  emptyStateBtnStyle: {
    background: 'rgba(147, 88, 254, 0.15)',
    color: 'rgb(147, 88, 254)',
    border: '1px solid rgba(147, 88, 254, 0.3)',
    padding: '10px 20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(147, 88, 254, 0.1)',
    transition: 'all 0.3s ease',
    fontSize: '1.1rem',
    fontWeight: '600',
    '&:hover': {
      background: 'rgba(147, 88, 254, 0.25)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(147, 88, 254, 0.2)',
      border: '1px solid rgba(147, 88, 254, 0.5)',
    }
  },

  reportButton: {
    textDecoration: 'none',
    marginLeft: '10px',
  },
  reportBtnStyle: {
    background: 'rgba(147, 88, 254, 0.15)',
    color: 'rgb(147, 88, 254)',
    border: '1px solid rgba(147, 88, 254, 0.3)',
    padding: '8px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(147, 88, 254, 0.1)',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    '&:hover': {
      background: 'rgba(147, 88, 254, 0.25)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(147, 88, 254, 0.2)',
      border: '1px solid rgba(147, 88, 254, 0.5)',
    }
  },
  // Main Container with enhanced gradient
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, rgba(147, 88, 254, 0.15) 0%, rgba(89, 195, 253, 0.12) 50%, rgba(147, 88, 254, 0.15) 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at top right, rgba(147, 88, 254, 0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at bottom left, rgba(89, 195, 253, 0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
  },
  container: {
    padding: `${spacing.xl} ${spacing.lg}`,
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at top right, rgba(147, 88, 254, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at bottom left, rgba(89, 195, 253, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '300px',
      background: 'linear-gradient(180deg, rgba(147, 88, 254, 0.1) 0%, transparent)',
      zIndex: 0,
      pointerEvents: 'none',
      transform: 'translateY(-50%)',
      filter: 'blur(50px)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '300px',
      background: 'linear-gradient(0deg, rgba(41, 207, 157, 0.1) 0%, transparent)',
      zIndex: 0,
      pointerEvents: 'none',
      transform: 'translateY(50%)',
      filter: 'blur(50px)',
    },
  },

  // Header Section with enhanced glass effect
  header: {
    marginBottom: spacing.xl,
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '24px',
    padding: `${spacing.xl} ${spacing.xxl}`,
    boxShadow: '0 8px 32px rgba(147, 88, 254, 0.15)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.lg,
  },

  titleSection: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60px',
      height: '4px',
      background: 'linear-gradient(90deg, rgb(147, 88, 254), rgb(89, 195, 253))',
      borderRadius: '2px',
    },
  },

  title: {
    ...typography.h1,
    background: 'linear-gradient(45deg, rgb(147, 88, 254), rgb(89, 195, 253), rgb(41, 207, 157))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '3.5rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    marginBottom: spacing.sm,
    position: 'relative',
    animation: 'gradientFlow 8s linear infinite',
  },

  subtitle: {
    color: 'rgb(100, 116, 139)',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    maxWidth: '600px',
    margin: '0 auto',
  },

  // Search and Filters
  filters: {
    marginBottom: spacing.xl,
    background: 'rgba(255, 255, 255, 0.9)',
    padding: spacing.xl,
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(147, 88, 254, 0.08)',
    backdropFilter: 'blur(10px)',
  },

  searchBox: {
    marginBottom: spacing.lg,
    position: 'relative',
  },

  searchIcon: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgb(147, 88, 254)',
    fontSize: '1.2rem',
    zIndex: 2,
  },

  searchInput: {
    width: '100%',
    padding: `${spacing.md} ${spacing.xxl} ${spacing.md} ${spacing.lg}`,
    fontSize: '1.1rem',
    color: 'rgb(51, 65, 85)',
    border: '2px solid rgba(147, 88, 254, 0.2)',
    borderRadius: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    '&:focus': {
      borderColor: 'rgb(147, 88, 254)',
      boxShadow: '0 0 0 4px rgba(147, 88, 254, 0.15)',
      backgroundColor: 'rgb(255, 255, 255)',
    },
    '&:hover': {
      borderColor: 'rgb(147, 88, 254)',
      backgroundColor: 'rgb(255, 255, 255)',
    },
    '&::placeholder': {
      color: 'rgba(100, 116, 139, 0.6)',
    },
  },

  categories: {
    display: 'flex',
    gap: spacing.sm,
    overflowX: 'auto',
    padding: spacing.md,
    '&::-webkit-scrollbar': {
      height: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(147, 88, 254, 0.1)',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(147, 88, 254, 0.2)',
      borderRadius: '3px',
      '&:hover': {
        background: 'rgba(147, 88, 254, 0.3)',
      },
    },
  },

  categoryButton: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    background: 'rgba(147, 88, 254, 0.1)',
    color: 'rgb(147, 88, 254)',
    border: '1px solid rgba(147, 88, 254, 0.2)',
    '&:hover': {
      background: 'rgba(147, 88, 254, 0.15)',
      transform: 'translateY(-1px)',
    },
    '&.active': {
      background: 'rgb(147, 88, 254)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(147, 88, 254, 0.3)',
    },
  },

  // Grid Layout with staggered animation
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: spacing.xl,
    padding: spacing.lg,
    position: 'relative',
    zIndex: 1,
    '& > *': {
      animation: 'fadeInUp 0.6s ease-out forwards',
      opacity: 0,
    },
    '& > *:nth-child(1)': { animationDelay: '0.1s' },
    '& > *:nth-child(2)': { animationDelay: '0.2s' },
    '& > *:nth-child(3)': { animationDelay: '0.3s' },
    '& > *:nth-child(4)': { animationDelay: '0.4s' },
    '& > *:nth-child(5)': { animationDelay: '0.5s' },
    '& > *:nth-child(6)': { animationDelay: '0.6s' },
  },

  // Enhanced Card Styles with glass morphism
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'perspective(1000px) rotateX(0deg)',
    '&:hover': {
      transform: 'perspective(1000px) rotateX(2deg) translateY(-5px)',
    },
  },

  gridCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(147, 88, 254, 0.12)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      boxShadow: '0 15px 40px rgba(147, 88, 254, 0.2)',
      borderColor: 'rgba(147, 88, 254, 0.4)',
      background: 'rgba(255, 255, 255, 0.95)',
    },
  },

  gridImageContainer: {
    height: '260px',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60%',
      background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)',
      pointerEvents: 'none',
    },
  },

  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },

  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.lg,
    gap: spacing.md,
  },

  itemTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'rgb(51, 65, 85)',
    marginBottom: spacing.xs,
    background: 'linear-gradient(45deg, rgb(147, 88, 254), rgb(89, 195, 253))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  description: {
    color: 'rgb(100, 116, 139)',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: spacing.md,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  itemDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: `${spacing.md} 0`,
    borderTop: '1px solid rgba(147, 88, 254, 0.1)',
    borderBottom: '1px solid rgba(147, 88, 254, 0.1)',
  },

  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: '0.9rem',
    color: 'rgb(71, 85, 105)',
    padding: `${spacing.xs} ${spacing.sm}`,
    background: 'rgba(147, 88, 254, 0.05)',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(147, 88, 254, 0.1)',
      transform: 'translateY(-1px)',
    },
  },

  icon: {
    color: 'rgb(147, 88, 254)',
    fontSize: '1rem',
  },

  tags: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },

  tag: {
    padding: `${spacing.xs} ${spacing.sm}`,
    backgroundColor: 'rgba(89, 195, 253, 0.1)',
    color: 'rgb(89, 195, 253)',
    borderRadius: '6px',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(89, 195, 253, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(89, 195, 253, 0.15)',
      transform: 'translateY(-1px)',
    },
  },

  // Loading State
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    gap: spacing.xl,
  },

  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(147, 88, 254, 0.1)',
    borderTop: '4px solid rgb(147, 88, 254)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 20px rgba(147, 88, 254, 0.2)',
  },

  loadingText: {
    color: 'rgb(147, 88, 254)',
    fontSize: '1.2rem',
    fontWeight: '500',
    textAlign: 'center',
    animation: 'pulse 2s infinite',
  },

  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },

  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },

  // Header Actions
  headerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  viewToggle: {
    display: 'flex',
    gap: spacing.sm,
    background: 'rgba(147, 88, 254, 0.1)',
    padding: spacing.xs,
    borderRadius: '12px',
  },
  // Main Container styles are defined above
  // Categories, Grid, and Card styles are defined above
  listCard: {
    display: 'flex',
    gap: spacing.xl,
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(52, 152, 219, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(46, 204, 113, 0.1)',
    padding: spacing.lg,
    '&:hover': {
      boxShadow: '0 12px 32px rgba(46, 204, 113, 0.15)',
      borderColor: 'rgba(46, 204, 113, 0.3)',
    },
  },
  gridImageContainer: {
    height: '240px',
    borderRadius: '20px 20px 0 0',
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: 'linear-gradient(180deg, rgba(147, 88, 254, 0.1) 0%, rgba(147, 88, 254, 0) 20%)',
      zIndex: 1,
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70%',
      background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
      pointerEvents: 'none',
      zIndex: 1,
    },
    '&:hover::before': {
      opacity: 1,
    },
  },
  listImageContainer: {
    width: '240px',
    borderRadius: '16px',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
    boxShadow: '0 8px 24px rgba(147, 88, 254, 0.12)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(45deg, rgba(147, 88, 254, 0.1), rgba(89, 195, 253, 0.1))',
      opacity: 0,
      transition: 'opacity 0.3s ease',
      zIndex: 1,
    },
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 12px 32px rgba(147, 88, 254, 0.2)',
      '&::before': {
        opacity: 1,
      },
    },
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    transformOrigin: 'center center',
    '&:hover': {
      transform: 'scale(1.08)',
    },
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.xl,
    gap: spacing.md,
    background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(147,88,254,0.03) 100%)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -spacing.md,
      left: 0,
      width: '40px',
      height: '2px',
      background: 'linear-gradient(90deg, rgba(147, 88, 254, 0.5), rgba(89, 195, 253, 0.5))',
      borderRadius: '1px',
    },
  },
  itemTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    background: 'linear-gradient(45deg, rgb(52, 152, 219), rgb(46, 204, 113))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: spacing.xs,
  },
  description: {
    color: 'rgb(52, 73, 94)',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: spacing.md,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  itemDetails: {
    display: 'flex',
    gap: spacing.lg,
    marginBottom: spacing.lg,
    padding: `${spacing.md} 0`,
    borderTop: '1px solid rgba(147, 88, 254, 0.1)',
    borderBottom: '1px solid rgba(147, 88, 254, 0.1)',
    position: 'relative',
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      width: '20%',
      height: '1px',
      background: 'linear-gradient(90deg, rgba(147, 88, 254, 0.5), transparent)',
    },
    '&::before': {
      top: 0,
      left: 0,
    },
    '&::after': {
      bottom: 0,
      right: 0,
      transform: 'rotate(180deg)',
    },
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    color: 'rgb(71, 85, 105)',
    fontSize: '0.95rem',
    padding: `${spacing.xs} ${spacing.md}`,
    background: 'rgba(147, 88, 254, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(147, 88, 254, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(4px)',
    '&:hover': {
      background: 'rgba(147, 88, 254, 0.08)',
      borderColor: 'rgba(147, 88, 254, 0.2)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(147, 88, 254, 0.08)',
    },
  },
  icon: {
    color: 'rgb(52, 152, 219)',
    width: '16px',
  },
  tags: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: 'auto',
    padding: `${spacing.md} 0`,
  },
  // Loading styles are defined above
};
