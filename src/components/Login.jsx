import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Chrome } from 'lucide-react';
import '../styles/index.css';

const Login = () => {
    const { login } = useAuth();

    return (
        <div className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '30px' }}>
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--bro-green)', marginBottom: '20px' }}>Bro App</h1>
            <p style={{ color: '#888', marginBottom: '40px', textAlign: 'center' }}>
                Login to save your history and track your health journey.
            </p>

            <button
                className="btn-primary"
                onClick={login}
                style={{
                    background: 'white',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '15px 30px'
                }}
            >
                <Chrome size={24} />
                Sign in with Google
            </button>

            <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#555' }}>
                Protected by Firebase Security
            </p>
        </div>
    );
};

export default Login;
