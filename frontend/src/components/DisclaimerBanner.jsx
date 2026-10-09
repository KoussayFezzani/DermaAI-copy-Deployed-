import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const DisclaimerBanner = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div 
            className="bg-[var(--text)]/10 border-b border-[var(--text)]/20 text-[var(--text)] py-3 relative overflow-hidden backdrop-blur-md z-[1100]"
        >
            <div className="container flex flex-col md:flex-row items-center justify-center gap-4 text-center px-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                    <ShieldAlert size={16} />
                    <span>Important Information</span>
                </div>
                <p className="text-[11px] md:text-xs font-medium max-w-3xl opacity-80 leading-relaxed italic">
                    {t('banner.disclaimer', 'DermaAI is an AI-driven educational tool. High confidence scores are not medical diagnoses. Always consult a board-certified dermatologist for skin concerns.')}
                </p>
                <div className="flex items-center gap-4">
                    <Link 
                        to="/disclaimer" 
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:gap-2 transition-all group"
                    >
                        View More Info <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-primary/10 rounded-full transition-colors"
                        aria-label="Close disclaimer"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerBanner;
