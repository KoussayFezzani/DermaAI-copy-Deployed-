import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import { Activity, Users, Shield, TrendingUp } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../utils/apiConfig';

const StatsSection = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.STATS_GLOBAL);

            if (!response.ok) throw new Error('Failed to fetch statistics');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err.message);
            // Use fallback data on error
            setStats({
                totalScans: '[invalid]',
                accuracy: '[invalid]',
                riskDistribution: { high: '[invalid]', medium: '', low: '' },
                totalUsers: '[invalid]'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-[var(--bg)] mb-4">
                            {t('home.stats.title')}
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            {/* Fallback or generic loading text if needed, or just keep structure */}
                            {t('home.stats.loading')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-[var(--bg)] dark:bg-slate-800 rounded-2xl p-6 shadow-lg animate-pulse">
                                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4"></div>
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    const riskPercentage = stats.riskDistribution.high + stats.riskDistribution.medium;

    return (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 animate-fade-in">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4 border border-primary-100 dark:border-primary-800">
                        {t('home.stats.platformStats')}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-[var(--bg)] mb-4">
                        {t('home.stats.title')}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        {t('home.stats.realTimeStats')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        icon={Activity}
                        label={t('home.stats.scans')}
                        value={stats.totalScans}
                        color="primary"
                        delay={0}
                    />
                    <StatsCard
                        icon={Shield}
                        label={t('home.stats.accuracy')}
                        value={stats.accuracy}
                        suffix="%"
                        color="green"
                        delay={100}
                    />
                    <StatsCard
                        icon={TrendingUp}
                        label={t('home.stats.riskIdentified')}
                        value={riskPercentage}
                        suffix="%"
                        color="amber"
                        delay={200}
                    />
                    <StatsCard
                        icon={Users}
                        label={t('home.stats.users')}
                        value={stats.totalUsers}
                        color="purple"
                        delay={300}
                    />
                </div>

                {/* Top Diseases */}
                {stats.topDiseases && stats.topDiseases.length > 0 && (
                    <div className="mt-12 bg-[var(--bg)] dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-[var(--bg)] mb-6">
                            {t('home.stats.mostCommon')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stats.topDiseases.map((disease, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-[var(--bg)] truncate">
                                            {disease.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {t('home.stats.detectionsCount', { count: disease.count })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default StatsSection;
