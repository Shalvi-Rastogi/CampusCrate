import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, EmptyState } from '../components/common';
import { colors, spacing, typography } from '../styles/theme';
import { getImageUrl } from '../utils/imageUrl';

const LostDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/items?type=lost');
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching lost items:', error);
        setError(error.response?.data?.message || 'Failed to fetch lost items');
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

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Lost Items</h1>
          <p style={styles.subtitle}>Browse through items reported as lost on campus</p>
        </div>
        <Link to="/post-lost" style={styles.reportButton}>
          <Button 
            icon="fas fa-plus" 
            style={styles.reportBtnStyle}
          >
            <span style={{ marginLeft: '8px' }}>Report Lost Item</span>
          </Button>
        </Link>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <i className="fas fa-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Search lost items..."
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
          icon="fas fa-search"
          title="No items found"
          description="Try adjusting your search or filters, or report a new lost item."
          action={
            <Link to="/post-lost" style={styles.emptyStateButton}>
              <Button 
                style={styles.emptyStateBtnStyle}
              >
                <span style={{ marginLeft: '8px', fontWeight: '600' }}>Report Lost Item</span>
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
                      <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: 'rgb(236, 72, 153)' }}></i>
                      {item.location}
                    </div>
                    <div>
                      <i className="far fa-calendar-alt" style={{ marginRight: '8px', color: 'rgb(236, 72, 153)' }}></i>
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
};

const styles = {
  pageWrapper: {
    width: '100%',
    minHeight: '100vh',
    position: 'static',
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    position: 'static',
  },
  titleSection: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'rgb(31, 41, 55)',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, rgb(236, 72, 153), rgb(219, 39, 119))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgb(107, 114, 128)',
    fontWeight: '400',
    marginBottom: '24px',
  },
  
  // Header actions container
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
    zIndex: 2,
  },

  searchBox: {
    position: 'static',
    marginBottom: '16px',
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(236, 72, 153, 0.2)',
    background: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.95rem',
    color: 'rgb(55, 65, 81)',
    transition: 'all 0.3s ease',
    '&:focus': {
      outline: 'none',
      border: '1px solid rgba(236, 72, 153, 0.5)',
      boxShadow: '0 0 0 3px rgba(236, 72, 153, 0.1)',
    },
    '&::placeholder': {
      color: 'rgb(156, 163, 175)',
    },
  },
  searchIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgb(236, 72, 153)',
    fontSize: '1rem',
  },

  // Category buttons
  categories: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  categoryButton: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    background: 'rgba(236, 72, 153, 0.1)',
    color: 'rgb(236, 72, 153)',
    border: '1px solid transparent',
    '&:hover': {
      background: 'rgba(236, 72, 153, 0.15)',
      transform: 'translateY(-1px)',
    },
    '&.active': {
      background: 'rgb(236, 72, 153)',
      color: 'white',
    },
  },

  // Shimmer animation
  '@keyframes shimmer': {
    '0%': {
      transform: 'translateX(-100%)',
    },
    '100%': {
      transform: 'translateX(100%)',
    },
  },

  // Empty state button styles
  emptyStateButton: {
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '16px',
  },
  emptyStateBtnStyle: {
    background: 'rgba(236, 72, 153, 0.15)',
    color: 'rgb(236, 72, 153)',
    border: '1px solid rgba(236, 72, 153, 0.3)',
    padding: '10px 20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(236, 72, 153, 0.1)',
    transition: 'all 0.3s ease',
    fontSize: '1.1rem',
    '&:hover': {
      background: 'rgba(236, 72, 153, 0.25)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(236, 72, 153, 0.2)',
      border: '1px solid rgba(236, 72, 153, 0.5)',
    }
  },

  reportButton: {
    textDecoration: 'none',
    marginLeft: '10px',
  },
  reportBtnStyle: {
    background: 'rgba(236, 72, 153, 0.15)',
    color: 'rgb(236, 72, 153)',
    border: '1px solid rgba(236, 72, 153, 0.3)',
    padding: '8px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(236, 72, 153, 0.1)',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    '&:hover': {
      background: 'rgba(236, 72, 153, 0.25)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(236, 72, 153, 0.2)',
      border: '1px solid rgba(236, 72, 153, 0.5)',
    }
  },
  // Main Container with enhanced gradient
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(244, 114, 182, 0.12) 50%, rgba(236, 72, 153, 0.15) 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at bottom left, rgba(244, 114, 182, 0.2) 0%, transparent 70%)',
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
      background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at bottom left, rgba(244, 114, 182, 0.15) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '300px',
      background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.1) 0%, transparent)',
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
      background: 'linear-gradient(0deg, rgba(244, 114, 182, 0.1) 0%, transparent)',
      zIndex: 0,
      pointerEvents: 'none',
      transform: 'translateY(50%)',
      filter: 'blur(50px)',
    },
  },

  // Card Grid Layout
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },

  // Item Card with enhanced glass morphism
  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(236, 72, 153, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(236, 72, 153, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 48px rgba(236, 72, 153, 0.2)',
      background: 'rgba(255, 255, 255, 0.95)',
    },
  },

  // Card Image Container
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '16px',
    background: 'rgba(236, 72, 153, 0.05)',
  },

  // Card Image
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },

  // Card Content
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  // Card Title
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
    lineHeight: '1.4',
  },

  // Card Description
  description: {
    fontSize: '0.95rem',
    color: '#4a4a4a',
    lineHeight: '1.6',
    marginBottom: '16px',
  },

  // Tags Container
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },

  // Individual Tag
  tag: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
    background: 'rgba(236, 72, 153, 0.1)',
    color: 'rgb(236, 72, 153)',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(236, 72, 153, 0.15)',
      transform: 'translateY(-1px)',
    },
  },

  // Meta Information
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: '#666',
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid rgba(236, 72, 153, 0.1)',
  },

  // Header Section with enhanced glass effect
  header: {
    marginBottom: spacing.xl,
    position: 'relative',
    zIndex: 1,
    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(236, 72, 153, 0.08) 100%)',
    borderRadius: '24px',
    padding: `${spacing.xl} ${spacing.xxl}`,
    boxShadow: '0 8px 32px rgba(236, 72, 153, 0.15)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(236, 72, 153, 0.1)',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.05) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(236, 72, 153, 0.05) 100%)',
      animation: 'shimmer 2s infinite linear',
    },
    border: '1px solid rgba(255, 255, 255, 0.4)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    background: 'linear-gradient(45deg, rgb(236, 72, 153), rgb(244, 114, 182), rgb(251, 207, 232))',
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
  },
  filters: {
    marginBottom: spacing.xl,
    background: 'rgba(255, 255, 255, 0.9)',
    padding: spacing.xl,
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.08)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(236, 72, 153, 0.1)',
  },
  searchBox: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  searchIcon: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgb(236, 72, 153)',
    fontSize: '1.2rem',
    zIndex: 2,
  },
  searchInput: {
    width: '100%',
    padding: `${spacing.md} ${spacing.xxl}`,
    fontSize: '1.1rem',
    color: 'rgb(51, 65, 85)',
    border: '2px solid rgba(236, 72, 153, 0.2)',
    borderRadius: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    '&:focus': {
      borderColor: 'rgb(236, 72, 153)',
      boxShadow: '0 0 0 4px rgba(236, 72, 153, 0.15)',
      backgroundColor: 'rgb(255, 255, 255)',
    },
    '&:hover': {
      borderColor: 'rgb(236, 72, 153)',
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
      background: 'rgba(236, 72, 153, 0.1)',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(236, 72, 153, 0.2)',
      borderRadius: '3px',
      '&:hover': {
        background: 'rgba(236, 72, 153, 0.3)',
      },
    },
  },
  categoryButton: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    background: 'rgba(236, 72, 153, 0.1)',
    color: 'rgb(236, 72, 153)',
    border: '1px solid rgba(236, 72, 153, 0.2)',
    whiteSpace: 'nowrap',
    '&:hover': {
      background: 'rgba(236, 72, 153, 0.15)',
      transform: 'translateY(-1px)',
    },
    '&.active': {
      background: 'rgb(236, 72, 153)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
    },
  },
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
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'perspective(1000px) rotateX(0deg) translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform',
    '&:hover': {
      transform: 'perspective(1000px) rotateX(2deg) translateY(-8px) translateZ(0)',
    },
  },
  itemCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(236, 72, 153, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
      opacity: 0,
      transition: 'opacity 0.5s ease',
    },
    '&:hover': {
      boxShadow: '0 20px 40px rgba(236, 72, 153, 0.25), inset 0 0 0 1px rgba(236, 72, 153, 0.2)',
      borderColor: 'rgba(236, 72, 153, 0.4)',
      background: 'rgba(255, 255, 255, 0.9)',
      transform: 'translateZ(0)',
      '&::before': {
        opacity: 1,
      },
    },
  },
  imageContainer: {
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
      background: 'linear-gradient(180deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0) 20%)',
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
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
    background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(236,72,153,0.03) 100%)',
  },
  itemTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    background: 'linear-gradient(45deg, rgb(236, 72, 153), rgb(244, 114, 182))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: spacing.sm,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -spacing.xs,
      left: 0,
      width: '40px',
      height: '2px',
      background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.5), rgba(244, 114, 182, 0.5))',
      borderRadius: '1px',
    },
  },
  description: {
    color: 'rgb(71, 85, 105)',
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
    padding: `${spacing.md} 0`,
    borderTop: '1px solid rgba(236, 72, 153, 0.1)',
    borderBottom: '1px solid rgba(236, 72, 153, 0.1)',
    position: 'relative',
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      width: '20%',
      height: '1px',
      background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.5), transparent)',
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
    marginBottom: spacing.md,
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    color: 'rgb(71, 85, 105)',
    fontSize: '0.95rem',
    padding: `${spacing.xs} ${spacing.md}`,
    background: 'rgba(236, 72, 153, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(236, 72, 153, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(4px)',
    '&:hover': {
      background: 'rgba(236, 72, 153, 0.08)',
      borderColor: 'rgba(236, 72, 153, 0.2)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.08)',
    },
  },
  icon: {
    color: 'rgb(236, 72, 153)',
    fontSize: '1rem',
  },
  tags: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.md,
    '& .MuiBadge-root': {
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
      },
    },
  },
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
    border: '4px solid rgba(236, 72, 153, 0.1)',
    borderTop: '4px solid rgb(236, 72, 153)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  '@keyframes fadeInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  '@keyframes gradientFlow': {
    '0%': {
      backgroundPosition: '0% 50%',
    },
    '50%': {
      backgroundPosition: '100% 50%',
    },
    '100%': {
      backgroundPosition: '0% 50%',
    },
  },
};

export default LostDashboard;
