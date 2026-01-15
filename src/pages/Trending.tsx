import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Search } from 'lucide-react';

export default function Trending() {
    const { posts, clearTrendingCount } = useApp();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

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
                {/* Search Bar – sticky with original shape */}
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
                            className="w-full bg-[var(--card)] border border-[var(--border)] pl-16 pr-6 py-5 rounded-[32px] font-bold outline-none focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] transition-all"
                        />
                    </div>
                </div>

                {/* Posts List */}
                <section className="flex flex-col gap-6 mt-4">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => <PostCard key={post.id} post={post} />)
                    ) : (
                        <p className="text-center text-[var(--text-muted)] py-8">{t('trending.empty')}</p>
                    )}
                </section>
            </div>
        </Layout>
    );
}
