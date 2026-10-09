import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Scan, FileText, UserCheck, ArrowRight, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            id: 0,
            icon: Upload,
            color: 'bg-[rgba(238,243,250,0.1)]',
            title: t('home.howItWorks.step1.title'),
            description: t('home.howItWorks.step1.description'),
            image: "https://images.unsplash.com/photo-1555431189-0fabf2667795?auto=format&fit=crop&q=80&w=800&h=600"
        },
        {
            id: 1,
            icon: Scan,
            color: 'bg-[rgba(238,243,250,0.2)]',
            title: t('home.howItWorks.step2.title'),
            description: t('home.howItWorks.step2.description'),
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800&h=600"
        },
        {
            id: 2,
            icon: FileText,
            color: 'bg-[rgba(238,243,250,0.3)]',
            title: t('home.howItWorks.step3.title'),
            description: t('home.howItWorks.step3.description'),
            image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800&h=600" // Result/Report concept
        },
        {
            id: 3,
            icon: UserCheck,
            color: 'bg-[rgba(238,243,250,0.4)]',
            title: t('home.howItWorks.step4.title'),
            description: t('home.howItWorks.step4.description'),
            image: "https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80&w=800&h=600" // Doctor
        }
    ];

    // Auto-advance loop
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 5000); // 5 seconds per slide
        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <section className="py-24 bg-[var(--bg)] dark:bg-[var(--bg)] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium mb-4"
                    >
                        <span className="w-2 h-2 rounded-full bg-[rgba(238,243,250,0.9)] animate-pulse"></span>
                        {t('home.howItWorks.title')}
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-[var(--bg)] mb-6"
                    >
                        {t('home.howItWorks.subtitle')}
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Interactive Steps List */}
                    <div className="space-y-6">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                onClick={() => setActiveStep(index)}
                                className={`relative pl-8 p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${activeStep === index
                                    ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-lg scale-105'
                                    : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                                    }`}
                            >
                                {/* Connecting Line */}
                                {index !== steps.length - 1 && (
                                    <div className="absolute left-[2.95rem] top-16 bottom-0 w-px bg-slate-200 dark:bg-slate-800 h-[calc(100%+24px)] z-0"></div>
                                )}

                                <div className="flex items-start gap-6 relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${activeStep === index ? step.color + ' text-[var(--bg)] shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${activeStep === index ? 'text-slate-900 dark:text-[var(--bg)]' : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                            {step.title}
                                        </h3>
                                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${activeStep === index ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                            {step.description}
                                        </p>
                                    </div>
                                    {activeStep === index && (
                                        <motion.div
                                            layoutId="active-arrow"
                                            className="hidden md:flex text-[rgba(238,243,250,0.9)]"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Dynamic Visual/Image */}
                    <div className="relative h-[400px] md:h-[500px] w-full [perspective:500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 50, rotateY: -10 }}
                                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                exit={{ opacity: 0, x: -50, rotateY: 10 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border-4 border-[var(--bg)] dark:border-slate-800"
                            >
                                <img
                                    src={steps[activeStep].image}
                                    alt={steps[activeStep].title}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                                    <div className="absolute bottom-0 left-0 p-8 text-[var(--bg)]">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg)]/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
                                            Step 0{activeStep + 1}
                                        </div>
                                        <h3 className="text-2xl font-bold">{steps[activeStep].title}</h3>
                                    </div>
                                </div>

                                {/* Floating Progress Indicator */}
                                <div className="absolute top-6 right-6 w-12 h-12 relative flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="text-[var(--bg)]/20"
                                        />
                                        <motion.circle
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 5, ease: "linear", repeat: 0 }}
                                            cx="24"
                                            cy="24"
                                            r="20"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="text-[var(--bg)]"
                                        />
                                    </svg>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Decorative background blurs behind the card */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary-500/20 rounded-full blur-[100px] -z-10 transition-colors duration-500`}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
