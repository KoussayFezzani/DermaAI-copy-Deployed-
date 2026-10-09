import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/i18n'
import { ThemeProvider } from './context/ThemeContext';

import { HelmetProvider } from 'react-helmet-async';

// Global error boundary to prevent blank screen on unhandled errors
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('App Error:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    gap: '1rem',
                    padding: '2rem',
                    textAlign: 'center',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
                    <p style={{ color: 'var(--text)', marginBottom: '1.5rem', maxWidth: '400px' }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '0.75rem',
                            background: 'var(--text)',
                            color: 'var(--bg)',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <HelmetProvider>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </HelmetProvider>
        </ErrorBoundary>
    </React.StrictMode>
)
