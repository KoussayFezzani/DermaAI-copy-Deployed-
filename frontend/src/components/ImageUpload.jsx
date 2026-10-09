import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, Camera, RotateCcw, Check, Fingerprint, Aperture, Trash2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({ onResult, bodyPart, onNext, onPreview }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
    const [stream, setStream] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [captured, setCaptured] = useState(false);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [stream]);

    const startCamera = async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' }, audio: false 
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            setCameraActive(true);
            setCaptured(false);
            setFile(null);
        } catch (err) {
            setError(t('scan.error.camera_denied', 'Camera access denied or not available.'));
            setMode('upload');
        }
    };

    const stopCamera = () => {
        if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            const capturedFile = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFile(capturedFile);
            if (onPreview) onPreview(capturedFile);
            setCaptured(true);
            stopCamera();
        }, 'image/jpeg', 0.95);
    };

    const retakePhoto = () => { setCaptured(false); setFile(null); startCamera(); };

    const handleFile = (f) => {
        if (f && f.type.startsWith('image/')) {
            setFile(f);
            if (onPreview) onPreview(f);
            setError(null);
        } else {
            setError(t('scan.error.invalid_file', 'Please select a valid image file.'));
        }
    };

    const handleChange = (e) => {
        if (e.target.files?.[0]) handleFile(e.target.files[0]);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };

    const handleDiscard = (e) => {
        e.stopPropagation();
        if (window.confirm('Discard this image? You will need to upload a new one.')) {
            setFile(null);
            if (onPreview) onPreview(null);
        }
    };

    const handleNext = () => { if (file) onNext(file); };

    const switchMode = (newMode) => {
        if (newMode === mode) return;
        stopCamera();
        setMode(newMode);
        setFile(null);
        setCaptured(false);
        setError(null);
        if (newMode === 'camera') startCamera();
    };

    return (
        /* ── SINGLE UNIFIED CARD — everything lives inside this surface ── */
        <div className="w-full bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_20px_60px_rgba(8,18,45,0.12)] overflow-hidden">

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div className="px-8 pt-8 pb-0">
                <h3 className="text-xl font-bold text-[var(--text)] mb-1">
                    {t('scan.upload.title', 'Upload your scan')}
                </h3>
                <p className="text-[13px] text-[var(--text)]/50 font-medium mb-6">
                    Upload a photo of the skin lesion for AI analysis
                </p>

                {/* ── TAB SWITCHER ────────────────────────────────────────── */}
                <div className="flex p-1 bg-[var(--text)]/5 rounded-xl border border-[var(--text)]/8 mb-6">
                    {[
                        { id: 'upload', icon: Upload, label: 'Image Upload' },
                        { id: 'camera', icon: Camera, label: 'Clinical Camera' },
                    ].map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => switchMode(id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200
                                ${mode === id
                                    ? 'bg-[var(--text)] text-white shadow-md'
                                    : 'text-[var(--text)]/50 hover:text-[var(--text)]/80 hover:bg-[var(--text)]/5'
                                }`}
                        >
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── DROP ZONE / PREVIEW ─────────────────────────────────────── */}
            <div className="px-8 pb-0">
                <AnimatePresence mode="wait">
                    {mode === 'camera' ? (
                        /* ── CAMERA MODE ──────────────────────────────────── */
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full rounded-2xl overflow-hidden bg-black"
                            style={{ height: 340 }}
                        >
                            {!captured ? (
                                <div className="relative w-full h-full">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-90" />
                                    {/* Viewfinder overlay */}
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]" />
                                        <div className="w-52 h-52 border border-white/30 rounded-3xl animate-pulse" />
                                        <Aperture size={56} className="absolute text-white/20 animate-spin" style={{ animationDuration: '10s' }} />
                                        <span className="absolute top-4 left-4 text-white/60 font-mono text-[10px] tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            Live feed
                                        </span>
                                    </div>
                                    {/* Capture button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                                        onClick={(e) => { e.stopPropagation(); capturePhoto(); }}
                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-2xl"
                                    >
                                        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                                            <Camera size={20} className="text-[var(--text)]" />
                                        </div>
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="relative w-full h-full bg-[#F8F9FA]">
                                    {file && <img src={URL.createObjectURL(file)} alt="Captured" className="w-full h-full object-contain" />}
                                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/70 flex items-end justify-center pb-5">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); retakePhoto(); }}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold"
                                        >
                                            <RotateCcw size={14} /> Retake photo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : file ? (
                        /* ── FILE PREVIEW ─────────────────────────────────── */
                        <motion.div
                            key="has-file"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            className="w-full rounded-2xl overflow-hidden border border-[var(--text)]/10"
                            style={{ height: 340 }}
                        >
                            {/* Clean neutral white/light-gray background for clinical image assessment */}
                            <div className="relative w-full h-full bg-[#F3F4F6] flex items-center justify-center">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="max-w-full max-h-full object-contain"
                                    style={{ maxHeight: 300 }}
                                />
                                {/* "Ready" badge top-right */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                                    <Check size={12} strokeWidth={3} />
                                    Preview ready
                                </div>
                                {/* File name bottom */}
                                <div className="absolute bottom-0 inset-x-0 bg-white/80 backdrop-blur-sm border-t border-[var(--text)]/8 px-4 py-2.5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[12px] font-bold text-[var(--text)] truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-[11px] text-[var(--text)]/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    {/* Destructive discard — red, with confirm prompt */}
                                    <button
                                        onClick={handleDiscard}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200 hover:border-red-300"
                                    >
                                        <Trash2 size={13} />
                                        Discard
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* ── EMPTY DROP ZONE ──────────────────────────────── */
                        <motion.div
                            key="no-file"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none
                                ${isDragging
                                    ? 'border-[var(--text)] bg-[var(--text)]/5 scale-[0.99]'
                                    : 'border-[var(--text)]/15 bg-[var(--text)]/[0.02] hover:border-[var(--text)]/30 hover:bg-[var(--text)]/5'
                                }`}
                            style={{ height: 340 }}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={onDrop}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <motion.div
                                animate={{ y: isDragging ? -8 : 0, scale: isDragging ? 1.08 : 1 }}
                                className="w-20 h-20 rounded-2xl bg-[var(--text)]/8 flex items-center justify-center mb-5"
                            >
                                <Fingerprint size={40} strokeWidth={1.5} className="text-[var(--text)]/40" />
                            </motion.div>
                            <h4 className="text-[15px] font-bold text-[var(--text)] mb-1">
                                {isDragging ? 'Drop to upload' : 'Drag & drop your image'}
                            </h4>
                            <p className="text-[13px] text-[var(--text)]/45 font-medium mb-5">
                                or click to browse your files
                            </p>
                            <span className="text-[11px] font-bold text-[var(--text)]/30 uppercase tracking-widest">
                                JPG, PNG, WebP · Max 10 MB
                            </span>
                            <input id="file-input" type="file" className="hidden" onChange={handleChange} accept="image/*" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* ── ERROR ──────────────────────────────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-8 mt-4 flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]"
                    >
                        <AlertCircle size={16} />
                        <span className="font-medium">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── CONFIRM BUTTON — inside the card, connected to the flow ── */}
            <div className="p-8 pt-6">
                <AnimatePresence>
                    {file && (
                        <motion.button
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="w-full py-4 rounded-xl bg-[var(--text)] text-white font-bold text-[14px] flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(8,18,45,0.25)] hover:bg-[var(--text)]/90 hover:shadow-[0_12px_32px_rgba(8,18,45,0.3)] hover:scale-[1.01] transition-all duration-200"
                        >
                            Confirm and continue
                            <ChevronRight size={18} strokeWidth={2.5} />
                        </motion.button>
                    )}
                </AnimatePresence>
                {!file && (
                    <p className="text-center text-[12px] font-medium text-[var(--text)]/35 mt-1">
                        Upload or capture an image to proceed
                    </p>
                )}
            </div>
        </div>
    );
};

export default ImageUpload;
