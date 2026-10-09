import React from 'react';

const DashboardCard = ({ title, description, className = '', headerAction, children }) => (
    <div
        className={`backdrop-blur-sm rounded-xl overflow-hidden ${className}`}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
    >
        {/* Minimal Header */}
        {(title) && (
            <div className="flex items-end justify-between px-6 pt-5 pb-2">
                <div>
                    <h3 className="text-base font-bold text-[var(--text)]">{title}</h3>
                    {description && (
                        <p className="text-[13px] text-[var(--text)]/60 mt-0.5">{description}</p>
                    )}
                </div>
                {headerAction && <div className="shrink-0 ml-3">{headerAction}</div>}
            </div>
        )}
        {/* Body */}
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default DashboardCard;
