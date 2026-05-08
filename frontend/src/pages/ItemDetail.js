import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { Card, Button, Badge } from '../components/common';
import { colors, spacing, typography, transitions } from '../styles/theme';
import { getImageUrl } from '../utils/imageUrl';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimForm, setClaimForm] = useState({ message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`/items/${id}`)
      .then(res => setItem(res.data))
      .catch(err => {
        alert('Failed to load item details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/claims', {
        itemId: id,
        description: claimForm.message
      });
      alert('Claim submitted successfully!');
      navigate('/dashboard/' + item.type);
    } catch (error) {
      alert('Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={styles.container}>
        <Card style={styles.emptyCard}>
          <h2 style={styles.emptyTitle}>Item Not Found</h2>
          <p style={styles.emptyText}>This item might have been removed or doesn't exist.</p>
          <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = () => {
    switch (item.status) {
      case 'active':
        return 'success';
      case 'resolved':
        return 'primary';
      case 'closed':
        return 'secondary';
      default:
        return 'warning';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div style={styles.breadcrumbs}>
            <Button variant="ghost" onClick={() => navigate(-1)} icon="fas fa-arrow-left">
              Back to {item.type === 'lost' ? 'Lost' : 'Found'} Items
            </Button>
          </div>
          <h1 style={styles.title}>{item.title}</h1>
          <div style={styles.titleMeta}>
            <Badge variant={item.type === 'lost' ? 'error' : 'success'}>
              {item.type.toUpperCase()}
            </Badge>
            <Badge variant={getStatusBadgeVariant()}>
              {item.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.mainContent}>
          <Card style={styles.imageCard}>
            {item.photoUrl ? (
              <img src={getImageUrl(item.photoUrl)} alt={item.title} style={styles.image} />
            ) : (
              <div style={styles.noImage}>
                <i className="fas fa-image" style={styles.noImageIcon}></i>
                <p>No image available</p>
              </div>
            )}
          </Card>

          <Card style={styles.detailsCard}>
            <h3 style={styles.sectionTitle}>Item Details</h3>
            
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Category</span>
                <span style={styles.detailValue}>{item.category}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Location</span>
                <span style={styles.detailValue}>{item.location}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Date</span>
                <span style={styles.detailValue}>
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Description</span>
                <p style={styles.description}>{item.description}</p>
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Tags</span>
                  <div style={styles.tags}>
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="ghost">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {item.type === 'lost' && item.status === 'active' && (
          <Card style={styles.claimCard}>
            <div style={styles.claimHeader}>
              <h3 style={styles.claimTitle}>Found this item?</h3>
              <p style={styles.claimSubtitle}>Help return this item to its owner</p>
            </div>

            <form onSubmit={handleSubmitClaim} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Message to the owner</label>
                <textarea
                  value={claimForm.message}
                  onChange={e => setClaimForm({ ...claimForm, message: e.target.value })}
                  placeholder="Describe where and when you found it, and any identifying details that would help verify your claim..."
                  style={styles.textarea}
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                style={styles.submitButton}
              >
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: spacing.xl,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: spacing.xl,
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  breadcrumbs: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  titleMeta: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: spacing.xl,
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  },
  imageCard: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
  },
  noImage: {
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    color: colors.gray[400],
  },
  noImageIcon: {
    fontSize: '48px',
    marginBottom: spacing.sm,
  },
  detailsCard: {
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray[900],
    marginBottom: spacing.lg,
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.gray[600],
    fontSize: typography.body2.fontSize,
    fontWeight: '500',
  },
  detailValue: {
    color: colors.gray[900],
    fontSize: typography.body1.fontSize,
  },
  description: {
    color: colors.gray[900],
    fontSize: typography.body1.fontSize,
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  claimCard: {
    padding: spacing.xl,
    backgroundColor: colors.gray[50],
    border: `1px solid ${colors.gray[200]}`,
  },
  claimHeader: {
    marginBottom: spacing.lg,
  },
  claimTitle: {
    ...typography.h3,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  claimSubtitle: {
    color: colors.gray[600],
    fontSize: typography.body2.fontSize,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  label: {
    color: colors.gray[700],
    fontSize: typography.body2.fontSize,
    fontWeight: '500',
  },
  textarea: {
    padding: spacing.md,
    borderRadius: '8px',
    border: `1px solid ${colors.gray[300]}`,
    backgroundColor: colors.white,
    fontSize: typography.body1.fontSize,
    minHeight: '120px',
    resize: 'vertical',
    transition: transitions.default,
    outline: 'none',
    '&:focus': {
      borderColor: colors.primary.main,
      boxShadow: `0 0 0 2px ${colors.primary.main}25`,
    },
  },
  submitButton: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: `4px solid ${colors.gray[200]}`,
    borderTop: `4px solid ${colors.primary.main}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyCard: {
    padding: spacing.xl,
    textAlign: 'center',
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.gray[600],
    fontSize: typography.body1.fontSize,
    marginBottom: spacing.lg,
  },
  // Animation keyframes for the loading spinner
  spinner: {
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    }
  }
};
