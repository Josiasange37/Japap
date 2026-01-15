import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Flame,
    Search,
    Hash,
    ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import PostCard from '../components/PostCard';

export default function Trending() {
    const { posts, clearTrendingCount } = useApp();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    // Clear badge on mount
    React.useEffect(() => {
        clearTrendingCount();
    }, []);

    const hashtags = [
        { name: 'CampusTea', count: '1.2k', trending: true },
        { name: 'OfficeDrama', count: '850', trending: false },
        { name: 'CelebScoop', count: '2.4k', trending: true },
        { name: 'RelationshipRedFlags', count: '500', trending: false },
        { name: 'SecretParties', count: '150', trending: false },
    ];

    const trendingPosts = posts.slice().sort((a, b) => {
        const scoreA = (a.stats.views * 0.1) + (a.stats.likes * 1) + (a.stats.comments * 2);
        const scoreB = (b.stats.views * 0.1) + (b.stats.likes * 1) + (b.stats.comments * 2);
        return scoreB - scoreA;
    });

    return (
        <Layout>
            <div className="px-4 md:px-0">
                {/* Title Section - Scrolls away naturally */}
                <div className="pt-4 pb-2">
                    <div className="mb-8">
                        <h1 className="font-display text-4xl font-black tracking-tight">{t('trending.title')}</h1>
                        <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{t('trending.subtitle')}</p>
                    </div>
                </div>

                {/* Search Bar - Stays sticky at top */}
                <div className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-md pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:static md:z-0">
                    <div className="relative mb-8 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand)] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder={t('trending.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--card)] border border-[var(--border)] pl-16 pr-6 py-5 rounded-[32px] font-bold outline-none focus:ring-4 focus:ring-[var(--brand)]/10 focus:border-[var(--brand)] transition-all"
                        />
                    </div>
                </div>

                {/* Trending Hashtags Grid */}
                <div className="mb-10 overflow-x-auto no-scrollbar pb-2">
                    <div className="flex gap-4">
                        {hashtags.map((tag) => (
                            <motion.div
                                key={tag.name}
                                whileHover={{ y: -5 }}
                                className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[32px] min-w-[200px] cursor-pointer hover:border-[var(--brand)] transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-[var(--bg-secondary)] rounded-xl text-[var(--brand)]">
                                        <Hash size={18} />
                                    </div>
                                    {tag.trending && (
                                        <span className="flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded-full">
                                            <Flame size={10} /> {t('trending.hot')}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-black text-lg truncate mb-1">#{tag.name}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{tag.count} {t('trending.scoops')}</p>
                                    <ArrowUpRight size={16} className="text-[var(--text-muted)]" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Top Scoops */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={24} className="text-[var(--brand)]" />
                        <h2 className="font-display text-2xl font-black">{t('trending.viral')}</h2>
                    </div>

                    <div className="flex flex-col gap-6">
                        {trendingPosts.length > 0 ? (
                            trendingPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                                <TrendingUp size={64} className="mb-4" />
                                <p className="font-black whitespace-pre-wrap">{t('trending.empty')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
