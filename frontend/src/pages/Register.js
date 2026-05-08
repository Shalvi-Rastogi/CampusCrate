import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import axios from '../axiosConfig';
import { colors, spacing, shadows, borderRadius } from '../styles/theme';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard/lost');
    }
  }, [navigate]);

  const validateForm = () => {
    if (!email || !password || !confirmPassword || !displayName) {
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

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Send to backend to create user record
      // Use the email from input field instead of firebaseUser.email
      const response = await axios.post('/auth/register', {
        firebaseUid: firebaseUser.uid,
        email: email, // Use input email, not firebaseUser.email
        displayName: displayName,
        userType: 'user'
      });

      // Store email for verification page
      localStorage.setItem('registrationEmail', email);

      // Redirect to verification page
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        responseStatus: err.response?.status,
        responseData: err.response?.data,
      });
      
      // Handle Firebase errors first
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered in Firebase. Please use a different email or contact support.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.response?.status === 400) {
        // Handle backend validation errors
        setError(`Registration failed: ${err.response.data.error}`);
      } else if (err.response?.status === 500) {
        // Handle backend server errors
        setError(`Server error: ${err.response.data.error || 'Please try again later'}`);
      } else if (err.response?.data?.error) {
        // Handle other backend errors
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please check your details and try again.');
      }
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
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join Lost & Found Community</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={styles.input}
              placeholder="Enter your full name"
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
              placeholder="Enter your email"
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

          <button 
            type="submit"
            disabled={loading} 
            style={styles.button}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p style={styles.text}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login here</Link>
        </p>

        <p style={styles.text}>
          Admin?{' '}
          <Link to="/admin/login" style={styles.link}>Admin Login</Link>
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
    background: `linear-gradient(135deg, ${colors.primary.main}15, ${colors.secondary.main}15)`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  card: {
    background: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    boxShadow: shadows.large,
    maxWidth: "400px",
    width: "100%",
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    marginBottom: spacing.md,
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

export default Register;
