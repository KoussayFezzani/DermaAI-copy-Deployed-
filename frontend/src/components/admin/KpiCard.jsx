import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// Simple fallback sparkline data
const generateSparkline = (trend) => {
    const base = 50;
    const isPositive = trend >= 0;
    return Array.from({ length: 7 }).map((_, i) => ({
        val: base + (isPositive ? i * 5 : -i * 5) + Math.random() * 10
    }));
};

const KpiCard = ({ label, value, trend = 0 }) => {
    const isPositive = trend >= 0;
    const sparklineData = generateSparkline(trend);
    const trendColor = isPositive ? '#10B981' : '#EF4444'; // Emerald for positive, Red for negative

    return (
        <div
            className="rounded-xl p-5 flex items-end justify-between"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
        >
            <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl display-type text-[var(--text)] leading-none tabular-nums">{value}</span>
                    <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                        {isPositive ? '+' : ''}{trend}%
                    </span>
                </div>
                <p className="text-[11px] font-bold text-[var(--text)]/50 uppercase tracking-[0.2em]">{label}</p>
            </div>
            
            <div className="w-24 h-12">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                        <Line 
                            type="monotone" 
                            dataKey="val" 
                            stroke={trendColor} 
                            strokeWidth={2} 
                            dot={false}
                            isAnimationActive={false} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default KpiCard;
