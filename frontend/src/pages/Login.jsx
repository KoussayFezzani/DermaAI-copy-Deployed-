import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

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

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[92vh] flex items-center justify-center px-4 py-12">

            {/* ── FLOATING CARD ────────────────────────────────────────────── */}
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
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '12px' }}>
                        DERMAAI
                    </p>
                    <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#0f1b2d', margin: 0, lineHeight: 1.2 }}>
                        Welcome back.
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                        Log in to your account to continue.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        style={{
                            background: '#FCEBEB',
                            borderLeft: '3px solid #A32D2D',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            color: '#A32D2D',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '20px',
                        }}
                    >
                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 500 }}>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                            {t('auth.login.email', 'Email address')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '14px', top: '40%', transform: 'translateY(-50%)', marginTop: '-2px', color: '#0f1b2d', opacity: 0.5 }} />
                            <input
                                type="email"
                                required
                                placeholder={t('auth.login.emailPlaceholder', 'you@example.com')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = '#1D9E75'; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(15, 27, 45, 0.15)'; }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                            {t('auth.login.password', 'Password')}
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
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '35%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#1D9E75'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <Link to="/forgot-password" style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'none', fontWeight: 600 }}>
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
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
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'background 0.2s ease, transform 0.2s ease',
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1a2e45'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#0f1b2d'; }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                            </div>
                        ) : (
                            <>
                                <ArrowRight size={16} />
                                Log in
                            </>
                        )}
                    </button>
                </form>

                {/* Footer link */}
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '24px' }}>
                    {t('auth.login.noAccount', "Don't have an account?")}{' '}
                    <Link to="/signup" style={{ color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}>
                        {t('auth.login.signUp', 'Sign up')} →
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
