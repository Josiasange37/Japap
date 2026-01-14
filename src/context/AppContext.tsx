import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Post, UserProfile, Comment } from '../types';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppContextType {
    user: UserProfile | null;
    posts: Post[];
    updateUser: (updates: Partial<UserProfile>) => void;
    addPost: (post: Omit<Post, 'id' | 'author' | 'stats'>) => void;
    likePost: (id: string) => void;
    dislikePost: (id: string) => void;
    reactToPost: (id: string, emoji: string | null) => void;
    reactToComment: (postId: string, commentId: string, emoji: string | null) => void;
    addComment: (postId: string, text: string, replyTo?: Comment['replyTo']) => void;
    toasts: Toast[];
    showToast: (message: string, type?: Toast['type']) => void;
    removeToast: (id: string) => void;
    activeCommentsPostId: string | null;
    setActiveCommentsPostId: (id: string | null) => void;
    activeSharePost: { caption: string, url: string } | null;
    setActiveSharePost: (data: { caption: string, url: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Initial Data
const INITIAL_POSTS: Post[] = [
    {
        id: '1',
        type: 'audio',
        content: '',
        caption: 'Vibing to this new track 🎧',
        author: { id: 'user2', username: '@music_lover', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
        stats: { likes: 124, comments: 2, views: 1050, dislikes: 2 },
        liked: false,
        disliked: false,
        commentsList: [
            { id: 'c1', text: 'This vibe is immaculate!', author: { id: 'u1', username: '@fan_girl', avatar: null }, timestamp: Date.now() - 1000000 },
            { id: 'c2', text: 'Needs more bass imo.', author: { id: 'u2', username: '@critic_guy', avatar: null }, timestamp: Date.now() - 500000 }
        ],
        title: "Can't Be Broke",
        artist: "Rick Ross feat. Yungeen Ace",
        cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=1000&auto=format&fit=crop",
        bgGradient: "#dbeafe"
    },
    {
        id: '2',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=1000&auto=format&fit=crop',
        caption: 'Neon city nights 🌃',
        author: { id: 'user3', username: '@cyber_fox', avatar: 'https://images.unsplash.com/photo-1529139574466-a302d2d3f524' },
        stats: { likes: 856, comments: 0, views: 5002, dislikes: 10 },
        liked: true,
        disliked: false,
        bgGradient: "#f3e8ff"
    },
    {
        id: '3',
        type: 'text',
        content: 'Just had the craziest idea for a new app... who wants to build it with me? 🚀 #coding #startup',
        caption: '',
        author: { id: 'user4', username: '@dev_guru', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
        stats: { likes: 45, comments: 0, views: 210, dislikes: 0 },
        liked: false,
        disliked: false,
        bgGradient: "#ffe4e6"
    }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const stored = localStorage.getItem('japap_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [posts, setPosts] = useState<Post[]>(() => {
        const stored = localStorage.getItem('japap_posts');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored posts', e);
            }
        }
        return INITIAL_POSTS;
    });
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
    const [activeSharePost, setActiveSharePost] = useState<{ caption: string, url: string } | null>(null);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const showToast = (message: string, type: Toast['type'] = 'success') => {
        const id = Date.now().toString();
        const newToast: Toast = { id, message, type };
        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    // Sync user to local storage
    useEffect(() => {
        if (user) {
            localStorage.setItem('japap_user', JSON.stringify(user));
        }
    }, [user]);

    // Sync posts to local storage
    useEffect(() => {
        localStorage.setItem('japap_posts', JSON.stringify(posts));
    }, [posts]);

    const updateUser = (updates: Partial<UserProfile>) => {
        setUser(prev => prev ? { ...prev, ...updates } : null);
    };

    const addPost = (newPostData: Omit<Post, 'id' | 'author' | 'stats'>) => {
        if (!user) return;

        const newPost: Post = {
            id: Date.now().toString(),
            author: {
                id: 'me',
                username: user.pseudo,
                avatar: user.avatar
            },
            stats: { likes: 0, comments: 0, views: 0, dislikes: 0 },
            liked: false,
            disliked: false,
            ...newPostData
        };

        setPosts(prev => [newPost, ...prev]);
    };

    const likePost = (id: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === id) {
                // If already disliked, remove dislike first
                const wasDisliked = p.disliked;
                const newLiked = !p.liked;

                return {
                    ...p,
                    liked: newLiked,
                    disliked: wasDisliked ? false : p.disliked,
                    stats: {
                        ...p.stats,
                        likes: p.stats.likes + (newLiked ? 1 : -1),
                        dislikes: p.stats.dislikes - (wasDisliked ? 1 : 0)
                    }
                };
            }
            return p;
        }));
    };

    const dislikePost = (id: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === id) {
                // If already liked, remove like first
                const wasLiked = p.liked;
                const newDisliked = !p.disliked;

                return {
                    ...p,
                    disliked: newDisliked,
                    liked: wasLiked ? false : p.liked,
                    stats: {
                        ...p.stats,
                        dislikes: p.stats.dislikes + (newDisliked ? 1 : -1),
                        likes: p.stats.likes - (wasLiked ? 1 : 0)
                    }
                };
            }
            return p;
        }));
    };

    const reactToPost = (id: string, emoji: string | null) => {
        setPosts(prev => prev.map(p => {
            if (p.id === id) {
                // Check if toggling same reaction off
                if (p.userReaction === emoji) {
                    return { ...p, userReaction: undefined };
                }
                return { ...p, userReaction: emoji || undefined };
            }
            return p;
        }));
    };

    const reactToComment = (postId: string, commentId: string, emoji: string | null) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    commentsList: p.commentsList?.map(c => {
                        if (c.id === commentId) {
                            if (c.userReaction === emoji) {
                                return { ...c, userReaction: undefined };
                            }
                            return { ...c, userReaction: emoji || undefined };
                        }
                        return c;
                    })
                };
            }
            return p;
        }));
    };

    const addComment = (postId: string, text: string, replyTo?: Comment['replyTo']) => {
        if (!user) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            text,
            author: { id: user.pseudo, username: user.pseudo, avatar: user.avatar },
            timestamp: Date.now(),
            replyTo
        };

        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    commentsList: [...(p.commentsList || []), newComment],
                    stats: {
                        ...p.stats,
                        comments: p.stats.comments + 1
                    }
                };
            }
            return p;
        }));
    };

    return (
        <AppContext.Provider value={{
            user,
            posts,
            updateUser,
            addPost,
            likePost,
            dislikePost,
            reactToPost,
            reactToComment,
            addComment,
            toasts,
            showToast,
            removeToast,
            activeCommentsPostId,
            setActiveCommentsPostId,
            activeSharePost,
            setActiveSharePost
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within a AppProvider');
    }
    return context;
}
