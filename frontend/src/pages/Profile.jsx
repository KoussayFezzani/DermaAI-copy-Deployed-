import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Camera, Eye, EyeOff, X, Trash2, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';

/* ─── helpers ─────────────────────────────────────────────────────────── */
const API = `${API_BASE_URL}/api`;

const token = () => localStorage.getItem('token');
const authHdr = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

const fieldStyle = {
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(15,27,45,0.15)',
    borderRadius: '10px',
    padding: '11px 16px 11px 42px',
    fontSize: '14px',
    color: '#0f1b2d',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#0f1b2d',
    marginBottom: '6px',
};

/* ─── small toast ─────────────────────────────────────────────────────── */
function Toast({ msg, ok }) {
    if (!msg) return null;
    return (
        <div style={{
            position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
            background: ok ? '#1D9E75' : '#A32D2D', color: '#fff',
            borderRadius: '10px', padding: '10px 22px', fontSize: '13px',
            fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
            animation: 'fadeUp .25s ease',
        }}>
            {msg}
        </div>
    );
}

/* ─── modal ───────────────────────────────────────────────────────────── */
function UpdateModal({ user, onClose, onSuccess }) {
    const [tab, setTab] = useState('username'); // 'username' | 'email' | 'password'
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [emailPwd, setEmailPwd] = useState('');
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const tabs = [
        { id: 'username', label: 'Username' },
        { id: 'email', label: 'Email' },
        { id: 'password', label: 'Password' },
    ];

    const save = async () => {
        setErr('');
        setLoading(true);
        try {
            if (tab === 'username') {
                const r = await fetch(`${API}/user/profile`, {
                    method: 'PUT', headers: authHdr(),
                    body: JSON.stringify({ username }),
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error);
                onSuccess({ username: d.username }, 'Username updated!');
            } else if (tab === 'email') {
                const r = await fetch(`${API}/user/change-email`, {
                    method: 'POST', headers: authHdr(),
                    body: JSON.stringify({ new_email: email, password: emailPwd }),
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error);
                onSuccess({ email: d.email }, 'Email updated!');
            } else {
                const r = await fetch(`${API}/user/change-password`, {
                    method: 'POST', headers: authHdr(),
                    body: JSON.stringify({ old_password: oldPwd, new_password: newPwd }),
                });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error);
                onSuccess({}, 'Password changed!');
                setOldPwd(''); setNewPwd('');
            }
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,27,45,0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
        }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: 'rgba(255,255,255,0.97)',
                borderRadius: '20px',
                padding: '36px',
                width: '100%', maxWidth: '440px',
                boxShadow: '0 20px 60px rgba(15,27,45,0.18)',
                position: 'relative',
                animation: 'popIn .22s ease',
            }}>
                {/* Close */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', display: 'flex', alignItems: 'center',
                    borderRadius: '8px', padding: '4px',
                    transition: 'background .15s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                    <X size={18} />
                </button>

                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f1b2d', marginBottom: '20px' }}>
                    Update Profile
                </h2>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'rgba(15,27,45,0.05)', borderRadius: '10px', padding: '4px' }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setErr(''); }}
                            style={{
                                flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em',
                                background: tab === t.id ? '#0f1b2d' : 'transparent',
                                color: tab === t.id ? '#fff' : '#6b7280',
                                transition: 'all .2s',
                            }}>{t.label}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {err && (
                    <div style={{ background: '#FCEBEB', borderLeft: '3px solid #A32D2D', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', color: '#A32D2D', marginBottom: '16px', fontWeight: 500 }}>
                        {err}
                    </div>
                )}

                {/* Fields */}
                {tab === 'username' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>New Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={15} style={{ position: 'absolute', left: 14, top: '40%', transform: 'translateY(-50%)', color: '#0f1b2d', opacity: .45 }} />
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={fieldStyle}
                                onFocus={e => e.target.style.borderColor = '#1D9E75'}
                                onBlur={e => e.target.style.borderColor = 'rgba(15,27,45,0.15)'}
                            />
                        </div>
                    </div>
                )}

                {tab === 'email' && (
                    <>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>New Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 14, top: '40%', transform: 'translateY(-50%)', color: '#0f1b2d', opacity: .45 }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle}
                                    onFocus={e => e.target.style.borderColor = '#1D9E75'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(15,27,45,0.15)'}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 14, top: '40%', transform: 'translateY(-50%)', color: '#0f1b2d', opacity: .45 }} />
                                <input type="password" value={emailPwd} onChange={e => setEmailPwd(e.target.value)} placeholder="Enter your password" style={fieldStyle}
                                    onFocus={e => e.target.style.borderColor = '#1D9E75'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(15,27,45,0.15)'}
                                />
                            </div>
                        </div>
                    </>
                )}

                {tab === 'password' && (
                    <>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 14, top: '40%', transform: 'translateY(-50%)', color: '#0f1b2d', opacity: .45 }} />
                                <input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="••••••••" style={fieldStyle}
                                    onFocus={e => e.target.style.borderColor = '#1D9E75'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(15,27,45,0.15)'}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 14, top: '40%', transform: 'translateY(-50%)', color: '#0f1b2d', opacity: .45 }} />
                                <input type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••"
                                    style={{ ...fieldStyle, paddingRight: '42px' }}
                                    onFocus={e => e.target.style.borderColor = '#1D9E75'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(15,27,45,0.15)'}
                                />
                                <button type="button" onClick={() => setShowPwd(p => !p)} style={{
                                    position: 'absolute', right: 14, top: '40%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#6b7280',
                                }}>
                                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Save */}
                <button onClick={save} disabled={loading} style={{
                    width: '100%', padding: '13px', background: '#0f1b2d', color: '#fff',
                    border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.65 : 1, transition: 'background .2s',
                }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1a2e45'; }}
                    onMouseLeave={e => e.currentTarget.style.background = '#0f1b2d'}
                >
                    {loading ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

/* ─── main component ──────────────────────────────────────────────────── */
const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const [avatar, setAvatar] = useState(null); // data-URL
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState({ msg: '', ok: true });
    const [createdAt, setCreatedAt] = useState('');
    const fileRef = useRef();

    /* fetch created_at from backend */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const r = await fetch(`${API}/admin/users`, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
                // created_at comes from the users list; if not admin, skip
            } catch (_) { }
        };
        // derive from ObjectId embedded in JWT (rough estimate) — if unavailable just show "—"
        setCreatedAt('');
    }, [user]);

    /* load saved avatar */
    useEffect(() => {
        const saved = localStorage.getItem('avatarDataURL');
        if (saved) setAvatar(saved);
    }, []);

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast({ msg: '', ok: true }), 2800);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const url = ev.target.result;
            setAvatar(url);
            localStorage.setItem('avatarDataURL', url);
        };
        reader.readAsDataURL(file);
    };

    const handleModalSuccess = (patch, msg) => {
        updateUser({ ...user, ...patch });
        showToast(msg, true);
        setShowModal(false);
    };

    const handleDeleteHistory = async () => {
        if (!window.confirm('Delete all your scan history? This cannot be undone.')) return;
        try {
            const r = await fetch(`${API}/history`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token()}` },
            });
            if (r.ok) showToast('Scan history deleted.', true);
            else showToast('Failed to delete history.', false);
        } catch { showToast('Network error.', false); }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Permanently delete your account? This cannot be undone.')) return;
        try {
            const r = await fetch(`${API}/user/profile`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token()}` },
            });
            if (r.ok) { logout(); navigate('/'); }
            else showToast('Failed to delete account.', false);
        } catch { showToast('Network error.', false); }
    };

    const initials = (user?.username || user?.email || 'U').charAt(0).toUpperCase();

    return (
        <>
            {/* keyframes injected inline once */}
            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
                @keyframes popIn  { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
            `}</style>

            <Toast msg={toast.msg} ok={toast.ok} />

            {showModal && (
                <UpdateModal
                    user={user}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleModalSuccess}
                />
            )}

            {/* Page */}
            <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>

                {/* ── Single Card ── */}
                <div style={{
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '0.5px solid rgba(255,255,255,0.5)',
                    borderRadius: '22px',
                    padding: '44px 48px',
                    width: '100%',
                    maxWidth: '500px',
                    boxShadow: '0 10px 40px rgba(15,27,45,0.10)',
                }}>

                    {/* Card title */}
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1b2d', marginBottom: '28px' }}>
                        Profile Information
                    </p>

                    {/* ── Avatar ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                        <div
                            onClick={() => fileRef.current.click()}
                            style={{
                                position: 'relative', cursor: 'pointer',
                                width: 100, height: 100, borderRadius: '50%',
                                border: '3px solid #1D9E75',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(29,158,117,0.22)',
                                transition: 'box-shadow .2s',
                            }}
                            title="Click to change photo"
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(29,158,117,0.38)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(29,158,117,0.22)'}
                        >
                            {avatar
                                ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : (
                                    <div style={{ width: '100%', height: '100%', background: '#0f1b2d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: 700, color: '#fff' }}>
                                        {initials}
                                    </div>
                                )
                            }
                            {/* hover overlay */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(15,27,45,0.42)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: 0, transition: 'opacity .2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                            >
                                <Camera size={22} color="#fff" />
                            </div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                        <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>Click photo to change</p>
                    </div>

                    {/* ── Info rows ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>

                        {/* Username */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,27,45,0.04)', borderRadius: '12px', padding: '13px 16px' }}>
                            <User size={17} style={{ color: '#1D9E75', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', marginBottom: '2px' }}>Username</p>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f1b2d' }}>{user?.username || '—'}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,27,45,0.04)', borderRadius: '12px', padding: '13px 16px' }}>
                            <Mail size={17} style={{ color: '#1D9E75', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', marginBottom: '2px' }}>Email</p>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f1b2d' }}>{user?.email || '—'}</p>
                            </div>
                        </div>

                        {/* Role */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,27,45,0.04)', borderRadius: '12px', padding: '13px 16px' }}>
                            <Lock size={17} style={{ color: '#1D9E75', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', marginBottom: '2px' }}>Role</p>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f1b2d', textTransform: 'capitalize' }}>{user?.role || 'user'}</p>
                            </div>
                        </div>

                        {/* Member since (derived from ObjectId if available) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15,27,45,0.04)', borderRadius: '12px', padding: '13px 16px' }}>
                            <Calendar size={17} style={{ color: '#1D9E75', flexShrink: 0 }} />
                            <div>
                                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', marginBottom: '2px' }}>Member Since</p>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f1b2d' }}>
                                    {createdAt || 'DermaAI'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Update Profile Button ── */}
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            width: '100%', padding: '13px', background: '#0f1b2d', color: '#fff',
                            border: 'none', borderRadius: '11px', fontSize: '14px', fontWeight: 600,
                            cursor: 'pointer', letterSpacing: '0.03em', marginBottom: '24px',
                            transition: 'background .2s, transform .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1a2e45'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#0f1b2d'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Update Profile
                    </button>

                    {/* ── Divider ── */}
                    <div style={{ borderTop: '1px solid rgba(15,27,45,0.08)', marginBottom: '20px' }} />

                    {/* ── Danger Buttons ── */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {/* Delete History — red background, white text */}
                        <button
                            onClick={handleDeleteHistory}
                            style={{
                                flex: 1, padding: '12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                background: '#C0392B', color: '#fff',
                                border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: 700,
                                cursor: 'pointer', transition: 'background .2s, transform .15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#A32D2D'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#C0392B'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Trash2 size={14} />
                            Delete History
                        </button>

                        {/* Delete Account — white background, red text */}
                        <button
                            onClick={handleDeleteAccount}
                            style={{
                                flex: 1, padding: '12px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                background: '#fff', color: '#C0392B',
                                border: '1.5px solid #C0392B', borderRadius: '11px', fontSize: '13px', fontWeight: 700,
                                cursor: 'pointer', transition: 'background .2s, transform .15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FDF0EE'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <Trash2 size={14} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
