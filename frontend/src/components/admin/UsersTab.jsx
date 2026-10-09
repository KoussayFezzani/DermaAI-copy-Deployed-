import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardCard from './DashboardCard';

const UsersTab = ({
    usersData,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    onEdit,
    onDelete,
}) => {
    const { t } = useTranslation();
    const totalPages = usersData?.total_pages || 1;

    const filteredUsers = useMemo(() => {
        if (!usersData?.users) return [];
        if (!searchTerm.trim()) return usersData.users;
        const q = searchTerm.toLowerCase();
        return usersData.users.filter(u =>
            u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        );
    }, [usersData, searchTerm]);

    return (
        <DashboardCard
            title={t('admin.users.directory', 'User Directory')}
            description={t('admin.users.registeredAccounts', '{{count}} registered accounts', { count: usersData?.total_users ?? 0 })}
            headerAction={
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/3 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                        type="text"
                        placeholder={t('admin.users.search', 'Search users…')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="py-1.5 pl-9 pr-3 w-48 text-[13px] rounded-md focus:outline-none transition-colors"
                        style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                    />
                </div>
            }
        >
            {/* Table */}
            <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full">
                    <thead>
                        <tr className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                            <th className="px-4 py-3 text-left font-bold">{t('admin.users.colUser', 'User')}</th>
                            <th className="px-4 py-3 text-left font-bold">{t('admin.users.colEmail', 'Email')}</th>
                            <th className="px-4 py-3 text-left font-bold">{t('admin.users.colRole', 'Role')}</th>
                            <th className="px-4 py-3 text-left font-bold">{t('admin.users.colJoined', 'Joined')}</th>
                            <th className="px-4 py-3 text-right font-bold">{t('admin.users.colActions', 'Actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u._id} className="last:border-0 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: 'var(--border)', color: 'var(--text)' }}>
                                            {u.username?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>{u.username || '—'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                <td className="px-4 py-3.5">
                                    <span className={`text-[11px] font-bold ${u.role === 'admin'
                                        ? 'text-emerald-600'
                                        : ''
                                        }`} style={u.role !== 'admin' ? { color: 'var(--text-muted)' } : {}}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-[13px]" style={{ color: 'var(--text-muted)' }}>
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                                </td>
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(u)}
                                            className="p-1.5 transition-colors"
                                            style={{ color: 'var(--text-muted)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(u._id)}
                                            className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
                                    {t('admin.users.noUsers', 'No users found')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        {t('admin.users.page', 'Page {{current}} of {{total}}', { current: page, total: totalPages })}
                    </div>
                    <div className="flex gap-1">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-1.5 rounded-md disabled:opacity-50 transition-colors"
                            style={{ border: '1px solid var(--border)', color: 'var(--text)', background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-1.5 rounded-md disabled:opacity-50 transition-colors"
                            style={{ border: '1px solid var(--border)', color: 'var(--text)', background: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </DashboardCard>
    );
};

export default UsersTab;
