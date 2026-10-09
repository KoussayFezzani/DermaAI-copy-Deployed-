import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, ChevronRight, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../utils/apiConfig';


// Disease image map — uses reliable Unsplash images by skin condition
const DISEASE_IMAGES = {
    'melanoma':          '/diseases/melanoma.jpg',
    'basal cell':        '/diseases/basal_cell.jpg',
    'squamous':          '/diseases/squamous.jpg',
    'actinic':           '/diseases/actinic.jpeg',
    'nevus':             '/diseases/nevus.jpeg',
    'seborrheic':        '/diseases/seborrheic.jpeg',
    'dermatofibroma':    '/diseases/dermatofibroma.jpeg',
    'vascular':          '/diseases/vascular.webp',
};

const getDiseaseImage = (disease) => {
    const name = (disease.name || '').toLowerCase();
    const id = (disease.id || '').toLowerCase();
    for (const [key, url] of Object.entries(DISEASE_IMAGES)) {
        if (name.includes(key) || id.includes(key)) return url;
    }
    return '/diseases/nevus.jpeg'; // fallback
};

const getDangerStyle = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'high' || l === 'critical') return {
        bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: AlertTriangle
    };
    if (l === 'medium' || l === 'moderate' || l === 'watch') return {
        bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', icon: Info
    };
    return {
        bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', icon: CheckCircle
    };
};

const Diseases = () => {
    const { t } = useTranslation();
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDisease, setSelectedDisease] = useState(null);

    useEffect(() => {
        fetch(API_ENDPOINTS.DISEASES)
            .then(res => res.json())
            .then(data => setDiseases(data.diseases || []))
            .catch(() => setDiseases([]))  // FIX: never stay stuck on loading
            .finally(() => setLoading(false));
    }, []);


    const filtered = diseases.filter(d =>
        (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.scientificName || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="container min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <BookOpen size={48} className="text-primary opacity-40" />
                <p className="mono text-xs uppercase tracking-widest text-muted">Accessing Medical Encyclopedia…</p>
            </div>
        </div>
    );

    return (
        <div className="container py-24 space-y-16">
            <header className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[rgba(238,243,250,0.9)] mono text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(8, 18, 45, 0.1)' }}>
                    <BookOpen size={14} /> Medical Encyclopedia
                </div>
                <h1 className="text-5xl lg:text-7xl">
                    {t('diseases.title', 'Skin Diseases').split(' ')[0]}{' '}
                    <span className="text-stroke" style={{ WebkitTextStroke: '1.5px var(--text)', color: 'rgba(255, 255, 255, 0.4)' }}>{t('diseases.title', 'Skin Diseases').split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-xl text-muted font-medium">
                    Comprehensive insights into the most common skin lesions and dermatological conditions identified by clinical AI.
                </p>
            </header>

            <div className="space-y-8">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search diseases or scientific names…"
                        className="!pl-12 !mb-0"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="card text-center py-20 opacity-50">
                        <p>{search ? 'No diseases match your search.' : 'No disease data available.'}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((d) => {
                            const danger = getDangerStyle(d.dangerLevel);
                            const DangerIcon = danger.icon;
                            const imgUrl = getDiseaseImage(d);
                            return (
                            <div
                                key={d.id}
                                onClick={() => setSelectedDisease(d)}
                                className="group cursor-pointer rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
                                style={{ background: 'rgba(240, 244, 248, 0.4)', border: '1px solid rgba(8, 18, 45, 0.1)', boxShadow: 'var(--shadow-sm)' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(8, 18, 45, 0.9)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {/* Image */}
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={imgUrl}
                                        alt={d.name}
                                        className="w-full h-full object-cover"
                                        onError={e => { e.currentTarget.src = '/diseases/nevus.jpeg'; }}
                                    />
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(240, 244, 248, 0.6) 100%)' }} />
                                    <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold mono uppercase"
                                        style={{ background: danger.bg, color: danger.color, border: `1px solid ${danger.color}33` }}>
                                        <DangerIcon size={10} />
                                        {d.dangerLevel}
                                    </span>
                                </div>
                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold mb-0.5 group-hover:text-[rgba(238,243,250,1)] transition-colors" style={{ color: 'rgba(8, 18, 45, 0.9)' }}>{d.name}</h3>
                                    <p className="mono text-[10px] uppercase font-bold italic mb-3" style={{ color: 'var(--text-muted)' }}>{d.scientificName}</p>
                                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>
                                        {(d.description || '').substring(0, 130)}…
                                    </p>
                                    <div className="mt-4 pt-3 flex justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
                                        <span className="text-[10px] mono uppercase font-bold" style={{ color: 'rgba(8, 18, 45, 0.9)' }}>See Details</span>
                                        <ChevronRight size={14} style={{ color: 'rgba(8, 18, 45, 0.9)' }} />
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedDisease && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
                    style={{ background: 'rgba(240, 244, 248, 0.8)', backdropFilter: 'blur(4px)' }}
                >
                    <div className="bg-[var(--card-bg)] w-full max-w-2xl rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl">
                        <div className="p-8 space-y-8">
                        <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-bold serif" style={{ color: 'var(--text)' }}>{selectedDisease.name}</h2>
                                    <p className="mono text-xs italic" style={{ color: 'var(--text-muted)' }}>{selectedDisease.scientificName}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedDisease(null)}
                                    className="p-2.5 rounded-xl transition-colors"
                                    style={{ background: 'var(--elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(8, 18, 45, 0.9)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Disease image in modal */}
                            <div className="w-full h-48 rounded-xl overflow-hidden">
                                <img
                                    src={getDiseaseImage(selectedDisease)}
                                    alt={selectedDisease.name}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.currentTarget.src = '/diseases/nevus.jpeg'; }}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="mono text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--text-muted)' }}>About the condition</h4>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{selectedDisease.description}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-5 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                                        <h4 className="mono text-[10px] uppercase font-bold tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Risk Level</h4>
                                        {(() => {
                                            const d = getDangerStyle(selectedDisease.dangerLevel);
                                            const DI = d.icon;
                                            return (
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg w-fit" style={{ background: d.bg, color: d.color, border: `1px solid ${d.color}33` }}>
                                                    <DI size={14} />
                                                    <span className="text-xs font-bold mono uppercase">{selectedDisease.dangerLevel}</span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-[var(--bg)]/50 border-t border-[var(--border)] flex justify-end">
                            <button onClick={() => setSelectedDisease(null)} className="btn btn-primary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Diseases;
