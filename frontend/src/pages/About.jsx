import React, { useRef } from 'react';
import { Microscope, Users, Mail, MapPin, Stethoscope, Brain, Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

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

const About = () => {
    const { t } = useTranslation();
    const { scrollYProgress } = useScroll();

    const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -80]);

    return (
        <div className="flex flex-col bg-transparent selection:bg-[var(--text)] selection:text-[var(--bg)]">

            {/* ── HERO SECTION ────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{ y: heroY }}
                    className="container relative z-20 text-center max-w-6xl px-6"
                >
                    <RevealSection>
                        <div className="inline-flex w-16 h-16 rounded-full items-center justify-center mx-auto mb-10 shadow-2xl"
                            style={{ background: 'rgba(8, 18, 45, 0.06)', border: '1.5px solid rgba(8, 18, 45, 0.12)' }}>
                            <Microscope size={32} className="text-[var(--text)]" />
                        </div>

                        <h1 className="mb-8" style={{ fontSize: 'clamp(3rem, 7vw, 7rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.85 }}>
                            {t('about.hero.title', 'The Clinical')} <br />
                            <span className="text-stroke" style={{ WebkitTextStroke: '1.5px var(--text)', color: 'rgba(255, 255, 255, 0.4)' }}>
                                {t('about.hero.titleItalic', 'Vanguard')}
                            </span>
                        </h1>
                        <p className="mx-auto mb-16" style={{ fontSize: 'clamp(1rem, 1.3vw, 1.125rem)', fontWeight: 600, color: 'var(--text)', maxWidth: '560px', lineHeight: 1.6 }}>
                            {t('about.hero.subtitle', 'Pioneering the intersection of artificial intelligence and dermatological expertise.')}
                        </p>
                    </RevealSection>
                </motion.div>
            </section>

            {/* ── CORE PILLARS ──────────────────────────────────────────────────── */}
            <section className="py-40 container relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Brain, title: 'Neural Analysis', desc: 'Our Xception architecture is refined on 10,000+ biopsy-verified samples, achieving institutional-grade diagnostic confidence.' },
                        { icon: Shield, title: 'Explainable AI', desc: 'Every analysis includes Grad-CAM visualization, highlighting the exact areas of interest the AI identified.' },
                        { icon: Stethoscope, title: 'Clinical Aid', desc: 'Designed as a screening tool to support healthcare professionals and provide early warnings for patients.' },
                    ].map((item, i) => (
                        <RevealSection key={i} delay={i * 0.12}>
                            <motion.div
                                whileHover={{
                                    y: -8,
                                    borderColor: 'rgba(8, 18, 45, 0.35)',
                                    background: 'rgba(240, 244, 248, 0.95)'
                                }}
                                style={{
                                    background: 'transparent',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1.5px solid rgba(10, 30, 80, 0.12)',
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
                                    <item.icon size={120} strokeWidth={1} />
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-[var(--text)] flex items-center justify-center mb-10 text-[var(--bg)] shadow-xl">
                                    <item.icon size={32} />
                                </div>
                                <h3 className="text-3xl mb-6 text-[var(--text)]">{item.title}</h3>
                                <p className="text-[var(--text)]/70 text-lg leading-relaxed font-medium">{item.desc}</p>
                            </motion.div>
                        </RevealSection>
                    ))}
                </div>
            </section>

            {/* ── MEDICAL DISCLAIMER ───────────────────────────────────────────── */}
            <section className="container py-20 px-6 relative z-10">
                <RevealSection>
                    <motion.div
                        whileHover={{ y: -4, borderColor: 'rgba(8, 18, 45, 0.25)' }}
                        className="flex flex-col md:flex-row items-center gap-10 p-12 rounded-[2rem] relative overflow-hidden"
                        style={{
                            background: 'transparent',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1.5px solid rgba(10, 30, 80, 0.12)',
                            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                        }}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[var(--text)] flex items-center justify-center text-[var(--bg)] shadow-xl shrink-0">
                            <AlertCircle size={32} />
                        </div>
                        <div className="space-y-3">
                            <p className="text-[var(--text)] font-black text-2xl uppercase tracking-tighter leading-none">Institutional Protocol</p>
                            <p className="text-[var(--text)]/70 text-lg font-medium leading-relaxed max-w-4xl">
                                DermaAI results are strictly for screening support. Clinical diagnosis must always be verified by a certified dermatologist through dermatoscopy or biopsy.
                            </p>
                        </div>
                    </motion.div>
                </RevealSection>
            </section>

            {/* ── VISIONARY ────────────────────────────────────────────────────── */}
            <section
                style={{
                    background: 'transparent',
                    color: 'var(--text)',
                    padding: '10rem 0',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <div className="container text-center max-w-4xl px-6">
                    <RevealSection>
                        <h2 style={{ fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: '4rem' }}>
                            The Vision
                        </h2>
                        <div className="flex flex-col items-center space-y-10">
                            <div className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl overflow-hidden"
                                style={{ background: 'rgba(8, 18, 45, 0.04)', border: '1.5px solid rgba(8, 18, 45, 0.12)' }}>
                                <Users size={64} className="text-[var(--text)] opacity-30" />
                            </div>
                            <div className="space-y-4">
                                <h3 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 700 }}>Koussay Fezzani</h3>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ── CONTACT GRID ─────────────────────────────────────────────────── */}
            <section className="py-40 container relative z-10 px-6">
                <div className="max-w-5xl mx-auto">
                    <RevealSection>
                        <h2 className="mb-20 text-center" style={{ fontSize: 'clamp(3rem, 8vw, 8rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
                            Contact
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { icon: Mail, label: 'Transmission', value: 'koussayfazani@gmail.com', href: 'mailto:koussayfazani@gmail.com' },
                                { icon: MapPin, label: 'Coordinates', value: 'Tunisia, Clinical District', href: null },
                            ].map((c, i) => (
                                <RevealSection key={i} delay={i * 0.12}>
                                    <motion.div
                                        whileHover={{
                                            y: -8,
                                            borderColor: 'rgba(8, 18, 45, 0.35)',
                                            background: 'rgba(240, 244, 248, 0.95)'
                                        }}
                                        className="flex items-center gap-8"
                                        style={{
                                            background: 'transparent',
                                            backdropFilter: 'blur(12px)',
                                            WebkitBackdropFilter: 'blur(12px)',
                                            border: '1.5px solid rgba(10, 30, 80, 0.12)',
                                            borderRadius: '1.25rem',
                                            padding: '2.5rem',
                                            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
                                        }}
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--text)] flex items-center justify-center text-[var(--bg)] shadow-xl shrink-0">
                                            <c.icon size={24} />
                                        </div>
                                        <div className="space-y-2">
                                            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: 800, opacity: 0.5 }}>
                                                {c.label}
                                            </p>
                                            {c.href ? (
                                                <a href={c.href} className="text-xl font-black uppercase tracking-tight text-[var(--text)] hover:underline">{c.value}</a>
                                            ) : (
                                                <p className="text-xl font-black uppercase tracking-tight text-[var(--text)]">{c.value}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                </RevealSection>
                            ))}
                        </div>
                    </RevealSection>
                </div>
            </section>


        </div>
    );
};

export default About;
