import React from 'react';

/**
 * Inline status badge with animated pulse dot.
 */
const StatusBadge = ({ status }) => {
    const good = ['Online', 'Active', 'Connected', 'Loaded', 'Operational'];
    const warn = ['Not Found'];
    const isGood = good.includes(status);
    const isWarn = warn.includes(status);
    return (
        <span className={`inline-flex items-center justify-center gap-1.5 w-[120px] py-1.5 rounded-lg text-[11px] font-bold border ${
            isGood ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
            isWarn ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                     'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGood ? 'bg-emerald-500' : isWarn ? 'bg-amber-500' : 'bg-red-500'}`} />
            {status}
        </span>
    );
};

export default StatusBadge;
