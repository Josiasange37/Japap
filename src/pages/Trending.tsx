import React, { useEffect, useState, Fragment } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import AdUnit from '../components/AdUnit';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Search } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';

export default function Trending() {
    const { posts, clearTrendingCount } = useApp();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const scrollY = useScrollPosition();
    const isAtTop = scrollY < 10;

    // Clear badge on mount
    useEffect(() => {
        clearTrendingCount();
    }, []);

    // Sort posts by viral score (views, likes, comments)
    const sortedPosts = [...posts].sort((a, b) => {
        const scoreA = a.stats.views * 0.1 + a.stats.likes * 1 + a.stats.comments * 2;
        const scoreB = b.stats.views * 0.1 + b.stats.likes * 1 + b.stats.comments * 2;
        return scoreB - scoreA;
    });

    // Filter by search query (case‑insensitive)
    const filteredPosts = sortedPosts.filter(p =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Layout>
            <div className="px-4 md:px-0">
                {/* Second Header – only visible at top */}
                {isAtTop && (
                    <div className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-2 border-b border-[var(--border)]">
                        <h1 className="font-display text-4xl font-black tracking-tight">{t('trending.title')}</h1>
                        <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em] mt-1">
                            {t('trending.subtitle')}
                        </p>
                    </div>
                )}

                {/* Search Bar – transparent rounded shape, sticky */}
                <div className="sticky top-0 z-30 py-2 bg-transparent backdrop-blur-none">
                    <div className="relative mb-4 group">
                        <Search
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder={t('trending.search')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border border-[var(--border)] pl-16 pr-6 py-5 rounded-[32px] font-bold outline-none focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] transition-all"
                        />
                    </div>
                </div>

                {/* Posts List */}
                <section className="flex flex-col gap-6 mt-4">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                            <Fragment key={post.id}>
                                <PostCard post={post} />
                                {(index + 1) % 5 === 0 && <AdUnit slot="TRENDING_FEED_SLOT" />}
                            </Fragment>
                        ))
                    ) : (
                        <p className="text-center text-[var(--text-muted)] py-8">{t('trending.empty')}</p>
                    )}
                </section>
            </div>
        </Layout>
    );
}
