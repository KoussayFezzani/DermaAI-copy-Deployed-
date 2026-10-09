import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Sparkles, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';

// Password strength calculator
const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
        { label: '', color: '' },
        { label: 'Weak', color: '#ef4444' },
        { label: 'Fair', color: '#f97316' },
        { label: 'Good', color: '#eab308' },
        { label: 'Strong', color: '#22c55e' },
    ];
    return { score, ...map[score] };
};

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
    boxSizing: 'border-box',
};

const Signup = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const strength = getPasswordStrength(password);
    const passwordMatch = confirmPassword && password === confirmPassword;
    const passwordMismatch = confirmPassword && password !== confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) return setError(t('auth.signup.errors.passwordsDontMatch'));
        setLoading(true);
        try {
            await signup(email, password, username);
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const focusHandler = (e) => { e.target.style.borderColor = '#1D9E75'; };
    const blurHandler = (e) => { e.target.style.borderColor = 'rgba(15, 27, 45, 0.15)'; };

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
                        Create account.
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                        Join DermaAI for free.
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
                    {/* Username + Email row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                                {t('auth.signup.username', 'Username')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '14px', top: '40%', transform: 'translateY(-50%)', marginTop: '-2px', color: '#0f1b2d', opacity: 0.5 }} />
                                <input
                                    type="text"
                                    placeholder={t('auth.signup.usernamePlaceholder', 'johndoe')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={inputStyle}
                                    onFocus={focusHandler}
                                    onBlur={blurHandler}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                                {t('auth.signup.email', 'Email')}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '40%', transform: 'translateY(-50%)', marginTop: '-2px', color: '#0f1b2d', opacity: 0.5 }} />
                                <input
                                    type="email"
                                    required
                                    placeholder={t('auth.signup.emailPlaceholder', 'you@example.com')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={inputStyle}
                                    onFocus={focusHandler}
                                    onBlur={blurHandler}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                            {t('auth.signup.password', 'Password')}
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
                                onFocus={focusHandler}
                                onBlur={blurHandler}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#6b7280', transition: 'color 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#1D9E75'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Strength bar */}
                        {password && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                height: '4px',
                                                borderRadius: '2px',
                                                transition: 'background 0.3s',
                                                background: i <= strength.score ? strength.color : 'rgba(15, 27, 45, 0.1)',
                                            }}
                                        />
                                    ))}
                                </div>
                                {strength.label && (
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: strength.color, marginTop: '4px' }}>
                                        Password strength: {strength.label}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '8px' }}>
                            {t('auth.signup.confirmPassword', 'Confirm password')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '14px', top: '40%', transform: 'translateY(-50%)', marginTop: '-2px', color: '#0f1b2d', opacity: 0.5 }} />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                required
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    ...inputStyle,
                                    paddingRight: '60px',
                                    borderColor: passwordMatch ? '#22c55e' : passwordMismatch ? '#A32D2D' : 'rgba(15, 27, 45, 0.15)',
                                }}
                                onFocus={e => { if (!passwordMatch && !passwordMismatch) e.target.style.borderColor = '#1D9E75'; }}
                                onBlur={e => { if (!passwordMatch && !passwordMismatch) e.target.style.borderColor = 'rgba(15, 27, 45, 0.15)'; }}
                            />
                            <div style={{ position: 'absolute', right: '14px', top: '40%', transform: 'translateY(-50%)', marginTop: '-2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {passwordMatch && <CheckCircle size={14} style={{ color: '#22c55e' }} />}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#6b7280', transition: 'color 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#1D9E75'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {passwordMismatch && (
                            <p style={{ fontSize: '12px', color: '#A32D2D', fontWeight: 500, marginTop: '4px' }}>
                                {t('auth.signup.errors.passwordsDontMatch', 'Passwords do not match')}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || passwordMismatch}
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
                            cursor: (loading || passwordMismatch) ? 'not-allowed' : 'pointer',
                            opacity: (loading || passwordMismatch) ? 0.6 : 1,
                            transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={e => { if (!loading && !passwordMismatch) e.currentTarget.style.background = '#1a2e45'; }}
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
                                <Sparkles size={16} />
                                Create account
                            </>
                        )}
                    </button>
                </form>

                {/* Footer link */}
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '24px' }}>
                    {t('auth.signup.haveAccount', 'Already have an account?')}{' '}
                    <Link to="/login" style={{ color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}>
                        {t('auth.signup.signIn', 'Log in')} →
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
