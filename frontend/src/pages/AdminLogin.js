import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { colors, spacing, shadows, borderRadius } from '../styles/theme';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    if (user && userType === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Send login request to backend
      const response = await axios.post('/auth/admin-login', {
        email,
        password,
      });

      // Store JWT token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userType', 'admin');

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>ADMIN</div>
        <div style={styles.logo}>
          <img 
            src="/lost-found-logo.png" 
            alt="Lost & Found"
            style={styles.logoImage}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
        <h1 style={styles.title}>Admin Login</h1>
        <p style={styles.subtitle}>Lost & Found Management Portal</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter admin email"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading} 
            style={styles.button}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.text}>
          Don't have an account?{' '}
          <Link to="/admin/register" style={styles.link}>Register here</Link>
        </p>

        <p style={styles.text}>
          Regular User?{' '}
          <Link to="/login" style={styles.link}>User Login</Link>
        </p>

        <p style={styles.privacyText}>
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    position: "relative",
  },
  card: {
    background: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    boxShadow: shadows.large,
    maxWidth: "400px",
    width: "100%",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    backgroundColor: colors.primary.main,
    color: colors.white,
    padding: "6px 12px",
    borderRadius: borderRadius.medium,
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    marginBottom: spacing.md,
    marginTop: "16px",
  },
  logoImage: {
    height: "60px",
    width: "auto",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: colors.primary.main,
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: colors.gray[600],
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: colors.gray[800],
  },
  input: {
    padding: "10px 12px",
    borderRadius: borderRadius.medium,
    border: `1px solid ${colors.gray[300]}`,
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.3s",
    outline: "none",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: colors.primary.main,
    color: colors.white,
    border: "none",
    borderRadius: borderRadius.medium,
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: spacing.md,
    transition: "background-color 0.3s",
  },
  error: {
    color: colors.error.main,
    fontSize: "14px",
    padding: "10px",
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: "14px",
    color: colors.gray[600],
    textAlign: "center",
    marginTop: spacing.md,
  },
  link: {
    color: colors.primary.main,
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
  privacyText: {
    fontSize: "12px",
    color: colors.gray[600],
    textAlign: "center",
    marginTop: spacing.lg,
  },
};

export default AdminLogin;
