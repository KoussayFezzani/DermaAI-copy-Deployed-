import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Download, Loader2, AlertTriangle, CheckCircle2,
    MapPin, BookOpen, TrendingUp, ShieldCheck, ShieldAlert, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { API_BASE_URL } from '../utils/apiConfig';

const BASE_URL = API_BASE_URL;


// ── Risk color: based on confidence %, not diagnosis string alone ─────────────
const getRiskMeta = (confidence = 0, diagnosis = '') => {
    const pct = confidence * 100;
    const d = diagnosis.toLowerCase();
    
    // Explicit uncertain / inconclusive classification
    if (d.includes('inconclusive') || d.includes('uncertain')) {
        return {
            label: 'Uncertain / Inconclusive', ringColor: '#EAB308',
            borderLeft: '#EAB308', Icon: AlertTriangle,
        };
    }

    // Malignant diagnoses always escalate risk signal
    const isMalignant = d.includes('malignant');
    if (isMalignant || pct >= 70) return {
        label: 'High Risk', ringColor: '#DC2626',
        borderLeft: '#DC2626', Icon: ShieldAlert,
    };
    if (pct >= 40) return {
        label: 'Moderate Risk', ringColor: '#D97706',
        borderLeft: '#D97706', Icon: Shield,
    };
    return {
        label: 'Low Risk', ringColor: '#1D9E75',
        borderLeft: '#1D9E75', Icon: ShieldCheck,
    };
};


const SplitDonut = ({ primary, secondary, primaryColor, size = 170 }) => {
    const data = [
        { name: 'Primary', value: primary, fill: primaryColor },
        { name: 'Secondary', value: secondary, fill: '#9ca3af' },    // medium gray
    ];
    return (
        <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%" cy="50%"
                        innerRadius="80%"
                        outerRadius="100%"
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            {/* Center: primary % only */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{primary.toFixed(0)}</span>
                <span style={{ fontSize: 9, color: 'var(--text)', fontFamily: 'monospace', letterSpacing: '0.1em', marginTop: 2 }}>%</span>
            </div>
        </div>
    );
};

// ── Card wrapper — semi-transparent frosted glass ─────────────────────────────
const Panel = ({ children, className = '', style = {}, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay }}
        style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            borderRadius: 16,
            padding: 32,
            border: '1px solid rgba(8, 18, 45, 0.07)',
            boxShadow: '0 4px 24px rgba(8, 18, 45, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            ...style,
        }}
        className={className}
    >
        {children}
    </motion.div>
);

const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-black text-[var(--text)] uppercase tracking-[0.2em] mb-1">{children}</p>
);

// ── Main component ────────────────────────────────────────────────────────────
const ResultsDisplay = ({ result }) => {
    const { t, i18n } = useTranslation();
    const [sliderPos, setSliderPos] = useState(50);
    const [isSliding, setIsSliding] = useState(false);
    const [diseases, setDiseases] = useState([]);
    const [history, setHistory] = useState([]);
    const [exporting, setExporting] = useState(false);
    const sliderContainerRef = useRef(null);
    const reportRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [dRes, hRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/diseases`),
                    fetch(`${BASE_URL}/api/history`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);
                const dData = await dRes.json();
                const hData = await hRes.json();
                setDiseases(dData.diseases || []);
                // oldest-first for the chart
                setHistory(Array.isArray(hData) ? [...hData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : []);
            } catch { }
        };
        load();
    }, []);

    const handleSliderMove = (e) => {
        if (!isSliding || !sliderContainerRef.current) return;
        const rect = sliderContainerRef.current.getBoundingClientRect();
        const clientX = e.clientX ?? e.touches?.[0]?.clientX;
        if (clientX == null) return;
        setSliderPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
    };

    if (!result) return null;

    const {
        diagnosis = '', confidence = 0,
        diagnosis_2 = '', confidence_2 = 0,
        grad_cam_image, image_url, body_part
    } = result;

    const primaryLabel   = diagnosis.split(',')[0].trim();
    const secondaryLabel = (diagnosis_2 || '').split(',')[0].trim();
    const isNormal       = primaryLabel.toLowerCase().includes('normal skin') || primaryLabel === 'Normal Skin (No signs of disease)';
    const risk           = getRiskMeta(confidence, diagnosis);
    const primaryPct     = +(confidence * 100).toFixed(1);
    const secondaryPct   = +(confidence_2 * 100).toFixed(1);

    const diseaseMatch = useMemo(() => {
        const low = diagnosis.toLowerCase();
        return diseases.find(d => low.includes(d.id?.toLowerCase()) || low.includes(d.name?.toLowerCase()));
    }, [diagnosis, diseases]);

    const recommendations = useMemo(() => {
        if (diseaseMatch) return [...(diseaseMatch.prevention || []), diseaseMatch.treatment].filter(Boolean).slice(0, 4);
        return diagnosis.toLowerCase().includes('malignant')
            ? [
                'Consult a board-certified dermatologist immediately.',
                'A biopsy may be required to confirm the diagnosis.',
                'Avoid direct UV exposure on the affected area.',
                'Document any changes in size, shape, or color.',
              ]
            : [
                'Monitor the lesion monthly for changes in size or color.',
                'Annual full-body skin checks are recommended.',
                'Apply SPF 50+ sunscreen daily on all exposed areas.',
                'Consult a dermatologist if any changes occur.',
              ];
    }, [diseaseMatch, diagnosis]);

    // ── History trend: all past scans, oldest-first, deduplicated by date ──────
    const trendData = useMemo(() => {
        // Include current result as the latest point
        const withCurrent = [...history, { ...result, timestamp: new Date().toISOString() }]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Deduplicate by date label to avoid x-axis repeats
        const seen = new Set();
        const deduped = withCurrent.filter(s => {
            const key = new Date(s.timestamp).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return deduped.map(s => ({
            date: new Date(s.timestamp).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }),
            confidence: +(s.confidence * 100).toFixed(1),
        }));
    }, [history, result, i18n.language]);

    const handlePDF = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            // Wait for re-render so UI changes (slider to side-by-side, button hidden)
            await new Promise(resolve => setTimeout(resolve, 400));

            const element = reportRef.current;
            if (!element) return;

            // Temporarily expand element to full height to avoid viewport clipping
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#F8FAFC',
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                width: element.scrollWidth,
                height: element.scrollHeight,
            });

            document.body.style.overflow = prevOverflow;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // Create PDF sized exactly to the captured content
            const customPdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height],
                compress: true,
            });

            customPdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);

            const scanId = result._id ? result._id.slice(-8).toUpperCase() : 'NEW';
            customPdf.save(`DermaAI_Report_${scanId}.pdf`);

        } catch (e) {
            console.error(e);
        } finally {
            setExporting(false);
        }
    };

    return (
        // ── Outer wrapper: semi-transparent frosted glass over hero ──────────
        <div
            ref={reportRef}
            style={{
                background: exporting ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: 20,
                padding: '48px 40px',
            }}
        >
            <div className="w-full space-y-8">

                {/* ── PAGE HEADER ──────────────────────────────────────── */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text)]">Diagnostic Overview</h2>
                        <p className="text-[13px] text-[var(--text)] mt-0.5">
                            AI-powered risk assessment · {new Date().toLocaleDateString(i18n.language, { dateStyle: 'medium' })} {exporting && new Date().toLocaleTimeString(i18n.language, { timeStyle: 'short' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {body_part && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-[var(--text)] bg-[var(--text)]/6 border border-[var(--text)]/12">
                                <MapPin size={11} /> {body_part}
                            </span>
                        )}
                        {exporting ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--text)] text-[rgba(255,255,255,0.95)] text-[13px] font-bold shadow-sm">
                                <CheckCircle2 size={14} /> Report Generated
                            </span>
                        ) : (
                            <button
                                onClick={handlePDF}
                                disabled={exporting}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--text)] text-[rgba(255,255,255,0.95)] text-[13px] font-bold hover:bg-[var(--text)]/85 transition-all disabled:opacity-50 shadow-sm"
                            >
                                <Download size={14} /> Export PDF
                            </button>
                        )}
                    </div>
                </div>

                {/* ── ROW 1: Diagnosis (2/5) + Grad-CAM (3/5) — gap 32px ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 items-stretch" style={{ gap: 32 }}>

                    {/* ── 1a. Diagnosis card — flush left border ──────────── */}
                    <div className="lg:col-span-2" style={{ position: 'relative' }}>
                        {/* Flush left accent border — no radius on left side */}
                        <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                            background: risk.borderLeft, borderRadius: '4px 0 0 4px', zIndex: 1,
                        }} />
                        <Panel
                            style={{
                                borderRadius: '0 16px 16px 0',
                                paddingLeft: 28,
                                height: '100%',
                            }}
                            delay={0.05}
                        >
                            {/* Split donut centered */}
                            <div className="flex flex-col items-center w-full" style={{ gap: 24, flex: 1, justifyItems: 'center', justifyContent: 'center' }}>
                                {!isNormal && (
                                    <SplitDonut
                                        primary={primaryPct}
                                        secondary={secondaryPct}
                                        primaryColor={risk.ringColor}
                                        size={170}
                                    />
                                )}

                                {/* Legend rows */}
                                <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(8,18,45,0.03)' }}>
                                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: risk.ringColor, flexShrink: 0 }} />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wide">Primary</p>
                                            <p className="text-[13px] font-bold text-[var(--text)] truncate">
                                                {primaryLabel} {!isNormal && `— ${primaryPct}%`}
                                            </p>
                                        </div>
                                    </div>
                                    {!isNormal && diagnosis_2 && (
                                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(8,18,45,0.03)' }}>
                                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#9ca3af', flexShrink: 0 }} />
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wide">Secondary</p>
                                                <p className="text-[13px] font-medium text-[var(--text)] truncate">{secondaryLabel} — {secondaryPct}%</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Panel>
                    </div>

                    {/* ── 1b. Grad-CAM slider ───────────────────────────── */}
                    <div className="lg:col-span-3" style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', minHeight: 300 }}>
                        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-[11px] font-bold text-[rgba(255,255,255,0.95)] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Grad-CAM Heatmap
                            </span>
                            {!exporting && <span className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[10px] text-[rgba(255,255,255,0.95)]">Drag ↔ to compare</span>}
                        </div>

                        {exporting ? (
                            <div className="w-full h-full flex" style={{ gap: 16 }}>
                                <div className="flex-1 relative rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
                                    <img src={`${BASE_URL}${image_url}`} alt="Original skin lesion" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                                    <div className="absolute bottom-3 right-3 text-[10px] font-bold text-[rgba(255,255,255,0.95)] bg-black/40 px-2 py-0.5 rounded">Original</div>
                                </div>
                                {grad_cam_image && (
                                    <div className="flex-1 relative rounded-xl overflow-hidden" style={{ minHeight: 300 }}>
                                        <img src={grad_cam_image} alt="Grad-CAM heatmap" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
                                        <div className="absolute bottom-3 left-3 text-[10px] font-bold text-[rgba(255,255,255,0.95)] bg-black/40 px-2 py-0.5 rounded">Heatmap</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                ref={sliderContainerRef}
                            className="relative w-full h-full cursor-ew-resize select-none"
                            style={{ minHeight: 300 }}
                            onMouseDown={() => setIsSliding(true)}
                            onMouseUp={() => setIsSliding(false)}
                            onMouseLeave={() => setIsSliding(false)}
                            onMouseMove={handleSliderMove}
                            onTouchStart={() => setIsSliding(true)}
                            onTouchEnd={() => setIsSliding(false)}
                            onTouchMove={handleSliderMove}
                        >
                            <img src={`${BASE_URL}${image_url}`} alt="Original skin lesion" className="absolute inset-0 w-full h-full object-cover" draggable={false} crossOrigin="anonymous" />
                            {grad_cam_image && (
                                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                                    <img
                                        src={grad_cam_image}
                                        alt="Grad-CAM heatmap"
                                        className="absolute inset-0 h-full object-cover"
                                        draggable={false}
                                        crossOrigin="anonymous"
                                        style={{ width: `${100 * (100 / (sliderPos || 1))}%`, maxWidth: 'none' }}
                                    />
                                </div>
                            )}
                            {/* Slider handle — ↔ icon, never X */}
                            {grad_cam_image && (
                                <div
                                    className="absolute top-0 bottom-0 z-30"
                                    style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {/* Line */}
                                    <div style={{ position: 'absolute', top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }} />
                                    {/* Circle handle with ↔ */}
                                    <div style={{
                                        position: 'relative', zIndex: 1,
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        border: '2px solid rgba(8,18,45,0.15)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'ew-resize',
                                    }}>
                                        {/* ↔ arrow icon */}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M7 16l-4-4 4-4" />
                                            <path d="M17 8l4 4-4 4" />
                                            <line x1="3" y1="12" x2="21" y2="12" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            {grad_cam_image && <div className="absolute bottom-3 left-3 text-[10px] font-bold text-[rgba(255,255,255,0.95)] bg-black/40 px-2 py-0.5 rounded">Heatmap</div>}
                            <div className="absolute bottom-3 right-3 text-[10px] font-bold text-[rgba(255,255,255,0.95)] bg-black/40 px-2 py-0.5 rounded">Original</div>
                        </div>
                        )}
                    </div>
                </div>

                {/* ── ROW 2: Guidance + Trend — gap 24px ───────────────────── */}
                <div className={`grid grid-cols-1 ${exporting ? '' : 'lg:grid-cols-2'}`} style={{ gap: 24 }}>

                    {/* ── 2a. Clinical Guidance ─────────────────────────── */}
                    <Panel delay={0.15} style={{ height: '100%' }}>
                        <div className="flex items-center gap-3 pb-4 border-b border-[var(--text)]/8">
                            <div className="w-8 h-8 rounded-lg bg-[var(--text)]/6 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={16} className="text-[var(--text)]" />
                            </div>
                            <div>
                                <SectionLabel>Action plan</SectionLabel>
                                <h3 className="text-[15px] font-bold text-[var(--text)]">Clinical Guidance</h3>
                            </div>
                        </div>

                        {/* Bullets — teal dots, 14px gap */}
                        <ul className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {recommendations.map((rec, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + i * 0.07 }}
                                    className="flex items-start gap-3 py-2 px-3 rounded-xl hover:bg-[var(--text)]/3 transition-colors"
                                >
                                    {/* Always teal bullet */}
                                    <span style={{ marginTop: 7, width: 7, height: 7, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
                                    <p className="text-[13px] font-medium text-[var(--text)] leading-relaxed">{rec}</p>
                                </motion.li>
                            ))}
                        </ul>

                        {diseaseMatch && (
                            <Link
                                to="/diseases"
                                className="mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-[var(--text)] border border-[var(--text)]/10 hover:border-[var(--text)]/25 hover:bg-[var(--text)]/3 transition-all"
                            >
                                <BookOpen size={14} /> View condition details
                            </Link>
                        )}
                    </Panel>

                    {/* ── 2b. History Trend — teal dot-and-line ──────────── */}
                    {!exporting && (
                    <Panel delay={0.2} style={{ height: '100%' }}>
                        <div className="flex items-center gap-3 pb-4 border-b border-[var(--text)]/8">
                            <div className="w-8 h-8 rounded-lg bg-[var(--text)]/6 flex items-center justify-center shrink-0">
                                <TrendingUp size={16} className="text-[var(--text)]" />
                            </div>
                            <div>
                                <SectionLabel>Confidence score over time</SectionLabel>
                                <h3 className="text-[15px] font-bold text-[var(--text)]">History Trend</h3>
                            </div>
                        </div>

                        {trendData.length >= 2 ? (
                            <div style={{ flex: 1, minHeight: 200, marginTop: 20 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(8,18,45,0.07)" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false} tickLine={false}
                                            tick={{ fill: 'var(--text)', fontSize: 10 }}
                                            dy={6}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            axisLine={false} tickLine={false}
                                            tick={{ fill: 'var(--text)', fontSize: 10 }}
                                            domain={[0, 100]}
                                            dx={-4}
                                            tickFormatter={v => `${v}%`}
                                            label={{
                                                value: 'Confidence %',
                                                angle: -90,
                                                position: 'insideLeft',
                                                offset: 14,
                                                style: { fill: 'var(--text)', fontSize: 9 }
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(8,18,45,0.08)', borderRadius: 10, fontSize: 12 }}
                                            formatter={v => [`${v}%`, 'AI Confidence']}
                                            labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="confidence"
                                            stroke="#1D9E75"
                                            strokeWidth={2.5}
                                            dot={{ fill: 'rgba(255, 255, 255, 0.95)', r: 4.5, strokeWidth: 2.5, stroke: '#1D9E75' }}
                                            activeDot={{ r: 6, fill: '#1D9E75', stroke: 'rgba(255, 255, 255, 0.95)', strokeWidth: 2 }}
                                            animationDuration={900}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 0' }}>
                                <TrendingUp size={28} style={{ color: 'rgba(8,18,45,0.12)', marginBottom: 12 }} />
                                <p className="text-[13px] font-medium text-[var(--text)]">Not enough scans yet to show a trend.</p>
                                <p className="text-[11px] text-[var(--text)] mt-1">Complete a second scan to see your history chart.</p>
                            </div>
                        )}
                    </Panel>
                    )}
                </div>

                {/* ── DISCLAIMER ───────────────────────────────────────── */}
                <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-amber-800 font-medium leading-relaxed">
                        <span className="font-bold">Medical Disclaimer:</span> DermaAI provides AI-based estimation for informational purposes only and does not constitute a clinical diagnosis. Results represent statistical probability. Always consult a qualified dermatologist or healthcare professional before making any medical decisions.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ResultsDisplay;
