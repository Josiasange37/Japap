import React, { Fragment, useState } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';

import CommentSection from '../components/CommentSection';
import AdUnit from '../components/AdUnit';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';

import { useScrollDirection } from '../hooks/useScrollDirection';

export default function Home() {
    const { posts } = useApp();
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('Trending');
    const scrollDirection = useScrollDirection();

    const categories = [
        'Trending',
        'Celeb Scoops',
        'Work Drama',
        'Relationship',
        'Campus Life'
    ];

    // Simple keyword filtering for demo purposes since we don't have strict tags yet
    const filteredPosts = activeCategory === 'Trending'
        ? posts
        : posts.filter(post =>
            post.content.toLowerCase().includes(activeCategory.toLowerCase()) ||
            post.content.toLowerCase().includes(activeCategory.split(' ')[0].toLowerCase())
        );

    return (
        <Layout>
            <div className="flex flex-col gap-0 md:gap-6">
                {/* Top Section - Only on Feed */}
                <div className="hidden md:flex items-center justify-between mb-4 px-4 md:px-0">
                    <div>
                        <h1 className="font-display text-4xl font-black tracking-tight">{t('home.title')}</h1>
                        <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em] mt-1">{t('home.subtitle')}</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[var(--bg-secondary)] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--border)] transition-colors">
                        <RefreshCw size={16} /> {t('home.latest')}
                    </button>
                </div>



                {/* Trending Categories (Quick Scroll) - Sticky & Working */}
                <div className={`sticky ${scrollDirection === 'down' ? 'top-0' : 'top-16'} md:top-0 z-30 bg-[var(--bg)]/80 backdrop-blur-md py-2 mt-0 md:mt-2 -mx-4 md:mx-0 px-4 md:px-0 border-b border-[var(--border)] md:border-none transition-[top] duration-300`}>
                    <div className="overflow-x-auto flex gap-3 no-scrollbar">
                        {categories.map(cat => (
                            <FilterTag
                                key={cat}
                                label={cat}
                                active={activeCategory === cat}
                                onClick={() => setActiveCategory(cat)}
                            />
                        ))}
                    </div>
                </div>

                {/* Feed */}
                <section className="mt-4 md:mt-0 flex flex-col">
                    {filteredPosts.length > 0 ? (
                        <>
                            {filteredPosts.map((post, index) => (
                                <Fragment key={post.id}>
                                    <PostCard post={post} />
                                    {/* Insert an Ad after every 3 posts */}
                                    {(index + 1) % 3 === 0 && (
                                        <div className="px-4 md:px-0 mb-6">
                                            <AdUnit slot="7890123456" />
                                        </div>
                                    )}
                                </Fragment>
                            ))}
                            <div className="py-10 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                                <div className="w-12 h-1 bg-[var(--border)] rounded-full mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">You're all caught up</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-6"
                            >
                                <TrendingUp size={48} className="text-[var(--text-muted)]" />
                            </motion.div>
                            <h2 className="text-2xl font-black italic mb-2">{t('home.empty.title')}</h2>
                            <p className="text-[var(--text-muted)] font-medium max-w-sm">{t('home.empty.desc')}</p>
                            <button
                                onClick={() => setActiveCategory('Trending')}
                                className="mt-6 text-[var(--brand)] font-bold hover:underline"
                            >
                                Voir tout le Japap
                            </button>
                        </div>
                    )}
                </section>
            </div>

            <CommentSection />
        </Layout>
    );
}

function FilterTag({ label, active, onClick }: { label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`whitespace-nowrap px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border ${active ? 'bg-black text-white border-black' : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text)]'}`}
        >
            {label}
        </button>
    );
}
