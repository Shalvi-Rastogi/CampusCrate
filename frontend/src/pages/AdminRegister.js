import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { colors, spacing, shadows, borderRadius } from '../styles/theme';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    if (user && userType === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !adminName || !secretKey) {
      setError('All fields are required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Send to backend to create admin user
      const response = await axios.post('/auth/admin-register', {
        email,
        password,
        adminName,
        secretKey,
        userType: 'admin'
      });

      // Store JWT token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userType', 'admin');

      navigate('/admin/dashboard');
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'email-already-in-use') {
        setError('Email is already registered');
      } else {
        setError(err.message || 'Registration failed');
      }
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
        <h1 style={styles.title}>Admin Registration</h1>
        <p style={styles.subtitle}>Create Admin Account</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Admin Name</label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              style={styles.input}
              placeholder="Enter admin name"
              disabled={loading}
            />
          </div>

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
              placeholder="Create a password"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Admin Secret Key</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              style={styles.input}
              placeholder="Enter admin secret key"
              disabled={loading}
            />
            <p style={styles.hint}>Contact system administrator for secret key</p>
          </div>

          <button 
            type="submit"
            disabled={loading} 
            style={styles.button}
          >
            {loading ? "Creating Account..." : "Register as Admin"}
          </button>
        </form>

        <p style={styles.text}>
          Already have an account?{' '}
          <Link to="/admin/login" style={styles.link}>Login here</Link>
        </p>

        <p style={styles.text}>
          Regular User?{' '}
          <Link to="/login" style={styles.link}>User Login</Link>
        </p>

        <p style={styles.privacyText}>
          By registering, you agree to our Terms of Service and Privacy Policy
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
  hint: {
    fontSize: "12px",
    color: colors.gray[600],
    marginTop: "4px",
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

export default AdminRegister;
