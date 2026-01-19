import React, { Fragment, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import CommentsSheet from '../components/CommentsSheet';
import InfiniteScrollLoader from '../components/InfiniteScrollLoader';
import AdUnit from '../components/AdUnit';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function Home() {
    const { posts, isLoading, feedState, fetchMorePosts, user } = useApp();
    const { t } = useLanguage();
    const loadTriggerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // SEO/Bot logic: If not onboarded, we still show the home page but with limited interactions
    const isOnboarded = user?.onboarded && user?.pseudo;

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting && feedState.hasMore && !feedState.isLoadingMore) {
                    fetchMorePosts();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px' // Start loading before user reaches bottom
            }
        );

        if (loadTriggerRef.current) {
            observer.observe(loadTriggerRef.current);
        }

        return () => observer.disconnect();
    }, [feedState.hasMore, feedState.isLoadingMore, fetchMorePosts]);

    return (
        <Layout>
            {/* Category Filter Removed */}

            {/* Welcome & SEO Section */}
            <div className="mb-8 px-4 md:px-0">
                <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-[var(--brand)] to-purple-600 text-white overflow-hidden shadow-2xl shadow-pink-500/20">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 max-w-lg">
                        <h1 className="text-3xl font-black italic tracking-tighter mb-4 leading-none">Welcome to Japap 🫖</h1>
                        <p className="text-sm font-bold opacity-90 leading-relaxed mb-6">
                            Join the ultimate community for authentic stories and local gossip. Japap is where trust meets transparency—explore what's happening in your neighborhood, share your experiences anonymously, and stay connected with a verified community of storytellers.
                        </p>
                        <div className="flex gap-4">
                            <div className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">Trending Now</div>
                            <div className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">Verified Gossip</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <section className="flex flex-col">
                {isLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[var(--card)] border-b md:border md:rounded-[32px] border-[var(--border)] mb-0 md:mb-6 overflow-hidden relative">
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="w-24 h-3 bg-[var(--bg-secondary)] rounded-full animate-pulse" />
                                        <div className="w-16 h-2 bg-[var(--bg-secondary)] rounded-full animate-pulse opacity-50" />
                                    </div>
                                </div>
                                <div className="px-4 pb-4 space-y-2">
                                    <div className="w-full h-4 bg-[var(--bg-secondary)] rounded-full animate-pulse" />
                                    <div className="w-3/4 h-4 bg-[var(--bg-secondary)] rounded-full animate-pulse" />
                                </div>
                                <div className="h-[250px] bg-[var(--bg-secondary)] animate-pulse m-4 rounded-2xl" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            </div>
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <>
                        {posts.map((post, index) => (
                            <Fragment key={post.id}>
                                <PostCard post={post} />
                                {/* Insert an Ad after every 5 posts */}
                                {(index + 1) % 5 === 0 && (
                                    <div className="px-4 md:px-0 mb-6">
                                        <AdUnit slot="HOMEPAGE_FEED_SLOT" />
                                    </div>
                                )}
                            </Fragment>
                        ))}

                        {/* Infinite Scroll Loader */}
                        <div ref={loadTriggerRef}>
                            <InfiniteScrollLoader
                                isLoading={feedState.isLoadingMore}
                                hasMore={feedState.hasMore}
                            />
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
                    </div>
                )}
            </section>

            <CommentsSheet />
        </Layout>
    );
}


// FilterTag removed

