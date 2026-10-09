import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="w-full border-t border-[var(--border)] pt-16 pb-8 relative overflow-hidden"
            style={{ backgroundColor: 'var(--surface)' }}>

            {/* Subtle clinical mesh */}
            <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(8, 18, 45, 0.05) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full blur-[80px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(8, 18, 45, 0.03) 0%, transparent 70%)' }} />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

                    {/* Brand */}
                    <div className="space-y-5 flex flex-col items-start">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-[10px] logo-icon-grad flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                <span style={{ fontSize: 16 }}>🔬</span>
                            </div>
                            <span className="brand !text-xl">Derma<span>AI</span></span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-muted)' }}>
                            {t('footer.description')}
                        </p>
                        <div className="flex flex-wrap gap-3 pt-1">
                            {[Github, Twitter, Linkedin].map((Icon, i) => (
                                <a key={i} href="#"
                                    className="p-2 rounded-lg border transition-all duration-300 hover:-translate-y-0.5"
                                    style={{
                                        borderColor: 'var(--border)',
                                        backgroundColor: 'rgba(240, 244, 248, 0.2)',
                                        color: 'rgba(8, 18, 45, 0.7)'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(8, 18, 45, 0.9)'; e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'rgba(8, 18, 45, 0.7)'; }}
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-[0.12em] mb-5" style={{ color: 'rgba(8, 18, 45, 0.9)' }}>{t('footer.platform')}</h4>
                        <ul className="space-y-3">
                            <li><Link to="/scan"  className="text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{t('footer.links.scan')}</Link></li>
                            <li><Link to="/blog"  className="text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{t('footer.links.blog')}</Link></li>
                            <li><Link to="/about" className="text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{t('footer.links.about')}</Link></li>
                            <li><Link to="/diseases" className="text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>Disease Encyclopedia</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-bold text-xs uppercase tracking-[0.12em] mb-5" style={{ color: 'rgba(8, 18, 45, 0.9)' }}>{t('footer.legal')}</h4>
                        <ul className="space-y-3">
                            <li><Link to="/privacy"    className="text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{t('footer.legalLinks.privacy')}</Link></li>
                            <li><Link to="/terms"      className="text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{t('footer.legalLinks.terms')}</Link></li>
                            <li><Link to="/cookies"    className="text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{t('footer.legalLinks.cookies')}</Link></li>
                            <li><Link to="/disclaimer" className="text-sm font-medium transition-all duration-200 hover:translate-x-1 inline-block" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{t('footer.legalLinks.disclaimer')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-5">
                        <h4 className="font-bold text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(8, 18, 45, 0.9)' }}>{t('support.contact.email.title')}</h4>
                        <a href="mailto:koussayfazani@gmail.com"
                            className="inline-flex items-center gap-3 text-sm font-bold transition-all"
                            style={{ color: 'rgba(8, 18, 45, 0.9)' }}
                        >
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(240, 244, 248, 0.3)' }}>
                                <Mail size={16} style={{ color: 'rgba(8, 18, 45, 0.9)' }} />
                            </div>
                            koussayfazani@gmail.com
                        </a>
                        {/* AI Badge */}
                        <div className="badge-ai w-fit">
                            ★ AI-Powered
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t flex flex-col lg:flex-row justify-between items-center gap-4"
                    style={{ borderColor: 'var(--border)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] mono" style={{ color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} DermaAI. {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(240, 244, 248, 0.4)', color: 'rgba(8, 18, 45, 0.8)' }}>
                        {t('footer.madeWith')}
                        <Heart size={13} className="animate-pulse mx-0.5" style={{ color: 'rgba(8, 18, 45, 0.8)', fill: 'rgba(8, 18, 45, 0.8)' }} />
                        {t('footer.forHealth')}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
