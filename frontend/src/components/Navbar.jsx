import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Menu, X, Home, Scan, Clock, BookOpen, Newspaper, Info, ShieldCheck, User, LogOut, Microscope, Stethoscope, Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/', label: t('nav.home', 'Home') },
        ...(user ? [
            { to: '/scan', label: t('nav.aiScanner', 'AI Scanner') },
            { to: '/history', label: t('nav.history', 'History') }
        ] : []),
        { to: '/diseases', label: t('nav.diseases', 'Index') },
        { to: '/blog', label: t('nav.blog', 'Insights') },
        { to: '/support', label: t('nav.support', 'FAQ') },
        { to: '/about', label: t('nav.about', 'About') },
        ...(user?.role === 'admin' ? [
            { to: '/admin', label: t('nav.admin', 'Dashboard') }
        ] : []),
    ];

    return (
        <nav 
            className="relative w-full transition-all"
            style={{
                paddingBottom: scrolled ? '1.25rem' : '0.5rem',
                background: scrolled ? 'var(--bg)' : 'transparent',
                transitionDuration: '500ms',
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                borderBottom: '1px solid var(--text)'
            }}
        >
            <div className="w-full px-10 flex items-center justify-between">
                
                {/* ── LOGO (LEFT) ──────────────────────────────────────────────── */}
                <Link to="/" className="flex items-center group">
                    <span className="text-3xl font-bold tracking-tight text-[var(--text)]">
                        DermaAI
                    </span>
                </Link>

                {/* ── NAV LINKS (CENTER) ────────────────────────────────────────── */}
                <div className="hidden lg:flex items-center gap-20">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.to} 
                            to={link.to}
                            className="text-[11px] font-bold uppercase tracking-[0.45em] text-[var(--text)]/50 hover:text-[var(--text)] transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* ── CTA (RIGHT) ──────────────────────────────────────────────── */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-4">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                    
                    {user ? (
                        <div ref={userMenuRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-10 h-10 rounded-full border border-[var(--text)]/20 flex items-center justify-center hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all"
                                style={{ background: 'none', cursor: 'pointer' }}
                            >
                                <User size={20} />
                            </button>
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 10px)',
                                            right: 0,
                                            width: '200px',
                                            background: 'rgba(255, 255, 255, 0.92)',
                                            backdropFilter: 'blur(16px)',
                                            WebkitBackdropFilter: 'blur(16px)',
                                            border: '1px solid rgba(8, 18, 45, 0.1)',
                                            borderRadius: '14px',
                                            padding: '6px',
                                            boxShadow: '0 12px 40px rgba(8, 18, 45, 0.12)',
                                            zIndex: 500,
                                        }}
                                    >
                                        {/* User info */}
                                        <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(8, 18, 45, 0.08)', marginBottom: '4px' }}>
                                            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{user.username || 'User'}</p>
                                            <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, marginTop: '2px' }}>{user.email || ''}</p>
                                        </div>
                                        {/* Settings */}
                                        <button
                                            onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                background: 'none',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: 'var(--text)',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(8, 18, 45, 0.05)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                        >
                                            <Settings size={15} style={{ opacity: 0.6 }} />
                                            Settings
                                        </button>
                                        {/* Logout */}
                                        <button
                                            onClick={() => { setUserMenuOpen(false); logout(); navigate('/'); }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 12px',
                                                background: 'none',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#A32D2D',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(163, 45, 45, 0.06)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                        >
                                            <LogOut size={15} style={{ opacity: 0.7 }} />
                                            Log out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link 
                            to="/login"
                            className="text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-300 flex items-center justify-center"
                            style={{
                                height: '40px',
                                padding: '0 24px',
                                borderRadius: '9999px',
                                border: '1px solid rgba(8, 18, 45, 0.2)',
                                color: 'var(--text)',
                                background: 'transparent',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--text)'; e.currentTarget.style.color = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--text)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'rgba(8, 18, 45, 0.2)'; }}
                        >
                            Sign in
                        </Link>
                    )}

                    {/* Mobile Toggle */}
                    <button 
                        className="lg:hidden text-[var(--bg)] p-2 relative z-[300]"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* ── MOBILE MENU (FULLSCREEN OVERLAY) ────────────────────────── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[200] bg-[var(--bg)]/97 backdrop-blur-[20px] flex flex-col items-center justify-center p-10 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.to} 
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-2xl font-black uppercase tracking-[0.3em] text-[var(--bg)]/60 hover:text-[var(--bg)] min-h-[48px] flex items-center justify-center w-full"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-10 border-t border-[var(--bg)]/10 w-full flex flex-col items-center gap-10">
                                <LanguageSwitcher />
                                {user ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); logout(); }} 
                                        className="text-[var(--bg)]/40 flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
                                    >
                                        <LogOut size={20} /> Sign Out
                                    </button>
                                ) : (
                                    <Link 
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-[var(--bg)]/60 font-black uppercase tracking-widest text-sm"
                                    >
                                        Access Portal
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shimmer Line Accent */}
            <div className="absolute bottom-0 left-0 right-0 shimmer-line opacity-30" />
        </nav>
    );
};

export default Navbar;
