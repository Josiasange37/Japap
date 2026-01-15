import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Post, UserProfile, GossipComment } from '../types';
import { JapapAPI } from '../services/api';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppContextType {
    user: UserProfile | null;
    posts: Post[];
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
    addPost: (post: Omit<Post, 'id' | 'author' | 'stats'>, isAnonymous?: boolean) => Promise<void>;
    likePost: (id: string) => Promise<void>;
    dislikePost: (id: string) => Promise<void>;
    addComment: (postId: string, text: string) => Promise<void>;
    toasts: Toast[];
    showToast: (message: string, type?: Toast['type']) => void;
    removeToast: (id: string) => void;
    activeCommentsPostId: string | null;
    setActiveCommentsPostId: (id: string | null) => void;
    isLoading: boolean;
    deletePost: (id: string) => Promise<void>;
    notifications: any[];
    removeNotification: (id: number) => void;
    trendingCount: number;
    clearTrendingCount: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const stored = localStorage.getItem('japap_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [posts, setPosts] = useState<Post[]>([]);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [trendingCount, setTrendingCount] = useState(3);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'trending', title: 'Trending Alert', message: 'Campus life is heating up!', time: '2m', read: false },
        { id: 2, type: 'new_post', title: 'New Gossip', message: 'Check out the latest scoop in Campus Life', time: '15m', read: false },
        { id: 3, type: 'reaction', title: 'New Like', message: 'Anonymous Gossip liked your post', time: '1h', read: false },
        { id: 4, type: 'comment', title: 'New Comment', message: 'Someone commented on your post', time: '3h', read: false }
    ]);

    // Initial Data Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const fetchedPosts = await JapapAPI.getPosts();
                setPosts(fetchedPosts);
            } catch (err) {
                console.error("Failed to load posts:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const showToast = (message: string, type: Toast['type'] = 'success') => {
        const id = Date.now().toString();
        const newToast: Toast = { id, message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const updateUser = async (updates: Partial<UserProfile>) => {
        const newUser = user ? { ...user, ...updates } : updates as UserProfile;
        setUser(newUser);
        localStorage.setItem('japap_user', JSON.stringify(newUser));
    };

    const addPost = async (newPostData: Omit<Post, 'id' | 'author' | 'stats'>, isAnonymous: boolean = true) => {
        if (!user && !isAnonymous) return;

        const author = isAnonymous
            ? { id: 'anon', username: 'Anonymous Gossip', avatar: null }
            : { id: user?.pseudo || 'anon', username: user?.pseudo || 'Anonymous', avatar: user?.avatar || null };

        const newPost = await JapapAPI.createPost({
            ...newPostData,
            author
        });

        setPosts(prev => [newPost, ...prev]);
    };

    const likePost = async (id: string) => {
        await JapapAPI.toggleLike(id);
        setPosts(prev => prev.map(p => {
            if (p.id === id) {
                const wasLiked = p.liked;
                return {
                    ...p,
                    liked: !wasLiked,
                    disliked: false,
                    stats: {
                        ...p.stats,
                        likes: p.stats.likes + (wasLiked ? -1 : 1),
                        dislikes: p.disliked ? p.stats.dislikes - 1 : p.stats.dislikes
                    }
                };
            }
            return p;
        }));
    };

    const dislikePost = async (id: string) => {
        await JapapAPI.toggleDislike(id);
        setPosts(prev => prev.map(p => {
            if (p.id === id) {
                const wasDisliked = p.disliked;
                return {
                    ...p,
                    disliked: !wasDisliked,
                    liked: false,
                    stats: {
                        ...p.stats,
                        dislikes: p.stats.dislikes + (wasDisliked ? -1 : 1),
                        likes: p.liked ? p.stats.likes - 1 : p.stats.likes
                    }
                };
            }
            return p;
        }));
    };

    const addComment = async (postId: string, text: string) => {
        if (!user) return;
        const newComment = await JapapAPI.addComment(postId, text, user);

        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    stats: { ...p.stats, comments: p.stats.comments + 1 },
                    commentsList: [...(p.commentsList || []), newComment]
                };
            }
            return p;
        }));
    };

    const deletePost = async (id: string) => {
        // Optimistic update
        setPosts(prev => prev.filter(p => p.id !== id));
        showToast("Post deleted successfully", 'success');
        // await JapapAPI.deletePost(id); // API call integration later
    };

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearTrendingCount = () => {
        setTrendingCount(0);
    };

    return (
        <AppContext.Provider value={{
            user,
            posts,
            updateUser,
            addPost,
            likePost,
            dislikePost,
            addComment,
            toasts,
            showToast,
            removeToast,
            activeCommentsPostId,
            setActiveCommentsPostId,
            isLoading,
            deletePost,
            notifications,
            removeNotification,
            trendingCount,
            clearTrendingCount
        }}>
            {children}

            {/* Global Toasts */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-xs px-4">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center justify-between animate-bounce-in ${t.type === 'error' ? 'bg-red-500 text-white' :
                            t.type === 'info' ? 'bg-blue-500 text-white' :
                                'bg-black text-white'
                            }`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useApp must be used within AppProvider');
    return context;
}
