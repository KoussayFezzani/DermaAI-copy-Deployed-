import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Mail, MessageSquare, ChevronDown, ChevronUp, LifeBuoy } from 'lucide-react';

const Support = () => {
    const { t } = useTranslation();
    const faqs = t('support.questions', { returnObjects: true }) || [];
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <div className="container py-24 space-y-16">
            <header className="max-w-3xl space-y-4 animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mono text-[10px] font-bold uppercase tracking-widest">
                    <LifeBuoy size={14} /> Help Center
                </div>
                <h1 className="text-5xl lg:text-7xl">Support <span className="text-stroke" style={{ WebkitTextStroke: '1.5px var(--text)', color: 'rgba(255, 255, 255, 0.4)' }}>& FAQ.</span></h1>
                <p className="text-xl text-muted font-medium">
                    Everything you need to know about the DermaAI platform, security protocols, and diagnostic accuracy.
                </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-2xl mb-8 flex items-center gap-3">
                        <HelpCircle className="text-primary" size={24} />
                        Frequently Asked Questions
                    </h3>
                    <div className="space-y-4">
                        {faqs.map((f, i) => (
                            <div key={i} className="card !p-0 overflow-hidden border-[var(--border)] hover:border-primary/30 transition-colors">
                                <button 
                                    onClick={() => setOpenIdx(openIdx === i ? null : i)} 
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-primary/5 transition-colors"
                                >
                                    <span className="font-bold">{f.question}</span>
                                    {openIdx === i ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-muted" />}
                                </button>
                                {openIdx === i && (
                                    <div className="p-6 pt-0 bg-primary/5 border-t border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-muted leading-relaxed">{f.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-2xl mb-8">Direct Contact</h3>
                    <div className="card !p-8 space-y-6 hover:shadow-xl transition-shadow bg-gradient-to-br from-[var(--card-bg)] to-primary/5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Mail size={24} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl">Email Support</h4>
                            <p className="text-sm text-muted">For technical inquiries and data privacy requests.</p>
                            <p className="font-bold text-primary">support@dermaai.com</p>
                        </div>
                    </div>

                    <div className="card !p-8 space-y-6 hover:shadow-xl transition-shadow bg-gradient-to-br from-[var(--card-bg)] to-accent/5">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <MessageSquare size={24} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl">Live AI Assistant</h4>
                            <p className="text-sm text-muted">Available 24/7 for immediate platform guidance.</p>
                            <p className="font-bold text-accent">Active Protocol</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
