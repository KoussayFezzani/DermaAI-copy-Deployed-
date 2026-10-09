import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
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

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    if (!token) {
        return (
            <div className="min-h-[92vh] flex items-center justify-center px-4">
                <div style={{ textAlign: 'center' }}>
                    <AlertCircle size={48} color="#A32D2D" style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f1b2d' }}>Invalid Reset Link</h2>
                    <p style={{ color: '#6b7280', marginTop: '8px', marginBottom: '24px' }}>This password reset link is invalid or has expired.</p>
                    <button onClick={() => navigate('/forgot-password')} style={{ padding: '10px 20px', background: '#0f1b2d', color: '#fff', borderRadius: '8px', fontWeight: 600 }}>Request New Link</button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }
        
        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to reset password.');
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
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#0f1b2d', margin: 0, lineHeight: 1.2 }}>
                        Set New Password
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                        Please enter your new password below.
                    </p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#E8F5EE', color: '#1D9E75', marginBottom: '20px', justifyContent: 'center' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f1b2d', marginBottom: '8px' }}>Password Reset!</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Your password has been changed successfully. Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div style={{ background: '#FCEBEB', borderLeft: '3px solid #A32D2D', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#A32D2D', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                <span style={{ fontWeight: 500 }}>{message}</span>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '40%', transform: 'translateY(-50%)', marginTop: '-2px', color: '#0f1b2d', opacity: 0.5 }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ ...inputStyle, paddingRight: '42px' }}
                                    onFocus={e => { e.target.style.borderColor = '#1D9E75'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(15, 27, 45, 0.15)'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '14px', top: '35%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#6b7280' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                                Confirm New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '40%', transform: 'translateY(-50%)', marginTop: '-2px', color: '#0f1b2d', opacity: 0.5 }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ ...inputStyle, paddingRight: '42px' }}
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
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
