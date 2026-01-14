import React, { Fragment } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import CommentSection from '../components/CommentSection';
import AdUnit from '../components/AdUnit';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';

export default function Home() {
    const { posts } = useApp();
    const { t } = useLanguage();

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

                {/* Global Post Action - Visible on Desktop, separate on Mobile */}
                <div className="px-4 md:px-0">
                    <CreatePost />
                </div>

                {/* Trending Categories (Quick Scroll) */}
                <div className="mt-6 md:mt-2 overflow-x-auto flex gap-3 px-4 md:px-0 no-scrollbar pb-2">
                    <FilterTag label="Trending" active />
                    <FilterTag label="Celeb Scoops" />
                    <FilterTag label="Work Drama" />
                    <FilterTag label="Relationship" />
                    <FilterTag label="Campus Life" />
                </div>

                {/* Feed */}
                <section className="mt-4 md:mt-0 flex flex-col">
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <Fragment key={post.id}>
                                <PostCard post={post} />
                                {/* Insert an Ad after every 3 posts */}
                                {(index + 1) % 3 === 0 && (
                                    <div className="px-4 md:px-0 mb-6">
                                        <AdUnit slot="7890123456" />
                                    </div>
                                )}
                            </Fragment>
                        ))
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
                        </div>
                    )}
                </section>
            </div>

            <CommentSection />
        </Layout>
    );
}

function FilterTag({ label, active }: { label: string, active?: boolean }) {
    return (
        <button className={`whitespace-nowrap px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border ${active ? 'bg-black text-white border-black' : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text)]'}`}>
            {label}
        </button>
    );
}
