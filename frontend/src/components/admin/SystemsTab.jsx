import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardCard from './DashboardCard';
import StatusBadge from './StatusBadge';

const SystemsTab = ({ stats }) => {
    const { t } = useTranslation();
    
    const services = [
        {
            name: t('admin.systems.identity', 'Identity Service (JWT)'),
            detail: 'Flask-JWT-Extended · bcrypt',
            status: t('admin.systems.online', 'Online'),
        },
        {
            name: t('admin.systems.aiModel', 'AI Model'),
            detail: stats.system_status?.model === 'Loaded' ? t('admin.systems.kerasLoaded', 'Keras model loaded') : t('admin.systems.modelNotFound', 'Model file not found'),
            status: stats.system_status?.model === 'Loaded' ? t('admin.systems.loaded', 'Loaded') : t('admin.systems.notFound', 'Not Found'),
        },
        {
            name: t('admin.systems.database', 'Database (MongoDB)'),
            detail: stats.system_status?.database === 'Connected' ? t('admin.systems.atlasSynced', 'Atlas cluster synced') : t('admin.systems.connFailed', 'Connection failed'),
            status: stats.system_status?.database === 'Connected' ? t('admin.systems.connected', 'Connected') : t('admin.systems.disconnected', 'Disconnected'),
        },
        {
            name: t('admin.systems.newsScraper', 'News Scraper'),
            detail: 'ScienceDaily · MedicalNewsToday',
            status: stats.system_status?.scraper === 'Operational' ? t('admin.systems.operational', 'Operational') : (stats.system_status?.scraper || t('admin.systems.operational', 'Operational')),
        },
        {
            name: t('admin.systems.aiChat', 'AI Chat (Qwen2.5-0.5B)'),
            detail: t('admin.systems.aiChatDetail', 'Local LLM · streaming active'),
            status: t('admin.systems.active', 'Active'),
        },
    ];

    return (
        <DashboardCard
            title={t('admin.systems.health', 'System Health')}
            description={t('admin.systems.healthDesc', 'Real-time status of all platform services')}
            className="max-w-3xl"
        >
            <div className="flex flex-col">
                {services.map((svc, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-[var(--text)]/10 last:border-0">
                        <div>
                            <p className="text-[14px] font-bold text-[var(--text)]">{svc.name}</p>
                            <p className="text-[12px] text-[var(--text)]/60 font-medium mt-0.5">{svc.detail}</p>
                        </div>
                        <StatusBadge status={svc.status} />
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

export default SystemsTab;
