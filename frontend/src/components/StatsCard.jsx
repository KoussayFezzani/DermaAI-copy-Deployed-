import React, { useEffect, useRef, useState } from 'react';

const StatsCard = ({ icon: Icon, label, value, suffix = '', color = 'primary', delay = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current = Math.min(current + increment, value);
            setDisplayValue(current);

            if (step >= steps) {
                clearInterval(timer);
                setDisplayValue(value);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [isVisible, value]);

    const colorClasses = {
        primary: 'from-primary-500 to-primary-600 shadow-primary-500/20',
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
        green: 'from-green-500 to-green-600 shadow-green-500/20',
        purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
        amber: 'from-amber-500 to-amber-600 shadow-amber-500/20'
    };

    const iconBgClasses = {
        primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    };

    return (
        <div
            ref={cardRef}
            className="bg-[var(--bg)] dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-3xl font-bold text-slate-900 dark:text-[var(--bg)]">
                    {suffix === '%'
                        ? `${Math.round(displayValue)}${suffix}`
                        : Math.round(displayValue).toLocaleString() + suffix
                    }
                </p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {label}
                </p>
            </div>

            {/* Gradient accent */}
            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${colorClasses[color]} shadow-lg`} />
        </div>
    );
};

export default StatsCard;
