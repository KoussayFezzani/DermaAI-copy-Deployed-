import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Sparkles, Minus, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../utils/apiConfig';

const FloatingChat = ({ diagnosisContext }) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: t('support.contact.chat.initialMessage', 'Hello! How can I help you today?') }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const lastProcessedDiagRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        isDragging.current = true;
        dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
        };
        const handleMouseUp = () => { isDragging.current = false; };
        if (isOpen) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        if (
            diagnosisContext &&
            lastProcessedDiagRef.current !== diagnosisContext.diagnosis + diagnosisContext.timestamp
        ) {
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    text: t('support.contact.chat.analysisComplete', {
                        diagnosis: diagnosisContext.diagnosis,
                        confidence: ((diagnosisContext.confidence || 0) * 100).toFixed(1),
                        defaultValue: `Analysis complete: ${diagnosisContext.diagnosis}`
                    })
                }
            ]);
            lastProcessedDiagRef.current = diagnosisContext.diagnosis + diagnosisContext.timestamp;
            setIsOpen(true);
        }
    }, [diagnosisContext, t]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            let token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token && token !== 'null') headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(API_ENDPOINTS.CHAT_STREAM, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    query: currentInput,
                    context: diagnosisContext || {},
                    lang: i18n.language
                }),
            });


            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            setLoading(false);
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const next = [...prev];
                    const last = next.length - 1;
                    next[last] = { ...next[last], text: next[last].text + chunk };
                    return next;
                });
            }
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', text: t('support.contact.chat.error', 'An error occurred. Please try again.') }
            ]);
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end gap-4"
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[320px] h-[480px] flex flex-col overflow-hidden absolute bottom-[90px] right-0 rounded-[2rem] bg-[var(--bg)]/80 backdrop-blur-xl border border-[var(--text)]/10 shadow-2xl"
                        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                    >
                        {/* Header */}
                        <div
                            className="px-6 py-5 flex justify-between items-center w-full cursor-move bg-[var(--text)] text-[var(--bg)]"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--bg)]/10 flex items-center justify-center">
                                    <Sparkles size={16} className="text-[var(--bg)]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight">AI Assistant</h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#10B981] flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                                        Active
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <Minus size={16} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.role !== 'user' && (
                                        <div className="w-7 h-7 rounded-lg bg-[var(--text)] text-[var(--bg)] flex items-center justify-center text-[9px] font-bold shrink-0">AI</div>
                                    )}
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-white/40 text-[var(--text)] border border-[var(--text)]/5'}`}
                                        style={{
                                            borderTopRightRadius: msg.role === 'user' ? 4 : undefined,
                                            borderTopLeftRadius: msg.role !== 'user' ? 4 : undefined,
                                        }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-5 pb-6 pt-2 bg-transparent">
                            <form onSubmit={handleSend} className="relative flex items-center w-full">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your question..."
                                    className="w-full rounded-full border-2 border-[#E2E8F0] bg-white py-3.5 pl-5 pr-14 text-[13px] outline-none transition-all placeholder:text-[#94A3B8] text-[var(--text)] focus:border-[var(--text)]/30 shadow-sm"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--text)] text-[var(--bg)] flex items-center justify-center transition-all disabled:opacity-20 hover:scale-105"
                                >
                                    <ArrowRight size={18} strokeWidth={2.5} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(o => !o)}
                className="w-14 h-14 rounded-full bg-[var(--text)] text-[var(--bg)] flex items-center justify-center shadow-xl border-none"
            >
                <MessageSquare size={24} strokeWidth={2} />
            </motion.button>
        </div>
    );
};

export default FloatingChat;
