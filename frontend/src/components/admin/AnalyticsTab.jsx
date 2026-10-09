import React from 'react';
import {
    LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';
import DashboardCard from './DashboardCard';

// Monochromatic Navy Scale
const COLORS = ['var(--text)', '#203A61', '#4C6A9C', '#849ECA', '#C4D4E8'];

const TOOLTIP_STYLE = {
    background: 'var(--surface)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--text)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
};

const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
        <div className="flex justify-end gap-4 text-[11px] text-[var(--text)]/60 font-medium">
            {payload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span>{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

const AnalyticsTab = ({ stats }) => {
    const { t } = useTranslation();
    const diagData = stats.diagnosis_distribution || [];
    const weeklyData = stats.weekly_activity || [];

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Diagnosis Distribution Pie */}
            <DashboardCard
                title={t('admin.analytics.diagnosisDist', 'Diagnosis Distribution')}
                description={t('admin.analytics.diagnosisDistDesc', 'Breakdown of all recorded diagnoses')}
            >
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie 
                            data={diagData} 
                            dataKey="count" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={70} 
                            outerRadius={100} 
                            paddingAngle={2} 
                            stroke="none"
                        >
                            {diagData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                    {diagData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-[12px] font-medium text-[var(--text)]/70">{d.name} <span className="font-bold text-[var(--text)] ml-1">{d.count}</span></span>
                        </div>
                    ))}
                </div>
            </DashboardCard>

            {/* Scan Volume Line Chart */}
            <DashboardCard
                title={t('admin.analytics.scanTrend', 'Scan Volume Trend')}
                description={t('admin.analytics.scanTrendDesc', 'Daily scan count over the last week')}
            >
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Legend content={renderCustomLegend} verticalAlign="top" height={36} />
                        <Line 
                            name="Total Scans"
                            type="monotone" 
                            dataKey="scans" 
                            stroke="var(--text)" 
                            strokeWidth={2} 
                            dot={{ fill: 'var(--text)', r: 4, strokeWidth: 0 }} 
                            activeDot={{ r: 6 }} 
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </DashboardCard>
        </div>
    );
};

export default AnalyticsTab;
