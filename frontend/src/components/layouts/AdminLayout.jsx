import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Activity, HardDrive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';

const getNavItems = (t) => [
    { id: 'overview', label: t('admin.nav.overview', 'Overview'), icon: LayoutDashboard, path: '/admin/overview' },
    { id: 'analytics', label: t('admin.nav.analytics', 'Analytics'), icon: Activity, path: '/admin/analytics' },
    { id: 'systems', label: t('admin.nav.systems', 'Systems'), icon: Shield, path: '/admin/systems' },
    { id: 'users', label: t('admin.nav.users', 'Directory'), icon: Users, path: '/admin/users' },
    { id: 'exports', label: t('admin.nav.exports', 'Exports'), icon: HardDrive, path: '/admin/exports' },
];

const AdminLayout = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const NAV_ITEMS = getNavItems(t);

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden flex" style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans, "DM Sans")' }}>

            {/* ─── SLIM SIDEBAR ───────────────────────────────────── */}
            <aside 
                style={{ width: '240px', minWidth: '240px', maxWidth: '240px', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
                className="flex flex-col h-full flex-shrink-0 z-20"
            >
                <div className="px-6 py-6 mb-4">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-2xl display-type text-[var(--text)]">DermaAI</span>
                    </Link>
                </div>

                <div className="px-6 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)]/50">
                        {t('admin.nav.mainMenu', 'Main Menu')}
                    </span>
                </div>

                <div className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
                    {NAV_ITEMS.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                    transition-all duration-300 text-left font-medium
                                    ${isActive
                                        ? 'bg-[var(--text)] text-[var(--bg)] shadow-md'
                                        : 'text-[var(--text)]/70 hover:bg-[var(--text)]/5 hover:text-[var(--text)]'
                                    }
                                `}
                            >
                                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                <div className="flex-1">
                                    <p className="text-[13px]">{item.label}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 mt-auto">
                    <div className="p-3 rounded-xl hover:bg-[var(--text)]/5 cursor-pointer flex items-center gap-3 transition-colors border border-transparent hover:border-[var(--text)]/10">
                        <div className="w-8 h-8 rounded-full bg-[var(--text)]/10 flex items-center justify-center font-bold text-[var(--text)] text-sm">
                            {user?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[var(--text)] truncate">{user?.username || 'Admin'}</p>
                            <p className="text-[11px] font-medium text-[var(--text)]/60 truncate">{t('admin.nav.preferences', 'Preferences')}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─── MAIN CONTENT FRAME ────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-transparent z-10">
                
                {/* Minimal Header */}
                <div className="px-8 py-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <h1 className="text-2xl display-type" style={{ color: 'var(--text)' }}>
                            {NAV_ITEMS.find(n => n.path === location.pathname)?.label || 'Admin'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-hide">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
