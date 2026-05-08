import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import axios from '../axiosConfig';
import { colors, spacing, shadows, borderRadius } from '../styles/theme';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard/lost');
    }
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      // Firebase authentication
      const result = await signInWithGoogle();
      const user = result.user;

      // Send to backend to get JWT token
      const response = await axios.post('/auth/login', {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      // Store JWT token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user.id,
        email: response.data.user.email,
        displayName: response.data.user.displayName,
        photoURL: response.data.user.photoURL,
      }));

      navigate('/dashboard/lost');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <img 
            src="/lost-found-logo.png" 
            alt="Lost & Found"
            style={styles.logoImage}
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
        <h1 style={styles.title}>Lost & Found</h1>
        <p style={styles.subtitle}>Your Campus Lost & Found Solution</p>

        {error && <p style={styles.error}>{error}</p>}

        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading} 
          style={styles.button}
        >
          <div style={styles.googleButton}>
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              style={styles.googleIcon}
            />
            <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
          </div>
        </button>

        <div style={styles.divider}>
          <span>OR</span>
        </div>

        <p style={styles.text}>
          Don't have an account yet?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>

        <p style={styles.text}>
          Admin?{' '}
          <Link to="/admin/login" style={styles.link}>Admin Login</Link>
        </p>

        <p style={styles.privacyText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${colors.primary.main}15, ${colors.secondary.main}15)`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  card: {
    background: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.large,
    boxShadow: shadows.large,
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
  },
  logo: {
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: "80px",
    height: "80px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: "16px",
    color: colors.gray[600],
    marginBottom: spacing.xl,
  },
  button: {
    width: "100%",
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: "16px",
    backgroundColor: colors.white,
    color: colors.gray[800],
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.medium,
    cursor: "pointer",
    marginBottom: spacing.lg,
    transition: "all 0.3s ease",
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  googleIcon: {
    width: "24px",
    height: "24px",
  },
  error: {
    color: colors.error.main,
    marginBottom: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.small,
    fontSize: "14px",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: `${spacing.lg} 0`,
    color: colors.gray[400],
    fontSize: "14px",
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
    marginTop: spacing.lg,
  },
};

export default Login;
