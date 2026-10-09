import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import KpiCard from './KpiCard';
import DashboardCard from './DashboardCard';

const TOOLTIP_STYLE = {
    background: 'var(--surface)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--text)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
};

const OverviewTab = ({ stats, kpiCards }) => {
    const { t } = useTranslation();
    const weeklyData = stats.weekly_activity || [];

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {kpiCards.map((c, i) => <KpiCard key={i} {...c} />)}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Weekly Scans Bar Chart */}
                <DashboardCard
                    title={t('admin.overview.weeklyScans', 'Weekly Scans')}
                    description={t('admin.overview.weeklyScansDesc', 'Analyses over the last 7 days')}
                    className="lg:col-span-3"
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={weeklyData} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: 'var(--text-dim)', fontFamily: 'inherit' }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fill: 'var(--text-dim)', fontFamily: 'inherit' }} 
                                dx={-10}
                            />
                            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--border)' }} />
                            <Bar dataKey="scans" fill="var(--text)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </DashboardCard>

                {/* Recent Activity */}
                <DashboardCard
                    title={t('admin.overview.recentActivity', 'Recent Activity')}
                    className="lg:col-span-2"
                >
                    <div className="space-y-4 max-h-[240px] overflow-y-auto scrollbar-hide pr-2">
                        {stats.recent_activity?.length ? stats.recent_activity.map((log, i) => (
                            <div key={i} className="flex flex-col gap-1 pb-3 border-b border-[var(--text)]/10 last:border-0 last:pb-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-[13px] font-bold text-[var(--text)] truncate pr-4">{log.diagnosis}</p>
                                    <span className="text-[11px] font-bold text-[var(--text)]/60 shrink-0">
                                        {(log.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-[11px] font-medium text-[var(--text)]/40">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        )) : (
                            <p className="text-[13px] text-[var(--text)]/60 text-center py-8">{t('admin.overview.noActivity', 'No recent activity')}</p>
                        )}
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default OverviewTab;
