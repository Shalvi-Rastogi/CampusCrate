import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.errorContainer}>
          <h1>Something went wrong</h1>
          <p style={styles.errorMessage}>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={styles.button}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  errorContainer: {
    padding: '20px',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '40px auto',
  },
  errorMessage: {
    color: '#dc3545',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#4285F4',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default ErrorBoundary;
