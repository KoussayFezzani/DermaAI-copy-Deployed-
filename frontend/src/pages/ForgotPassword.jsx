import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/apiConfig';


const inputStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid rgba(15, 27, 45, 0.15)',
    borderRadius: '10px',
    padding: '12px 16px 12px 42px',
    fontSize: '14px',
    color: '#0f1b2d',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s ease',
};

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div className="min-h-[92vh] flex items-center justify-center px-4 py-12">
            <div
                style={{
                    background: 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '0.5px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '20px',
                    padding: '48px',
                    maxWidth: '480px',
                    width: '100%',
                    boxShadow: '0 8px 32px rgba(15, 27, 45, 0.08)',
                }}
            >
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', fontWeight: 600, textDecoration: 'none', marginBottom: '24px' }}>
                    <ArrowLeft size={14} /> Back to login
                </Link>

                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#0f1b2d', margin: 0, lineHeight: 1.2 }}>
                        Forgot Password
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#E8F5EE', color: '#1D9E75', marginBottom: '20px' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f1b2d', marginBottom: '8px' }}>Check your email</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div style={{ background: '#FCEBEB', borderLeft: '3px solid #A32D2D', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                <span style={{ fontWeight: 500 }}>{message}</span>
                            </div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                                Email address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '40%', transform: 'translateY(-50%)', marginTop: '-2px', color: '#0f1b2d', opacity: 0.5 }} />
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = '#1D9E75'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(15, 27, 45, 0.15)'; }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '14px',
                                background: '#0f1b2d',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: 500,
                                letterSpacing: '0.03em',
                                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                opacity: status === 'loading' ? 0.6 : 1,
                                transition: 'background 0.2s ease',
                            }}
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
