import React, { Fragment, useState } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import AdUnit from '../components/AdUnit';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, Zap, Star, Briefcase, Heart, GraduationCap } from 'lucide-react';

export default function Home() {
    const { posts } = useApp();
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: t('categories.all'), icon: Zap },
        { id: 'trending', label: t('categories.trending'), icon: TrendingUp },
        { id: 'celeb', label: t('categories.celeb'), icon: Star },
        { id: 'work', label: t('categories.work'), icon: Briefcase },
        { id: 'relationship', label: t('categories.relationship'), icon: Heart },
        { id: 'campus', label: t('categories.campus'), icon: GraduationCap },
    ];

    const filteredPosts = activeCategory === 'all'
        ? posts
        : posts.filter(p => p.category === activeCategory);

    return (
        <Layout>
            {/* Category Filter - Always at top */}
            <div className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur-md py-2 mt-0 md:mt-2 -mx-4 md:mx-0 px-4 md:px-0 border-b border-[var(--border)] md:border-none">
                <div className="overflow-x-auto flex gap-3 no-scrollbar">
                    {categories.map(cat => (
                        <FilterTag
                            key={cat.id}
                            label={cat.label}
                            active={activeCategory === cat.id}
                            onClick={() => setActiveCategory(cat.id)}
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
                            onClick={() => setActiveCategory('all')}
                            className="mt-6 text-[var(--brand)] font-bold hover:underline"
                        >
                            Voir tout le Japap
                        </button>
                    </div>
                )}
            </section>

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
