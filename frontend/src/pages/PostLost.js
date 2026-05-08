import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/common';
import { colors, spacing, typography, transitions } from '../styles/theme';

export default function PostLost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    date: '',
    location: '',
    tags: '',
    photoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photoUrl: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!form.category) {
      setError('Please select a category');
      return false;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!form.date) {
      setError('Date is required');
      return false;
    }
    if (!form.location.trim()) {
      setError('Location is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Append text fields
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('category', form.category);
      formData.append('location', form.location.trim());
      formData.append('date', form.date);
      formData.append('type', 'lost');
      
      // Append tags as JSON array
      if (form.tags) {
        const tagsArray = form.tags.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        formData.append('tags', JSON.stringify(tagsArray));
      }
      
      // Append photo file if present
      if (form.photoUrl) {
        formData.append('photo', form.photoUrl);
      }
      
      const response = await axios.post('/items', formData);
      navigate('/dashboard/lost');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to post item. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
        <h1 style={styles.title}>Report Lost Item</h1>
        <p style={styles.subtitle}>Please provide as much detail as possible to help others identify your item</p>
      </div>
      
      <Card style={styles.formCard}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner} />
            <p style={styles.loadingText}>Submitting your report...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>
              <i className="fas fa-info-circle" style={styles.sectionIcon}></i>
              Basic Information
            </h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="What did you lose?"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="documents">Documents</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date Lost</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Where did you last see it?"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>
              <i className="fas fa-list-alt" style={styles.sectionIcon}></i>
              Item Details
            </h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the item (color, brand, condition, etc.)"
                style={{ ...styles.input, minHeight: '100px' }}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Add relevant tags separated by commas (e.g., blue, leather, nike)"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Photo</label>
              <div style={styles.fileUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.querySelector('input[type="file"]').click()}
                >
                  Choose Photo
                </Button>
                <span style={styles.fileHint}>Max size: 5MB</span>
              </div>
              {preview && (
                <div style={styles.imagePreview}>
                  <img src={preview} alt="Preview" style={styles.previewImage} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setPreview(null);
                      setForm({ ...form, photoUrl: '' });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div style={styles.formActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard/lost')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Lost Item'}
            </Button>
          </div>
          </form>
        )}
      </Card>
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
    background: 'linear-gradient(135deg, rgba(249, 168, 212, 0.15) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(219, 39, 119, 0.15) 100%)',
    padding: `${spacing.xl} 0`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: 'radial-gradient(circle at top right, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: 'radial-gradient(circle at bottom left, rgba(249, 168, 212, 0.2) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
  },
  container: {
    padding: spacing.xl,
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    background: 'linear-gradient(to bottom, rgba(66, 133, 244, 0.05), rgba(52, 168, 83, 0.05))',
    minHeight: '100vh',
  },
  header: {
    marginBottom: spacing.xl,
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease-in-out',
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: spacing.xs,
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    color: colors.gray[700],
    fontSize: typography.body1.fontSize,
    maxWidth: '600px',
    margin: '0 auto',
  },
  formCard: {
    padding: spacing.xl,
    background: colors.white,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    borderRadius: '16px',
    animation: 'slideUp 0.5s ease-out',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(66, 133, 244, 0.03)',
    borderRadius: '12px',
    border: `1px solid ${colors.primary.light}`,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary.main,
    marginBottom: spacing.md,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    '&::before': {
      content: '""',
      width: '4px',
      height: '24px',
      backgroundColor: colors.primary.main,
      borderRadius: '2px',
    },
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
  input: {
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: '12px',
    border: `2px solid ${colors.gray[200]}`,
    fontSize: typography.body1.fontSize,
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: colors.gray[50],
    '&:focus': {
      borderColor: colors.primary.main,
      boxShadow: `0 0 0 4px ${colors.primary.light}`,
      backgroundColor: colors.white,
    },
    '&:hover': {
      borderColor: colors.primary.light,
      backgroundColor: colors.white,
    },
  },
  fileUpload: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  fileInput: {
    display: 'none',
  },
  fileHint: {
    color: colors.gray[500],
    fontSize: typography.body2.fontSize,
  },
  imagePreview: {
    marginTop: spacing.sm,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  previewImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: `1px solid ${colors.gray[200]}`,
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  error: {
    backgroundColor: colors.error.light + '20',
    color: colors.error.main,
    padding: spacing.md,
    borderRadius: '8px',
    fontSize: typography.body2.fontSize,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    marginRight: spacing.sm,
    color: colors.primary.main,
  },
};

