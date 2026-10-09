import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';
import ResultsDisplay from '../components/ResultsDisplay';
import BodyMap from '../components/BodyMap';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Activity, ChevronRight, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../utils/apiConfig';

const ScanPage = ({ onResult }) => {
    const { t } = useTranslation();
    const [result, setResult] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);
    const [step, setStep] = useState(0); // 0: Upload, 1: Body Part
    const [capturedFile, setCapturedFile] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleNext = (file) => {
        setCapturedFile(file);
        setStep(1);
    };

    const handleAnalyze = async (part = selectedPart) => {
        if (!capturedFile) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', capturedFile);
        if (part) {
            formData.append('body_part', part);
        }

        let token = localStorage.getItem('token');
        const headers = {};
        if (token && token !== "null") headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(API_ENDPOINTS.UPLOAD_DIAGNOSIS, {
                method: 'POST',
                headers: headers,
                body: formData,
            });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('scan.error.upload_failed', 'Analysis failed.'));
            }

            const data = await response.json();
            setResult(data);
            if (onResult) onResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-[calc(100vh-80px)] ${result ? '' : 'container py-12 mesh-bg'}`} id="results-section">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="min-h-[60vh] flex flex-col items-center justify-center space-y-8"
                    >
                        <div className="relative w-72 h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20">
                            {capturedFile && (
                                <img
                                    src={URL.createObjectURL(capturedFile)}
                                    alt="Scanning"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                            {/* Scanning Grid */}
                            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(8, 18, 45, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 18, 45, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            {/* Laser Line */}
                            <div className="laser-line"></div>
                            <Scan className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[rgba(238,243,250,0.9)] opacity-50 w-32 h-32" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text serif"
                                style={{ backgroundImage: 'linear-gradient(90deg, rgba(8, 18, 45, 0.9), rgba(8, 18, 45, 0.6))' }}>
                                Analyzing Lesion...</h2>
                            <p className="font-medium mono uppercase tracking-widest text-xs flex items-center justify-center gap-2" style={{ color: 'rgba(8, 18, 45, 0.6)' }}>
                                <Activity className="animate-pulse text-[rgba(238,243,250,0.9)]" size={14} /> AI Processing Layer
                            </p>
                        </div>
                    </motion.div>
                ) : !result ? (
                    <motion.div
                        key="upload-flow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                    >
                        <header className="max-w-3xl mb-12 space-y-4">
                            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight serif" style={{ color: 'rgba(8, 18, 45, 0.9)' }}>
                                {t('scan.title')} <span style={{ color: 'rgba(8, 18, 45, 0.9)' }}>{t('scan.titleSpan')}</span>
                            </h1>
                            <p className="text-xl text-[rgba(238,243,250,0.6)] font-medium">
                                {step === 0 ? t('scan.subtitle') : 'Specify the location of the lesion for contextual AI accuracy.'}
                            </p>
                        </header>

                        <div className="flex flex-col items-center w-full">
                            {step === 0 ? (
                                <motion.div
                                    className="max-w-2xl w-full"
                                    layoutId="uploadContainer"
                                >
                                    <ImageUpload onNext={handleNext} onPreview={setPreviewFile} />
                                </motion.div>
                            ) : (
                                /* ── UNIFIED BODY MAP CARD ─────────────────────────────── */
                                <motion.div
                                    className="max-w-sm w-full"
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_20px_60px_rgba(8,18,45,0.12)] overflow-hidden">
                                        <BodyMap selectedPart={selectedPart} onSelect={setSelectedPart} />

                                        {/* ── ACTIONS ── */}
                                        <div className="px-8 pb-8 pt-5 flex flex-col gap-3">
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]"
                                                >
                                                    <ShieldAlert size={15} />
                                                    <span className="font-medium">{error}</span>
                                                </motion.div>
                                            )}

                                            {/* Primary: Start analysis — enabled only when zone selected */}
                                            <button
                                                onClick={() => handleAnalyze(selectedPart)}
                                                disabled={!selectedPart}
                                                className="w-full py-4 rounded-xl bg-[var(--text)] text-[rgba(255,255,255,0.95)] font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(8,18,45,0.25)] hover:bg-[var(--text)]/90 hover:scale-[1.01] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                Start analysis <ChevronRight size={18} strokeWidth={2.5} />
                                            </button>

                                            {/* Secondary row */}
                                            <div className="flex gap-3">
                                                {/* Destructive: go back — muted, red on hover */}
                                                <button
                                                    onClick={() => { setStep(0); setCapturedFile(null); setSelectedPart(null); }}
                                                    className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-[var(--text)] hover:text-red-500 hover:bg-red-50 border border-[var(--text)]/10 hover:border-red-200 transition-all"
                                                >
                                                    ← Go back
                                                </button>
                                                {/* Skip: secondary — muted outline */}
                                                <button
                                                    onClick={() => handleAnalyze(null)}
                                                    className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-[var(--text)] hover:text-[var(--text)] border border-[var(--text)]/10 hover:border-[var(--text)]/25 hover:bg-[var(--text)]/5 transition-all"
                                                >
                                                    Skip zone
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        {/* ── Transparent anchor bar ── */}
                        <div className="w-full border-b border-[var(--text)]/8">
                            <div className="container py-4 flex items-center gap-3">
                                <button
                                    onClick={() => { setResult(null); setStep(0); setCapturedFile(null); setSelectedPart(null); }}
                                    className="flex items-center gap-2 text-[13px] font-bold text-[var(--text)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--text)]/5"
                                >
                                    ← New scan
                                </button>
                                <span className="text-[var(--text)]">|</span>
                                <span className="text-[13px] font-medium text-[var(--text)]">Diagnostic Report</span>
                            </div>
                        </div>
                        {/* ── Results content ── */}
                        <div className="container py-10">
                            <ResultsDisplay result={result} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default ScanPage;
