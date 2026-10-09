import React, { useEffect, useState } from 'react';
import {
    Users, Microscope, Shield, Activity, HardDrive,
    LayoutDashboard, Home, ChevronRight, AlertCircle,
    Moon, Sun
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

// ── Admin sub-components ────────────────────────────────────────────────────
import {
    OverviewTab,
    AnalyticsTab,
    SystemsTab,
    UsersTab,
    ExportsTab,
    EditUserModal,
} from '../components/admin';

import { API_BASE_URL } from '../utils/apiConfig';

// ── Constants ───────────────────────────────────────────────────────────────
const BASE = API_BASE_URL;


const authHeaders = () => {
    const t = localStorage.getItem('token');
    return t && t !== 'null' ? { Authorization: `Bearer ${t}` } : {};
};

// ── Navigation config ───────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', desc: 'Platform summary', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', desc: 'Data and trends', icon: Activity },
    { id: 'systems', label: 'Systems', desc: 'Service health', icon: Shield },
    { id: 'users', label: 'Directory', desc: 'Manage accounts', icon: Users },
    { id: 'exports', label: 'Exports', desc: 'Backup and data', icon: HardDrive },
];

// ── KPI card config builder ─────────────────────────────────────────────────
const buildKpiCards = (stats, t) => [
    {
        icon: Microscope, label: t('admin.stats.scans', 'Total Analyses'),
        value: stats.total_scans ?? 0,
        iconBg: 'bg-[var(--text)]/5',
        iconBorder: 'border-[var(--text)]/10',
        iconColor: 'text-[var(--text)]',
        trend: 12,
    },
    {
        icon: Users, label: t('admin.stats.users', 'Registered Users'),
        value: stats.total_users ?? 0,
        iconBg: 'bg-[var(--text)]/5',
        iconBorder: 'border-[var(--text)]/10',
        iconColor: 'text-[var(--text)]',
        trend: 8,
    },
    {
        icon: Activity, label: t('admin.stats.active', 'Active (24 h)'),
        value: stats.active_users ?? 0,
        iconBg: 'bg-[var(--text)]/5',
        iconBorder: 'border-[var(--text)]/10',
        iconColor: 'text-[var(--text)]',
    },
];

const AdminDashboard = ({ tab }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [usersData, setUsersData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', email: '', password: '' });
    const [toast, setToast] = useState(null);

    const requiresAuth = (status) => status === 401 || status === 403 || status === 422;

    const fetchStats = async () => {
        try {
            const r = await fetch(`${BASE}/api/admin/stats`, { headers: authHeaders() });
            if (requiresAuth(r.status)) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            if (!r.ok) { console.error('Stats fetch failed:', r.status); return; }
            setStats(await r.json());
        } catch (err) { console.error('fetchStats error:', err); }
    };

    const fetchUsers = async (p) => {
        try {
            const r = await fetch(`${BASE}/api/admin/users?page=${p}&limit=8`, { headers: authHeaders() });
            if (requiresAuth(r.status)) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            if (!r.ok) { console.error('Users fetch failed:', r.status); return; }
            const data = await r.json();
            setUsersData(data);
        } catch (err) { console.error('fetchUsers error:', err); }
    };

    useEffect(() => {
        (async () => {
            setLoading(true);
            await Promise.all([fetchStats(), fetchUsers(1)]);
            setLoading(false);
        })();
    }, []);

    useEffect(() => { fetchUsers(page); }, [page]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const deleteUser = async (uid) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            const r = await fetch(`${BASE}/api/admin/users/${uid}`, { method: 'DELETE', headers: authHeaders() });
            if (r.ok) { showToast('User deleted.'); fetchUsers(page); fetchStats(); }
            else showToast('Delete failed.', 'error');
        } catch { showToast('Network error.', 'error'); }
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            const r = await fetch(`${BASE}/api/admin/users/${editingUser._id}`, {
                method: 'PUT',
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (r.ok) { showToast('User updated.'); setEditingUser(null); fetchUsers(page); }
            else showToast('Update failed.', 'error');
        } catch { showToast('Network error.', 'error'); }
    };

    const downloadFile = async (url, filename) => {
        try {
            const r = await fetch(url, { headers: authHeaders() });
            if (!r.ok) throw new Error();
            const blob = await r.blob();
            const a = Object.assign(document.createElement('a'), {
                href: URL.createObjectURL(blob), download: filename, style: 'display:none'
            });
            document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove();
            showToast(`${filename} downloaded.`);
        } catch { showToast('Download failed.', 'error'); }
    };

    const handleEditUser = (u) => {
        setEditingUser(u);
        setEditForm({ username: u.username || '', email: u.email || '', password: '' });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="w-9 h-9 rounded-full border-2 border-[var(--text)] border-t-transparent animate-spin" />
                <p className="text-[10px] font-black text-[var(--text)] font-mono uppercase tracking-[0.3em]">Neural Link Initializing…</p>
            </div>
        </div>
    );

    const kpiCards = buildKpiCards(stats || {}, t);

    const renderTab = () => {
        if (!stats) return null;
        switch (tab) {
            case 'overview': return <OverviewTab stats={stats} kpiCards={kpiCards} />;
            case 'analytics': return <AnalyticsTab stats={stats} />;
            case 'systems': return <SystemsTab stats={stats} />;
            case 'users': return (
                <UsersTab
                    usersData={usersData}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    page={page}
                    setPage={setPage}
                    onEdit={handleEditUser}
                    onDelete={deleteUser}
                />
            );
            case 'exports': return <ExportsTab onDownload={downloadFile} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {renderTab()}

            <EditUserModal
                user={editingUser}
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={saveEdit}
                onClose={() => setEditingUser(null)}
            />

            {toast && (
                <div className={`fixed bottom-10 right-10 z-[300] px-6 py-4 rounded-2xl shadow-2xl border text-xs font-bold uppercase tracking-widest ${
                    toast.type === 'error' ? 'bg-red-500 text-white border-red-600' : 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]/10'
                }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
