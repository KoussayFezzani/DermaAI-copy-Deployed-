import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, ChevronLeft, AlertTriangle } from 'lucide-react';

const LegalPage = ({ type }) => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getContent = () => {
        switch (type) {
            case 'privacy':
                return {
                    title: t('legal.privacy.title', 'Privacy Policy'),
                    content: t('legal.privacy.content', 'Privacy Policy Content...')
                };
            case 'terms':
                return {
                    title: t('legal.terms.title', 'Terms of Service'),
                    content: t('legal.terms.content', 'Terms of Service Content...')
                };
            case 'cookies':
                return {
                    title: t('legal.cookies.title', 'Cookie Policy'),
                    content: t('legal.cookies.content', 'Cookie Policy Content...')
                };
            case 'disclaimer':
                return {
                    title: t('legal.disclaimer.title', 'Medical Disclaimer'),
                    content: t('legal.disclaimer.content', 'This application is for educational and experimental purposes only...')
                };
            default:
                return {
                    title: 'Page Not Found',
                    content: 'The requested page does not exist.'
                };
        }
    };

    const { title, content } = getContent();

    return (
        <div className="container py-24 max-w-4xl space-y-12 animate-in fade-in duration-1000">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-colors">
                <ChevronLeft size={16} /> Return to Terminal
            </Link>

            <header className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mono text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} /> Legal Encryption Protocol
                </div>
                <h1 className="text-5xl lg:text-7xl">{title}</h1>
            </header>

            <div className="card !p-12 space-y-8 bg-gradient-to-br from-[var(--card-bg)] to-primary/5">
                <div className="flex items-center gap-4 pb-8 border-b border-[var(--border)] opacity-60">
                    <FileText size={24} className="text-primary" />
                    <span className="mono text-xs uppercase tracking-widest font-bold">Document Version 2.0.4 — Revision Clinical</span>
                </div>

                <div className="prose prose-invert max-w-none text-muted leading-relaxed space-y-6" style={{ whiteSpace: 'pre-line' }}>
                    {content}
                </div>

                {type === 'disclaimer' && (
                    <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-4">
                        <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold uppercase tracking-wider tabular-nums">Critical Notice</h3>
                        </div>
                        <p className="text-sm text-red-800/80 leading-relaxed italic font-medium">
                            {t('legal.disclaimer.warning', 'This AI tool is NOT a substitute for professional medical advice...')}
                        </p>
                    </div>
                )}
            </div>
            
            <footer className="text-center pt-12 border-t border-[var(--border)]">
                <p className="text-xs text-muted mono uppercase tracking-widest">End of Document Chain</p>
            </footer>
        </div>
    );
};

export default LegalPage;
