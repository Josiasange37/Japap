import { useState, useEffect, useCallback, useRef } from 'react';
import type { Post } from '../types';


interface InfiniteFeedState {
    posts: Post[];
    nextCursor?: string;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    error: string | null;
}

const POSTS_PER_PAGE = 20;

export function useInfiniteFeed() {

    const [state, setState] = useState<InfiniteFeedState>({
        posts: [],
        nextCursor: undefined,
        hasMore: true,
        isLoading: true,
        isLoadingMore: false,
        error: null
    });

    const loadingRef = useRef(false);
    const initialLoadRef = useRef(true);

    // Load initial posts
    // Initial load logic moved inside useEffect to avoid lint warning
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (loadingRef.current) return;
            loadingRef.current = true;

            try {
                if (mounted) setState(prev => ({ ...prev, isLoading: true, error: null }));

                // Load from cache first
                const cachedPosts = localStorage.getItem('japap_posts_cache');
                if (cachedPosts && initialLoadRef.current) {
                    try {
                        const parsed = JSON.parse(cachedPosts);
                        if (mounted) {
                            setState(prev => ({
                                ...prev,
                                posts: parsed,
                                isLoading: false
                            }));
                        }
                    } catch (e) {
                        console.error("Cache parse error", e);
                    }
                }

                // Fetch from Firebase will be here
                initialLoadRef.current = false;

            } catch (error) {
                console.error("Error loading initial posts:", error);
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        error: "Failed to load posts",
                        isLoading: false
                    }));
                }
            } finally {
                loadingRef.current = false;
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    // Load more posts
    const loadMorePosts = useCallback(async () => {
        if (loadingRef.current || !state.hasMore || state.isLoadingMore) return;
        loadingRef.current = true;

        try {
            setState(prev => ({ ...prev, isLoadingMore: true }));

            // This will be implemented with AppContext pagination
            // For now, simulate no more posts
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    hasMore: false,
                    isLoadingMore: false
                }));
                loadingRef.current = false;
            }, 1000);

        } catch (error) {
            console.error("Error loading more posts:", error);
            setState(prev => ({
                ...prev,
                error: "Failed to load more posts",
                isLoadingMore: false
            }));
            loadingRef.current = false;
        }
    }, [state.hasMore, state.isLoadingMore]);

    // Optimistic update for new posts
    const addNewPost = useCallback((newPost: Post) => {
        setState(prev => ({
            ...prev,
            posts: [...prev.posts, newPost] // Add to end since we want newer posts downward
        }));
    }, []);

    // Update existing post
    const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
        setState(prev => ({
            ...prev,
            posts: prev.posts.map(post =>
                post.id === postId ? { ...post, ...updates } : post
            )
        }));
    }, []);

    // Reset feed
    const resetFeed = useCallback(() => {
        setState({
            posts: [],
            nextCursor: undefined,
            hasMore: true,
            isLoading: true,
            isLoadingMore: false,
            error: null
        });
        initialLoadRef.current = true;
    }, []);



    return {
        ...state,
        loadMorePosts,
        addNewPost,
        updatePost,
        resetFeed,
        POSTS_PER_PAGE
    };
}