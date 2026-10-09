import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Database, FileText } from 'lucide-react';
import DashboardCard from './DashboardCard';

const ExportsTab = ({ onDownload }) => {
    const { t } = useTranslation();
    const BASE = 'http://127.0.0.1:5000';
    
    return (
        <DashboardCard
            title={t('admin.exports.title', 'Data Exports')}
            description={t('admin.exports.desc', 'Download platform data for backup or research purposes')}
        >
            <div className="flex flex-col gap-6">
                
                {/* Full Database Backup */}
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                            <Database size={20} className="text-[var(--text)]" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-[var(--text)]">{t('admin.exports.backupTitle', 'Full Database Backup')}</h3>
                            <p className="text-[12px] text-[var(--text)]/60 mt-0.5">{t('admin.exports.backupDesc', 'All users and scan history as a timestamped JSON archive.')}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onDownload(`${BASE}/api/admin/backup`, 'dermaai_full_backup.json')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                        <Download size={16} />
                        {t('admin.exports.backupBtn', 'Download Backup')}
                    </button>
                </div>

                {/* Research Export */}
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                            <FileText size={20} className="text-[var(--text)]" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-[var(--text)]">{t('admin.exports.researchTitle', 'Anonymized Research Export')}</h3>
                            <p className="text-[12px] text-[var(--text)]/60 mt-0.5">{t('admin.exports.researchDesc', 'Scan history with all personal identifiers removed.')}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onDownload(`${BASE}/api/admin/export-research`, 'dermaai_research_data.json')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-sm"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                        <Download size={16} />
                        {t('admin.exports.researchBtn', 'Download Export')}
                    </button>
                </div>
            </div>
        </DashboardCard>
    );
};

export default ExportsTab;
