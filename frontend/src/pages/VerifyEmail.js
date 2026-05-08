import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { colors, spacing, shadows, borderRadius } from '../styles/theme';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email;
    const storedEmail = localStorage.getItem('registrationEmail');
    
    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem('registrationEmail', emailFromState);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Redirect to register if no email
      navigate('/register');
    }
  }, [location, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/auth/verify-email', {
        email,
        verificationCode: code,
      });

      // Store JWT token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user.id,
        email: response.data.user.email,
        displayName: response.data.user.displayName,
        userType: 'user'
      }));

      // Clear registration email
      localStorage.removeItem('registrationEmail');

      setSuccess('Email verified! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard/lost'), 2000);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      setError('');

      await axios.post('/auth/resend-verification', { email });

      setSuccess('Verification code sent to your email');
      setResendCooldown(60); // 60 seconds cooldown
      setCode('');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Resend error:', err);
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setResendLoading(false);
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
        <h1 style={styles.title}>Verify Email</h1>
        <p style={styles.subtitle}>
          Enter the code sent to<br />
          <strong>{email}</strong>
        </p>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Verification Code</label>
            <input
              type="text"
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              style={styles.codeInput}
              placeholder="000000"
              disabled={loading}
              inputMode="numeric"
            />
            <p style={styles.hint}>Enter the 6-digit code from your email</p>
          </div>

          <button 
            type="submit"
            disabled={loading || code.length !== 6} 
            style={{
              ...styles.button,
              opacity: loading || code.length !== 6 ? 0.7 : 1,
            }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div style={styles.divider}></div>

        <button
          onClick={handleResendCode}
          disabled={resendLoading || resendCooldown > 0}
          style={{
            ...styles.resendButton,
            opacity: resendLoading || resendCooldown > 0 ? 0.7 : 1,
          }}
        >
          {resendCooldown > 0 
            ? `Resend in ${resendCooldown}s` 
            : resendLoading 
            ? "Sending..." 
            : "Resend Code"
          }
        </button>

        <p style={styles.text}>
          <Link to="/login" style={styles.link}>Back to Login</Link>
        </p>

        <p style={styles.privacyText}>
          The code will expire in 10 minutes
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
  codeInput: {
    padding: "12px 16px",
    borderRadius: borderRadius.medium,
    border: `2px solid ${colors.gray[300]}`,
    fontSize: "24px",
    fontFamily: "monospace",
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: "8px",
    transition: "border-color 0.3s",
    outline: "none",
  },
  hint: {
    fontSize: "12px",
    color: colors.gray[600],
    marginTop: "4px",
    textAlign: "center",
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
  resendButton: {
    padding: "10px 20px",
    backgroundColor: colors.white,
    color: colors.primary.main,
    border: `2px solid ${colors.primary.main}`,
    borderRadius: borderRadius.medium,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    width: "100%",
  },
  divider: {
    height: "1px",
    backgroundColor: colors.gray[200],
    margin: `${spacing.lg} 0`,
  },
  error: {
    color: colors.error.main,
    fontSize: "14px",
    padding: "10px",
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.md,
  },
  success: {
    color: colors.success.main,
    fontSize: "14px",
    padding: "10px",
    backgroundColor: colors.success.light,
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

export default VerifyEmail;
