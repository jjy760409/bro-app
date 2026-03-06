import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught Runtime Exception:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100vw', height: '100vh', background: '#050505', color: 'white',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', textAlign: 'center', fontFamily: '"Inter", sans-serif'
                }}>
                    <AlertTriangle size={64} color="#ff4d4d" style={{ marginBottom: '20px' }} />
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>System Overload</h1>
                    <p style={{ color: '#aaa', marginBottom: '30px', maxWidth: '400px', lineHeight: '1.5' }}>
                        BroApp encountered an unexpected memory error or mobile browser limitation. Don't worry, your data is safe.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: 'white', color: 'black', border: 'none', padding: '15px 30px',
                            borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem',
                            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={20} /> Reboot System
                    </button>

                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ whiteSpace: 'pre-wrap', marginTop: '40px', color: '#666', fontSize: '0.8rem', textAlign: 'left', maxWidth: '80%' }}>
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
