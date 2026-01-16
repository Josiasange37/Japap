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
    const { posts, isLoading, feedState, fetchMorePosts } = useApp();
    const { t } = useLanguage();
    const loadTriggerRef = useRef<HTMLDivElement>(null);

    // const filteredPosts = activeCategory === 'all'
    //     ? posts
    //     : posts.filter(p => p.category === activeCategory);

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

            {/* Feed */}
            <section className="mt-4 md:mt-0 flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-12 h-12 border-4 border-[var(--bg-secondary)] border-t-[var(--brand)] rounded-full mb-6"
                        />
                        {t('home.loading')}
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

