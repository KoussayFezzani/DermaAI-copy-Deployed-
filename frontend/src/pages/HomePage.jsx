import React, { useState, useEffect, useRef } from 'react';
import { Microscope, Activity, CheckCircle, Shield, Zap, Heart, ArrowRight, Sparkles, Brain, Eye, FileText, Upload, Search, FileCheck, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { API_ENDPOINTS } from '../utils/apiConfig';


// ─── IMMERSIVE PARALLAX REVEAL ──────────────────────────────────────────────
const RevealSection = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.01 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
                duration: 1,
                delay,
                ease: [0.22, 1, 0.36, 1]
            }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

const HomePage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { scrollYProgress } = useScroll();

    // Parallax logic: hero section fading and drifting
    const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -80]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

    const [stats, setStats] = useState({
        accuracy: '[invalid]',
        totalScans: '[invalid]',
        totalUsers: '[invalid]'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.STATS_GLOBAL);
                if (response.ok) {

                    const data = await response.json();
                    setStats({
                        accuracy: `${(data.accuracy * 100).toFixed(0)}%`,
                        totalScans: data.totalScans > 1000 ? `${(data.totalScans / 1000).toFixed(1)}K+` : data.totalScans,
                        totalUsers: data.totalUsers > 1000 ? `${(data.totalUsers / 1000).toFixed(1)}K+` : data.totalUsers
                    });
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };
        fetchStats();
    }, []);



    return (
        <div className="flex flex-col bg-transparent selection:bg-[var(--text)] selection:text-[var(--bg)]">
            {/* ── BACKGROUND LAYERS ───────────────────────────────────────────── */}


            {/* ── HERO SECTION ────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <motion.div
                    style={{ y: heroY }}
                    className="container relative z-20 max-w-6xl px-6"
                >
                    <RevealSection>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            {/* LEFT: IMAGE */}
                            <div className="flex justify-center md:justify-start">
                                <img 
                                    src="/src/assets/why-skinvision_bg.jpeg" 
                                    alt="Skin Vision Scan" 
                                    className="rounded-2xl shadow-2xl object-cover max-w-full"
                                    style={{ border: '2px solid var(--border)', maxHeight: '400px' }}
                                />
                            </div>

                            {/* RIGHT: TEXT */}
                            <div className="text-left">
                                <p className="mb-6" style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--text)', fontWeight: 800 }}>
                                    {t('home.hero.kicker', 'Neural Screening Protocol')}
                                </p>
                                <h1 className="mb-8" style={{ fontSize: 'clamp(3rem, 5vw, 6rem)', fontWeight: 700, lineHeight: 0.9 }}>
                                    {t('home.hero.title1', 'Intelligent')} <br />
                                    <span style={{ color: 'var(--text)', opacity: 0.7 }}>
                                        {t('home.hero.title2', 'Analysis')}
                                    </span>
                                </h1>
                                <p className="mb-10" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.125rem)', fontWeight: 500, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '500px' }}>
                                    {t('home.hero.description', 'Bridging the gap between patient observation and clinical certainty. High-performance AI detection for early skin health insights.')}
                                </p>

                                <div className="flex justify-start gap-4">
                                    <Link
                                        to="/scan"
                                        className="btn-a px-10 py-4 text-xs font-bold uppercase tracking-widest"
                                        style={{ background: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }}
                                    >
                                        SCAN NOW
                                    </Link>
                                    <Link
                                        to="/about"
                                        className="btn-b px-10 py-4 text-xs font-bold uppercase tracking-widest"
                                        style={{ background: 'transparent', color: 'var(--text)', borderColor: 'var(--text)' }}
                                    >
                                        LEARN MORE
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </motion.div>
            </section>

            {/* ── FEATURES GRID ───────────────────────────────────────────────── */}
            <section className="py-40 container relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Brain,
                            title: t('home.features.ai.title', 'Neural Scan'),
                            desc: t('home.features.ai.desc', 'Deep learning models trained on 10,000+ clinical cases for 92% diagnostic accuracy.')
                        },
                        {
                            icon: Shield,
                            title: t('home.features.privacy.title', 'Clinical Trust'),
                            desc: t('home.features.privacy.desc', 'Encrypted data handling ensures your medical privacy is never compromised.')
                        },
                        {
                            icon: Activity,
                            title: t('home.features.tracking.title', 'Live Tracking'),
                            desc: t('home.features.tracking.desc', 'Monitor lesion evolution over time with our automated history mapping tool.')
                        },
                    ].map((feature, i) => (
                        <RevealSection key={i} delay={i * 0.12}>
                            <motion.div
                                whileHover={{
                                    y: -8,
                                    borderColor: 'var(--border-hover)',
                                    background: 'var(--surface-hover)'
                                }}
                                style={{
                                    background: 'transparent',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1.5px solid var(--border)',
                                    borderRadius: '1.25rem',
                                    padding: '3rem',
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        padding: '2rem',
                                        opacity: 0.06,
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <feature.icon size={120} strokeWidth={1} />
                                </div>
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-xl transition-all group-hover:scale-110" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
                                    <feature.icon size={32} />
                                </div>
                                <h3 className="text-3xl mb-6" style={{ color: 'var(--text)' }}>{feature.title}</h3>
                                <p className="text-lg leading-relaxed font-medium" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                            </motion.div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            <section
                style={{
                    background: 'transparent',
                    color: 'var(--text)',
                    padding: '10rem 0',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            { val: stats.accuracy, label: t('home.stats.accuracy', 'Accuracy') },
                            { val: stats.totalScans, label: t('home.stats.totalScans', 'Scans Performed') },
                            { val: stats.totalUsers, label: t('home.stats.users', 'Verified Users') },
                        ].map((stat, i) => (
                            <RevealSection key={i} delay={i * 0.12}>
                                <motion.div
                                    whileHover={{ background: 'var(--surface-hover)', y: -10 }}
                                    style={{
                                        padding: '4rem 2rem',
                                        borderRadius: '2rem',
                                        transition: 'all 0.5s var(--ease-out-expo)',
                                        border: '1.5px solid transparent'
                                    }}
                                    className="space-y-4 hover:border-[var(--text)]/10 group"
                                >
                                    <h2 style={{ fontSize: 'clamp(3.5rem, 6vw, 6rem)', fontWeight: 700, letterSpacing: '-0.04em' }}>
                                        {stat.val}
                                    </h2>
                                    <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: 800, opacity: 0.5 }} className="group-hover:opacity-100 transition-opacity">
                                        {stat.label}
                                    </p>
                                </motion.div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-60 relative overflow-hidden">
                <div className="container text-center max-w-4xl px-6">
                    <RevealSection>
                        <h2 className="text-7xl md:text-[8rem] mb-12">
                            Ready <br />
                            <span style={{ color: 'var(--text)', opacity: 0.7 }}>To Consult?</span>
                        </h2>
                    </RevealSection>
                    <RevealSection delay={0.12}>
                        <div className="flex justify-center mt-20">
                            <div className="btn-pair">
                                <Link
                                    to="/scan"
                                    className="px-20 py-8 rounded-full font-black uppercase tracking-[0.3em] text-lg transition-all duration-500 shadow-2xl hover:scale-105"
                                    style={{ background: 'var(--text)', color: 'var(--bg)' }}
                                >
                                    {t('cta.button', 'Start Now')}
                                </Link>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
