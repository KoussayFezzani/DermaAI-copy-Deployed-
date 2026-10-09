import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, ChevronRight, X, Download, Loader2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { generatePDFReport } from '../utils/pdfGenerator';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/apiConfig';

const BASE_URL = API_BASE_URL;

const History = () => {

    const { t, i18n } = useTranslation();
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('All');
    const [exporting, setExporting] = useState(false);
    const [compareMode, setCompareMode] = useState(false);
    const [compareSelection, setCompareSelection] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            let token = localStorage.getItem('token');
            if (token === 'null' || token === 'undefined') token = null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            try {
                const [histRes, disRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/history`, { headers }),
                    fetch(`${BASE_URL}/api/diseases`)
                ]);
                
                const histData = await histRes.json();
                const disData = await disRes.json();
                
                const safeHistory = Array.isArray(histData) ? histData : [];
                setHistory(safeHistory);
                setFilteredHistory(safeHistory);
                setDiseases(disData.diseases || []);
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (filter === 'All') {
            setFilteredHistory(history);
        } else {
            setFilteredHistory(history.filter(item => {
                const diag = item.diagnosis?.toLowerCase() || '';
                const isNoSign = diag.includes('no sign');
                const isUncertain = diag.includes('inconclusive') || diag.includes('uncertain') || item.is_uncertain;
                
                if (filter === 'High') return (diag.includes('mel') || diag.includes('bcc')) && !isNoSign && !isUncertain;
                if (filter === 'Medium') return (diag.includes('akiec') || isUncertain) && !isNoSign;
                if (filter === 'Low') return (diag.includes('bkl') || diag.includes('df') || diag.includes('nv') || diag.includes('vasc') || isNoSign) && !isUncertain;
                return true;
            }));

        }
    }, [filter, history]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("CAUTION: This will permanently delete this medical record and its associated clinical image from our servers. This action is IRREVERSIBLE. Proceed?")) return;
        
        try {
            let token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const response = await fetch(`${BASE_URL}/api/history/${id}`, {
                method: 'DELETE',
                headers
            });
            
            if (response.ok) {
                setHistory(prev => prev.filter(item => item._id !== id));
            } else {
                alert("Failed to delete record. Please try again.");
            }
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const handleExport = async (item) => {
        if (exporting) return;
        setExporting(true);
        try {
            await generatePDFReport(item, t, diseases, i18n.language);
        } catch (err) {
            console.error('PDF export failed', err);
        } finally {
            setExporting(false);
        }
    };

    const handleCompareExport = async () => {
        if (compareSelection.length !== 2 || exporting) return;
        setExporting(true);
        try {
            const { generateComparisonPDF } = await import('../utils/pdfGenerator');
            await generateComparisonPDF(compareSelection[0], compareSelection[1], t, diseases, i18n.language);
        } catch (err) {
            console.error('Comparison PDF export failed', err);
        } finally {
            setExporting(false);
            setCompareMode(false);
            setCompareSelection([]);
        }
    };

    const toggleCompareItem = (item) => {
        if (compareSelection.find(i => i._id === item._id)) {
            setCompareSelection(compareSelection.filter(i => i._id !== item._id));
        } else if (compareSelection.length < 2) {
            setCompareSelection([...compareSelection, item]);
        }
    };

    const filters = [
        { key: 'All', label: t('history.filterAll'), icon: Activity },
        { key: 'High', label: t('history.filterHigh'), icon: AlertTriangle, color: 'text-red-500' },
        { key: 'Medium', label: t('history.filterMedium'), icon: Clock, color: 'text-amber-500' },
        { key: 'Low', label: t('history.filterLow'), icon: ShieldCheck, color: 'text-emerald-500' },
    ];

    if (loading) return (
        <div className="container min-h-screen flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="mono text-sm font-bold uppercase tracking-widest text-primary">
                    {t('history.loadingArchives')}
                </div>
            </div>
        </div>
    );

    return (
        <div className="container min-h-screen py-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="space-y-4">
                    <h1 className="text-5xl lg:text-7xl">
                        {t('history.title').split(' ')[0]} <span className="text-primary">{t('history.title').split(' ').slice(1).join(' ') || 'Archives.'}</span>
                    </h1>
                    <p className="text-xl text-muted font-medium">{t('history.subtitle')}</p>
                </div>

                <div className="flex gap-4 flex-col md:flex-row">
                    <button 
                        onClick={() => { setCompareMode(!compareMode); setCompareSelection([]); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center border ${compareMode ? 'bg-indigo-500 text-[var(--bg)] border-indigo-500 shadow-lg' : 'bg-[var(--bg)] border-[var(--border)] text-muted hover:text-indigo-500'}`}
                    >
                        {t('history.compareMode', 'Compare Mode')} {compareSelection.length > 0 && `(${compareSelection.length}/2)`}
                    </button>
                    <div className="flex bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
                        {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                filter === f.key
                                    ? 'bg-primary text-[var(--bg)] shadow-md'
                                    : 'hover:bg-primary/5 text-muted hover:text-primary'
                            }`}
                        >
                            <f.icon size={14} className={filter === f.key ? 'text-[var(--bg)]' : f.color} />
                            {f.label}
                        </button>
                    ))}
                    </div>
                </div>
            </header>

            {filteredHistory.length === 0 ? (
                <div className="card border-dashed py-32 text-center space-y-4 opacity-60">
                    <Clock size={48} className="mx-auto text-muted" />
                    <h3 className="text-2xl">{t('history.noRecordsFound')}</h3>
                    <p className="text-muted">{t('history.noRecordsDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {filteredHistory.map((item) => (
                        <div
                            key={item._id}
                            className={`group relative rounded-3xl overflow-hidden bg-black shadow-lg aspect-[3/4] cursor-pointer hover:shadow-2xl transition-all duration-500 ${compareSelection.find(i => i._id === item._id) ? 'border-4 border-indigo-500 scale-[0.98]' : 'border border-[var(--border)]'}`}
                            onClick={() => compareMode ? toggleCompareItem(item) : setSelectedItem(item)}
                        >
                            <img
                                src={`${BASE_URL}${item.image_url}`}
                                alt="Lesion"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                            />
                            
                            {/* DELETE BUTTON */}
                            <button 
                                onClick={(e) => handleDelete(e, item._id)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 backdrop-blur-md text-[var(--bg)]/40 hover:text-red-500 hover:bg-black border border-[var(--bg)]/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                title="Delete Scan"
                            >
                                <X size={16} />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="space-y-1">
                                    <p className="mono font-bold text-[10px] text-primary-light uppercase tracking-widest translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </p>
                                    <h3 className="text-[var(--bg)] text-xl lg:text-2xl leading-tight">
                                        {item.diagnosis?.split(',')[0]}
                                    </h3>
                                    {item.confidence >= 0.5 && (
                                        <p className="mono text-[10px] text-[var(--bg)]/60 font-medium">
                                            {t('history.confidence').toUpperCase()}: {(item.confidence * 100).toFixed(0)}%
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-primary-light font-bold text-xs uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
                                    {t('history.viewSequence')} <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {compareSelection.length === 2 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-500">
                    <button 
                        onClick={handleCompareExport}
                        disabled={exporting}
                        className="btn gap-2 bg-indigo-500 hover:bg-indigo-600 text-[var(--bg)] shadow-2xl py-4 px-8 text-lg rounded-full disabled:opacity-50"
                    >
                        {exporting ? <Loader2 size={20} className="animate-spin" /> : <Activity size={20} />}
                        {t('history.generateComparison', 'Generate Comparison Report')}
                    </button>
                </div>
            )}

            {selectedItem && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-xl animate-in fade-in duration-500"
                        onClick={() => setSelectedItem(null)}
                    />
                    <div className="relative card !p-0 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(15,118,110,0.2)] animate-in zoom-in-95 fade-in duration-300">
                        <div className="md:w-1/2 bg-black flex items-center justify-center min-h-[240px]">
                            <img
                                src={`${BASE_URL}${selectedItem.image_url}`}
                                className="w-full h-full object-contain"
                                alt="Lesion Detail"
                            />
                        </div>

                        <div className="md:w-1/2 p-10 flex flex-col overflow-y-auto">
                            <button
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg)] text-muted transition-colors"
                                onClick={() => setSelectedItem(null)}
                            >
                                <X size={24} />
                            </button>

                            <div className="flex-1 space-y-8">
                                <header className="space-y-2">
                                    <span className="mono text-xs font-bold text-primary uppercase tracking-widest">
                                        {t('history.clinicalRecord')} #{selectedItem._id?.slice(-6)}
                                    </span>
                                    <h3 className="text-4xl lg:text-5xl leading-tight">{selectedItem.diagnosis}</h3>
                                </header>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                                        <p className="mono text-[10px] text-muted font-bold uppercase mb-1">
                                            {t('history.pdf.confidenceScore')}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {selectedItem.confidence >= 0.5
                                                ? `${(selectedItem.confidence * 100).toFixed(1)}%`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                                        <p className="mono text-[10px] text-muted font-bold uppercase mb-1">
                                            {t('history.date')}
                                        </p>
                                        <p className="text-sm font-bold">
                                            {new Date(selectedItem.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="btn btn-primary w-full py-4 text-sm mt-8 shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={() => handleExport(selectedItem)}
                                disabled={exporting}
                            >
                                {exporting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {t('history.generating')}
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        {t('history.exportReport')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
