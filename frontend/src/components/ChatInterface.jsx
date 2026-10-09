import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';


const ChatInterface = ({ diagnosisContext }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I am your DermaAI assistant. How can I help you understand your results today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat-query-stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMessage.text,
                    context: diagnosisContext

                }),
            });

            const data = await response.json();
            const aiMessage = { role: 'assistant', text: data.response || "I'm sorry, I couldn't process your request right now." };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to the AI. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!diagnosisContext) return null;

    return (
        <div className="card !p-0 overflow-hidden flex flex-col h-[550px] shadow-2xl border border-[var(--border)] bg-[var(--card-bg)]/80 backdrop-blur-md">
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)] bg-[var(--bg)]/50 flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Bot size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            AI Assistant
                        </h3>
                        <p className="text-[10px] mono text-emerald-500 uppercase font-bold tracking-widest leading-none">Online</p>
                    </div>
                </div>
                <Sparkles className="text-primary animate-pulse" size={16} />
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-primary/5">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                            msg.role === 'user' 
                            ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' 
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div
                            className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user'
                                ? 'bg-indigo-600 text-[var(--bg)] rounded-tr-none shadow-lg shadow-indigo-500/10 font-medium'
                                : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-none shadow-sm'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Bot size={16} />
                        </div>
                        <div className="bg-[var(--bg)] border border-[var(--border)] p-4 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-5 bg-[var(--bg)]/50 border-t border-[var(--border)] space-y-4">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your results..."
                        className="!pr-12 !mb-0 !py-4 !pl-6 !rounded-2xl !bg-[var(--card-bg)] !border-[var(--border)] focus:!border-primary/50 !text-sm transition-all shadow-inner"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-[var(--bg)] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-lg shadow-primary/20"
                    >
                        <Send size={18} />
                    </button>
                </form>
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted font-bold uppercase tracking-tighter opacity-60">
                    <AlertCircle size={12} />
                    <span>AI results may vary. Consult a doctor.</span>
                </div>
            </div>
        </div>
    );
};


export default ChatInterface;
