import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlipHorizontal2, CheckCircle2 } from 'lucide-react';

// Body zones grouped by anatomical region — used for the body diagram
const FRONT_PARTS = [
    // Head / face
    { id: 'face',         label: 'Face',                d: 'M 42 8 Q 50 2 58 8 L 59 20 Q 50 26 41 20 Z' },
    { id: 'neck_f',       label: 'Neck',                d: 'M 45 26 L 55 26 L 56 32 L 44 32 Z' },
    // Torso
    { id: 'chest',        label: 'Chest',               d: 'M 34 32 L 66 32 L 68 52 L 32 52 Z' },
    { id: 'abdomen',      label: 'Abdomen',             d: 'M 32 52 L 68 52 L 66 72 L 34 72 Z' },
    // Shoulders
    { id: 'r_shoulder',   label: 'Right Shoulder',      d: 'M 34 32 C 22 30 20 40 20 46 L 32 52 Z' },
    { id: 'l_shoulder',   label: 'Left Shoulder',       d: 'M 66 32 C 78 30 80 40 80 46 L 68 52 Z' },
    // Arms
    { id: 'r_upper_arm',  label: 'Right Upper Arm',     d: 'M 20 46 L 14 68 L 26 70 L 32 52 Z' },
    { id: 'l_upper_arm',  label: 'Left Upper Arm',      d: 'M 80 46 L 86 68 L 74 70 L 68 52 Z' },
    { id: 'r_forearm',    label: 'Right Forearm',       d: 'M 14 68 L 8 92 L 20 93 L 26 70 Z' },
    { id: 'l_forearm',    label: 'Left Forearm',        d: 'M 86 68 L 92 92 L 80 93 L 74 70 Z' },
    { id: 'r_hand',       label: 'Right Hand',          d: 'M 8 92 L 12 108 L 20 107 L 20 93 Z' },
    { id: 'l_hand',       label: 'Left Hand',           d: 'M 80 93 L 80 107 L 88 108 L 92 92 Z' },
    // Legs
    { id: 'r_thigh',      label: 'Right Thigh',         d: 'M 34 72 L 49 72 L 46 110 L 30 110 Z' },
    { id: 'l_thigh',      label: 'Left Thigh',          d: 'M 51 72 L 66 72 L 70 110 L 54 110 Z' },
    { id: 'r_shin',       label: 'Right Shin',          d: 'M 30 110 L 46 110 L 43 147 L 28 147 Z' },
    { id: 'l_shin',       label: 'Left Shin',           d: 'M 54 110 L 70 110 L 72 147 L 57 147 Z' },
    { id: 'r_foot',       label: 'Right Foot',          d: 'M 28 147 L 43 147 L 40 155 L 24 155 Z' },
    { id: 'l_foot',       label: 'Left Foot',           d: 'M 57 147 L 72 147 L 76 155 L 60 155 Z' },
];

const BACK_PARTS = [
    { id: 'scalp',        label: 'Scalp',               d: 'M 42 8 Q 50 2 58 8 L 59 20 Q 50 26 41 20 Z' },
    { id: 'nape',         label: 'Nape (Neck)',         d: 'M 45 26 L 55 26 L 56 32 L 44 32 Z' },
    { id: 'upper_back',   label: 'Upper Back',          d: 'M 34 32 L 66 32 L 68 52 L 32 52 Z' },
    { id: 'lower_back',   label: 'Lower Back',          d: 'M 32 52 L 68 52 L 66 72 L 34 72 Z' },
    { id: 'l_shoulder_b', label: 'Left Shoulder (Back)',d: 'M 34 32 C 22 30 20 40 20 46 L 32 52 Z' },
    { id: 'r_shoulder_b', label: 'Right Shoulder (Back)',d: 'M 66 32 C 78 30 80 40 80 46 L 68 52 Z' },
    { id: 'l_upper_arm_b',label: 'Left Upper Arm (Back)',d: 'M 20 46 L 14 68 L 26 70 L 32 52 Z' },
    { id: 'r_upper_arm_b',label: 'Right Upper Arm (Back)',d: 'M 80 46 L 86 68 L 74 70 L 68 52 Z' },
    { id: 'l_forearm_b',  label: 'Left Forearm (Back)', d: 'M 14 68 L 8 92 L 20 93 L 26 70 Z' },
    { id: 'r_forearm_b',  label: 'Right Forearm (Back)',d: 'M 86 68 L 92 92 L 80 93 L 74 70 Z' },
    { id: 'l_glute',      label: 'Left Gluteal',        d: 'M 34 72 L 49 72 L 46 90 L 30 90 Z' },
    { id: 'r_glute',      label: 'Right Gluteal',       d: 'M 51 72 L 66 72 L 70 90 L 54 90 Z' },
    { id: 'l_hamstring',  label: 'Left Hamstring',      d: 'M 30 90 L 46 90 L 43 120 L 28 120 Z' },
    { id: 'r_hamstring',  label: 'Right Hamstring',     d: 'M 54 90 L 70 90 L 72 120 L 57 120 Z' },
    { id: 'l_calf',       label: 'Left Calf',           d: 'M 28 120 L 43 120 L 41 147 L 27 147 Z' },
    { id: 'r_calf',       label: 'Right Calf',          d: 'M 57 120 L 72 120 L 73 147 L 58 147 Z' },
    { id: 'l_heel',       label: 'Left Heel',           d: 'M 27 147 L 41 147 L 39 155 L 24 155 Z' },
    { id: 'r_heel',       label: 'Right Heel',          d: 'M 58 147 L 73 147 L 76 155 L 61 155 Z' },
];

const ALL_PARTS = [...FRONT_PARTS, ...BACK_PARTS];

export default function BodyMap({ selectedPart, onSelect }) {
    const { t } = useTranslation();
    const [isFront, setIsFront] = useState(true);
    const parts = isFront ? FRONT_PARTS : BACK_PARTS;
    const selectedLabel = ALL_PARTS.find(p => p.id === selectedPart)?.label;

    return (
        <div className="w-full bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_20px_60px_rgba(8,18,45,0.12)] overflow-hidden">

            {/* ── HEADER ─────────────────────────────────────────── */}
            <div className="px-8 pt-8 pb-0 flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text)]">Lesion Location</h3>
                    <p className="text-[13px] text-[var(--text)]/50 font-medium mt-0.5">
                        Tap a body zone to tag where this scan was taken
                    </p>
                </div>
                {/* Front / Back toggle */}
                <button
                    onClick={() => { setIsFront(f => !f); onSelect(null); }}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--text)]/70 bg-[var(--text)]/6 hover:bg-[var(--text)]/10 border border-[var(--text)]/10 px-3 py-1.5 rounded-full transition-all"
                >
                    <FlipHorizontal2 size={13} />
                    {isFront ? 'View back' : 'View front'}
                </button>
            </div>

            {/* ── BODY DIAGRAM ───────────────────────────────────── */}
            <div className="flex flex-col items-center px-8 py-4">

                {/* View label */}
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text)]/30 mb-3">
                    {isFront ? 'Anterior (Front)' : 'Posterior (Back)'}
                </span>

                <div className="relative">
                    <svg
                        viewBox="0 0 100 160"
                        className="h-[280px] w-auto"
                        style={{ filter: 'drop-shadow(0 4px 16px rgba(8,18,45,0.08))' }}
                    >
                        {/* Body outline (subtle skin tone base) */}
                        <ellipse cx="50" cy="14" rx="10" ry="12" fill="#E8D5C4" stroke="#C8A882" strokeWidth="0.8" opacity="0.9" />
                        {/* Zone paths */}
                        {parts.map((p) => {
                            const isSelected = selectedPart === p.id;
                            return (
                                <path
                                    key={p.id}
                                    d={p.d}
                                    onClick={() => onSelect(isSelected ? null : p.id)}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                    fill={isSelected ? 'var(--text)' : '#E2D5C8'}
                                    stroke={isSelected ? 'var(--text)' : '#C0A898'}
                                    strokeWidth={isSelected ? '1.5' : '0.6'}
                                    opacity={isSelected ? 1 : 0.85}
                                    className="hover:opacity-100"
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.setAttribute('fill', '#C8B0A0'); }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.setAttribute('fill', '#E2D5C8'); }}
                                />
                            );
                        })}
                    </svg>

                    {/* Floating tooltip near center when selected */}
                    {selectedPart && selectedLabel && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[var(--text)] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none">
                            <CheckCircle2 size={11} strokeWidth={3} />
                            {selectedLabel}
                        </div>
                    )}
                </div>

                {!selectedPart && (
                    <p className="text-[12px] text-[var(--text)]/35 font-medium text-center mt-2 italic">
                        No zone selected — click to pinpoint
                    </p>
                )}
            </div>

            {/* ── DIVIDER ────────────────────────────────────────── */}
            <div className="mx-8 h-px bg-[var(--text)]/8" />

            {/* ── ACTIONS ────────────────────────────────────────── */}
            {/* Passed in from parent via render props */}
            <div id="body-map-actions" />
        </div>
    );
}
