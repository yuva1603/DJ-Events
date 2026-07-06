import { Component } from 'react'

/**
 * ErrorBoundary — Catches WebGL / React render errors.
 * Shows a static fallback instead of a white screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ZONO 3D Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0,
          background: '#050508',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'Inter, sans-serif',
          textAlign: 'center', padding: '2rem',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
          <h1 style={{ fontSize: '2rem', color: '#00d4ff', marginBottom: '0.5rem' }}>ZONO Events</h1>
          <p style={{ color: '#8888aa', marginBottom: '2rem' }}>
            Your browser doesn't support the full experience.<br />
            Please try Chrome or Firefox for the 3D version.
          </p>
          <a
            href="#contact"
            style={{
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, #00d4ff, #7b2fff)',
              borderRadius: '9999px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Book an Event
          </a>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
