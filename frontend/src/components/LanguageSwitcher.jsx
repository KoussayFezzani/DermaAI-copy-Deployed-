import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check } from 'lucide-react';

const languages = [
    { code: 'en', label: 'EN', name: 'EN', dir: 'ltr' },
    { code: 'fr', label: 'FR', name: 'FR', dir: 'ltr' },
    { code: 'ar', label: 'AR', name: 'AR', dir: 'rtl' },
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const changeLang = (lang) => {
        i18n.changeLanguage(lang.code);
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.code;
        setOpen(false);
    };

    useEffect(() => {
        const cur = languages.find(l => l.code === i18n.language) || languages[0];
        document.documentElement.dir = cur.dir;
        document.documentElement.lang = cur.code;
    }, [i18n.language]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative" style={{ fontFamily: 'inherit' }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-center gap-1.5 px-4 h-10 rounded-full border text-xs font-bold transition-all"
                style={{
                    borderColor: 'rgba(8, 18, 45, 0.2)',
                    background: 'rgba(240, 244, 248, 0.4)',
                    color: 'rgba(8, 18, 45, 0.9)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(8, 18, 45, 0.9)'; e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(8, 18, 45, 0.2)'; e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'; }}
                aria-label="Change language"
                id="lang-switcher-btn"
            >
                <span className="tracking-wider mono">{currentLang.label}</span>
                <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    style={{ color: 'rgba(8, 18, 45, 0.6)' }}
                />
            </button>

            {open && (
                <div
                    className="absolute top-full mt-2 right-0 z-[300] min-w-[100px] rounded-xl overflow-hidden"
                    style={{
                        background: 'rgba(240, 244, 248, 0.95)',
                        border: '1px solid rgba(8, 18, 45, 0.1)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    {languages.map((lang) => {
                        const isActive = lang.code === currentLang.code;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => changeLang(lang)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 border-none"
                                style={{
                                    background: isActive ? 'rgba(8, 18, 45, 0.1)' : 'transparent',
                                    color: isActive ? 'rgba(8, 18, 45, 0.9)' : 'rgba(8, 18, 45, 0.6)',
                                    fontWeight: isActive ? 700 : 500
                                }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(8, 18, 45, 0.05)'; e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'; }}}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(8, 18, 45, 0.6)'; }}}
                                id={`lang-option-${lang.code}`}
                            >
                                <span className="flex-1 text-center" style={{ direction: 'ltr' }}>{lang.name}</span>
                                {isActive && <Check size={12} style={{ color: 'rgba(8, 18, 45, 0.9)' }} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
