import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { Card, Button } from '../components/common';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, itemsRes, claimsRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users'),
        axios.get('/admin/items'),
        axios.get('/admin/claims'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setItems(itemsRes.data);
      setClaims(claimsRes.data);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load dashboard data';
      console.error('Dashboard error:', error);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    navigate('/admin/login');
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        alert('User deleted successfully');
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/admin/items/${itemId}`);
        setItems(items.filter(i => i._id !== itemId));
        alert('Item deleted successfully');
      } catch (error) {
        alert('Failed to delete item');
      }
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await axios.put(`/admin/users/${userId}/promote`);
      fetchData();
      alert('User promoted to admin');
    } catch (error) {
      alert('Failed to promote user');
    }
  };

  const handleDemoteUser = async (userId) => {
    try {
      await axios.put(`/admin/users/${userId}/demote`);
      fetchData();
      alert('User demoted');
    } catch (error) {
      alert('Failed to demote user');
    }
  };

  const handleApproveItem = async (itemId) => {
    try {
      await axios.put(`/admin/items/${itemId}/approve`);
      fetchData();
      alert('Item approved successfully');
    } catch (error) {
      alert('Failed to approve item');
    }
  };

  const handleApproveClaim = async (claimId) => {
    try {
      console.log('Approving claim:', claimId);
      const response = await axios.put(`/admin/claims/${claimId}/approve`);
      console.log('Approve response:', response.data);
      fetchData();
      alert('Claim approved successfully');
    } catch (error) {
      console.error('Approve error:', error.response?.data || error.message);
      alert('Failed to approve claim: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      console.log('Rejecting claim:', claimId);
      const response = await axios.put(`/admin/claims/${claimId}/reject`);
      console.log('Reject response:', response.data);
      fetchData();
      alert('Claim rejected');
    } catch (error) {
      console.error('Reject error:', error.response?.data || error.message);
      alert('Failed to reject claim: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['stats', 'users', 'items', 'claims'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              borderBottom: activeTab === tab ? `3px solid ${colors.primary.main}` : 'none',
              color: activeTab === tab ? colors.primary.main : colors.text.secondary,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        ...styles.content,
        background: activeTab === 'stats' 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(240, 147, 251, 0.05) 100%)'
          : activeTab === 'users'
          ? 'linear-gradient(135deg, rgba(79, 172, 254, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%)'
          : activeTab === 'items'
          ? 'linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(79, 172, 254, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(118, 75, 162, 0.05) 0%, rgba(118, 75, 162, 0.08) 100%)',
      }}>
        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <div style={styles.statLabel}>Total Users</div>
              <div style={styles.statValue}>{stats.totalUsers}</div>
            </Card>
            <Card style={styles.statCard}>
              <div style={styles.statLabel}>Total Items</div>
              <div style={styles.statValue}>{stats.totalItems}</div>
            </Card>
            <Card style={{...styles.statCard, borderLeft: `4px solid ${colors.warning.main}`}}>
              <div style={styles.statLabel}>Pending Items (Approval)</div>
              <div style={styles.statValue}>{stats.pendingItems || 0}</div>
            </Card>
            <Card style={styles.statCard}>
              <div style={styles.statLabel}>Active Lost Items</div>
              <div style={styles.statValue}>{stats.lostItems}</div>
            </Card>
            <Card style={styles.statCard}>
              <div style={styles.statLabel}>Active Found Items</div>
              <div style={styles.statValue}>{stats.foundItems}</div>
            </Card>
            <Card style={styles.statCard}>
              <div style={styles.statLabel}>Pending Claims</div>
              <div style={styles.statValue}>{stats.pendingClaims}</div>
            </Card>
            <Card style={styles.statCard}>
              <div style={styles.statLabel}>Resolved Claims</div>
              <div style={styles.statValue}>{stats.resolvedClaims}</div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card style={styles.tableCard}>
            <h2 style={styles.tableTitle}>Users Management</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Email</th>
                    <th style={styles.tableCell}>Name</th>
                    <th style={styles.tableCell}>Admin</th>
                    <th style={styles.tableCell}>Verified</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{user.email}</td>
                      <td style={styles.tableCell}>{user.displayName || '-'}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: user.isAdmin ? colors.success.light : colors.gray[50],
                          color: user.isAdmin ? '#fff' : colors.text.secondary,
                        }}>
                          {user.isAdmin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: user.isVerified ? colors.success.light : colors.warning.light,
                          color: '#fff',
                        }}>
                          {user.isVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          {!user.isAdmin ? (
                            <button
                              onClick={() => handlePromoteUser(user._id)}
                              style={{...styles.actionBtn, backgroundColor: colors.success.light, color: '#fff'}}
                              title="Promote to Admin"
                            >
                              ↑
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDemoteUser(user._id)}
                              style={{...styles.actionBtn, backgroundColor: colors.warning.light, color: '#fff'}}
                              title="Demote from Admin"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            style={{...styles.actionBtn, backgroundColor: colors.error.light, color: '#fff'}}
                            title="Delete User"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <Card style={styles.tableCard}>
            <h2 style={styles.tableTitle}>Items Management</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>Title</th>
                    <th style={styles.tableCell}>Type</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Owner</th>
                    <th style={styles.tableCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{item.title}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: item.type === 'lost' ? colors.error.light : colors.success.light,
                          color: '#fff',
                        }}>
                          {item.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: 
                            item.status === 'pending' ? colors.warning.light :
                            item.status === 'active' ? colors.success.light :
                            item.status === 'claimed' ? '#1976d2' :
                            colors.gray[400],
                          color: '#fff',
                        }}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.tableCell}>{item.owner?.displayName || item.owner?.email || '-'}</td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleApproveItem(item._id)}
                              style={{...styles.actionBtn, backgroundColor: colors.success.light, color: '#fff'}}
                              title="Approve Item"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            style={{...styles.actionBtn, backgroundColor: colors.error.light, color: '#fff'}}
                            title="Delete Item"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <Card style={styles.tableCard}>
            <h2 style={styles.tableTitle}>Claims Approval</h2>
            {claims.filter(c => c.status === 'pending').length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.tableCell}>Claimant</th>
                      <th style={styles.tableCell}>Item</th>
                      <th style={styles.tableCell}>Description</th>
                      <th style={styles.tableCell}>Status</th>
                      <th style={styles.tableCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.filter(c => c.status === 'pending').map(claim => (
                      <tr key={claim._id} style={styles.tableRow}>
                        <td style={styles.tableCell}>{claim.claimant?.displayName || claim.claimant?.email || '-'}</td>
                        <td style={styles.tableCell}>{claim.item?.title || '-'}</td>
                        <td style={styles.tableCell}>{claim.description.substring(0, 40)}...</td>
                        <td style={styles.tableCell}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: colors.warning.light,
                            color: '#fff',
                          }}>
                            PENDING
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.actionButtons}>
                            <button
                              onClick={() => handleApproveClaim(claim._id)}
                              style={{...styles.actionBtn, backgroundColor: colors.success.light, color: '#fff'}}
                              title="Approve Claim"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleRejectClaim(claim._id)}
                              style={{...styles.actionBtn, backgroundColor: colors.error.light, color: '#fff'}}
                              title="Reject Claim"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{padding: spacing.lg, textAlign: 'center', color: colors.text.secondary}}>
                No pending claims to review
              </div>
            )}
            
            {claims.filter(c => c.status !== 'pending').length > 0 && (
              <div style={{marginTop: spacing.lg}}>
                <h3 style={{...typography.h3, marginBottom: spacing.md}}>Processed Claims</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.tableCell}>Claimant</th>
                        <th style={styles.tableCell}>Item</th>
                        <th style={styles.tableCell}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.filter(c => c.status !== 'pending').map(claim => (
                        <tr key={claim._id} style={styles.tableRow}>
                          <td style={styles.tableCell}>{claim.claimant?.displayName || claim.claimant?.email || '-'}</td>
                          <td style={styles.tableCell}>{claim.item?.title || '-'}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.badge,
                              backgroundColor: 
                                claim.status === 'approved' ? colors.success.light :
                                colors.error.light,
                              color: '#fff',
                            }}>
                              {claim.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: spacing.xl,
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    color: colors.white,
    boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
  },
  title: {
    ...typography.h1,
    margin: 0,
    color: colors.white,
    fontWeight: 'bold',
  },
  tabs: {
    display: 'flex',
    borderBottom: `3px solid ${colors.primary.main}`,
    marginBottom: spacing.lg,
    gap: 0,
    background: 'linear-gradient(90deg, #ffffff 0%, rgba(102, 126, 234, 0.05) 100%)',
    borderRadius: `${borderRadius.medium} ${borderRadius.medium} 0 0`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  tab: {
    background: 'none',
    border: 'none',
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: typography.body1.fontSize,
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    color: colors.text.secondary,
    borderBottom: '3px solid transparent',
    marginBottom: '-2px',
  },
  content: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.medium,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(240, 147, 251, 0.08) 50%, rgba(79, 172, 254, 0.08) 100%)',
  },
  statCard: {
    padding: spacing.lg,
    textAlign: 'center',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
    borderRadius: borderRadius.medium,
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
    border: `2px solid rgba(102, 126, 234, 0.2)`,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: '12px',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '700',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: colors.primary.main,
    lineHeight: '1.2',
  },
  tableCard: {
    padding: spacing.lg,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
    borderRadius: borderRadius.medium,
    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.15)',
    border: `2px solid rgba(79, 172, 254, 0.2)`,
    marginBottom: spacing.xl,
  },
  tableTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
    marginTop: 0,
    color: colors.gray[900],
    fontWeight: '700',
    paddingBottom: spacing.md,
    borderBottom: `2px solid ${colors.gray[100]}`,
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: borderRadius.small,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    backgroundColor: colors.gray[50],
    borderBottom: `2px solid ${colors.gray[200]}`,
  },
  tableCell: {
    padding: spacing.md,
    textAlign: 'left',
    borderBottom: `1px solid ${colors.gray[200]}`,
    color: colors.text.primary,
    fontWeight: '500',
  },
  tableRow: {
    borderBottom: `1px solid ${colors.gray[200]}`,
    transition: 'background-color 0.2s ease',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: borderRadius.small,
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  actionButtons: {
    display: 'flex',
    gap: spacing.sm,
    alignItems: 'center',
  },
  actionBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: borderRadius.small,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: colors.background.default,
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: `4px solid ${colors.gray[200]}`,
    borderTop: `4px solid ${colors.primary.main}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};
