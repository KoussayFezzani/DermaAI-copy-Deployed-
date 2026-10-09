import React, { useEffect, useState } from 'react';
import { Newspaper, Clock, ExternalLink, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../utils/apiConfig';

const Blog = () => {
    const { t, i18n } = useTranslation();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${API_ENDPOINTS.NEWS}?page=${page}&limit=6&lang=${i18n.language}`
                );

                const result = await response.json();
                if (result.data) {
                    setArticles(result.data);
                    setTotalPages(result.meta?.total_pages || 1);
                } else {
                    setArticles(Array.isArray(result) ? result : []);
                }
            } catch {
                setArticles([]); // FIX: never stay stuck on loading
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [page, i18n.language]);

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.toLowerCase().includes('recently')) return 'Recently';
        let cleanDate = dateStr.split(' — ')[0].split(' - ')[0].trim();
        let d = new Date(cleanDate);
        if (isNaN(d.getTime())) return 'Recently';
        return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="container py-24 space-y-16" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <header className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-primary mono text-[10px] font-bold uppercase tracking-widest" style={{ background: 'rgba(15,118,110,0.1)' }}>
                    <BookOpen size={14} /> {t('footer.links.blog', 'Blog')}
                </div>
                <h1 className="text-5xl lg:text-7xl">
                    {t('blog.title', 'Research Blog').split(' ')[0]}{' '}
                    <span className="text-stroke" style={{ WebkitTextStroke: '1.5px var(--text)', color: 'rgba(255, 255, 255, 0.4)' }}>
                        {t('blog.title', 'Research Blog').split(' ').slice(1).join(' ')}
                    </span>
                </h1>
                <p className="text-xl text-muted font-medium">
                    {t('blog.subtitle', 'Latest research and news in dermatology and AI.')}
                </p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="flex flex-col items-center gap-4">
                        <Newspaper size={48} className="text-primary opacity-30" />
                        <p className="mono text-xs uppercase tracking-widest text-muted">Loading articles…</p>
                    </div>
                </div>
            ) : articles.length === 0 ? (
                <div className="card text-center py-20 opacity-50">
                    <Newspaper size={40} className="mx-auto mb-4 text-muted" />
                    <p>No articles available at this time.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((a, i) => (
                        <article key={i} className="card group hover:-translate-y-2 transition-all flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <span className="mono text-[10px] uppercase font-bold text-primary tracking-widest bg-primary/5 px-2 py-1 rounded">
                                    {a.source || 'Research'}
                                </span>
                                <div className="flex items-center gap-2 text-muted">
                                    <Clock size={14} />
                                    <span className="text-[10px] font-bold">{formatDate(a.posted_at)}</span>
                                </div>
                            </div>
                            <h3 className="text-2xl mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                {a.title}
                            </h3>
                            <p className="text-sm text-muted leading-relaxed flex-1 mb-8 line-clamp-3">
                                {a.summary}
                            </p>
                            {a.url && (
                                <a
                                    href={a.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                                >
                                    {t('blog.readMore', 'Read more')} <ExternalLink size={14} />
                                </a>
                            )}
                        </article>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-8 pt-12 border-t border-[var(--border)]">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn flex gap-2 items-center disabled:opacity-30"
                    >
                        <ChevronLeft size={18} /> {t('common.previous', 'Previous')}
                    </button>
                    <span className="mono text-xs font-bold uppercase tracking-widest">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="btn flex gap-2 items-center disabled:opacity-30"
                    >
                        {t('common.next', 'Next')} <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Blog;
