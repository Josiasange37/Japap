import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Post, UserProfile, GossipComment } from '../types';
import { JapapAPI } from '../services/api';
import { ref, onValue, query, limitToLast, onChildAdded, push, set, serverTimestamp, update, get } from 'firebase/database';
import { rtdb } from '../firebase';
import { formatRelativeTime } from '../utils/time';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface PaginatedFeedState {
    posts: Post[];
    nextCursor?: string;
    hasMore: boolean;
    isLoadingMore: boolean;
}
interface AppContextType {
    user: UserProfile | null;
    posts: Post[];
    feedState: PaginatedFeedState;
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
    checkPseudoAvailability: (pseudo: string) => Promise<boolean>;
    registerUser: (pseudo: string, avatar: string | null, bio: string) => Promise<void>;
    addPost: (post: Omit<Post, 'id' | 'author' | 'stats'>, isAnonymous?: boolean, mediaFile?: File | null) => Promise<string | undefined>;
    likePost: (id: string) => Promise<void>;
    dislikePost: (id: string) => Promise<void>;
    addReaction: (postId: string, emoji: string) => Promise<void>;
    addCommentReaction: (postId: string, commentId: string, emoji: string) => Promise<void>;
    addComment: (postId: string, text: string, replyTo?: GossipComment) => Promise<void>;
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
    uploadFile: (file: File, folder?: string) => Promise<string>;
    fetchMorePosts: () => Promise<void>;
    resetFeed: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const stored = localStorage.getItem('japap_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [posts, setPosts] = useState<Post[]>(() => {
        const cached = localStorage.getItem('japap_posts_cache');
        try {
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });

    const [feedState, setFeedState] = useState<PaginatedFeedState>(() => ({
        posts: posts,
        nextCursor: undefined,
        hasMore: true,
        isLoadingMore: false
    }));
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(() => {
        const cached = localStorage.getItem('japap_posts_cache');
        return !cached;
    });
    const [trendingCount, setTrendingCount] = useState(3);
    const [notifications, setNotifications] = useState<any[]>([]);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const showToast = (message: string, type: Toast['type'] = 'success') => {
        const id = Date.now().toString();
        const newToast: Toast = { id, message, type };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => removeToast(id), 3000);
    };

    useEffect(() => {
        const verifyUser = async () => {
            if (user?.pseudo) {
                const normalized = user.pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
                const userRef = ref(rtdb, `users/${normalized}`);

                try {
                    const snapshot = await get(userRef);

                    if (!snapshot.exists()) {
                        console.warn("User record not found in RTDB, clearing local state.");
                        setUser(null);
                        localStorage.removeItem('japap_user');
                        return;
                    }

                    const serverUser = snapshot.val();

                    // Sync any updates from server to local initially
                    if (JSON.stringify(serverUser) !== JSON.stringify(user)) {
                        console.log("Syncing user data from server...");
                        setUser(serverUser);
                        localStorage.setItem('japap_user', JSON.stringify(serverUser));
                    }
                } catch (err) {
                    console.error("Error verifying user:", err);
                }
            }
        };

        verifyUser();

        const postsQuery = query(ref(rtdb, 'posts'), limitToLast(20));
        const unsubscribe = onValue(postsQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedPosts = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    stats: {
                        likes: 0,
                        dislikes: 0,
                        comments: 0,
                        views: 0,
                        ...data[key].stats
                    },
                    liked: user?.pseudo ? data[key].users?.[user.pseudo]?.liked : false,
                    disliked: user?.pseudo ? data[key].users?.[user.pseudo]?.disliked : false,
                    userReaction: user?.pseudo ? data[key].users?.[user.pseudo]?.reaction : null
                })).sort((a, b) => b.timestamp - a.timestamp);
                setPosts(loadedPosts);
                setFeedState(prev => ({
                    ...prev,
                    posts: loadedPosts,
                    hasMore: loadedPosts.length >= 20
                }));
                localStorage.setItem('japap_posts_cache', JSON.stringify(loadedPosts));
            } else {
                setPosts([]);
            }
            setIsLoading(false);
        });

        // Notifications Listener
        let initialLoad = true;
        const notifUnsub = onChildAdded(postsQuery, (snapshot) => {
            if (initialLoad) return;
            const post = snapshot.val();
            if (post && (!user || post.author.username !== user.pseudo)) {
                showToast(`New gossip from ${post.author.username}`, 'info');
            }
        });

        setTimeout(() => { initialLoad = false; }, 2000);

        // User Data Listener (Real-time sync)
        let userUnsubscribe: (() => void) | undefined;
        if (user?.pseudo) {
            const normalized = user.pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
            const userRef = ref(rtdb, `users/${normalized}`);
            userUnsubscribe = onValue(userRef, (snapshot) => {
                const serverUser = snapshot.val();
                if (serverUser) {
                    if (JSON.stringify(serverUser) !== JSON.stringify(user)) {
                        setUser(serverUser);
                        localStorage.setItem('japap_user', JSON.stringify(serverUser));
                    }
                } else {
                    // Deleted from server
                    setUser(null);
                    localStorage.removeItem('japap_user');
                }
            });
        }

        return () => {
            unsubscribe();
            notifUnsub();
            if (userUnsubscribe) userUnsubscribe();
        };
    }, [user?.pseudo]);

    // Personal Notifications
    useEffect(() => {
        if (!user?.pseudo) {
            setNotifications([]);
            return;
        }
        const normalized = user.pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const myNotifsRef = query(ref(rtdb, `notifications/${normalized}`), limitToLast(50));

        const unsubscribe = onValue(myNotifsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedNotifs = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    time: formatRelativeTime(data[key].timestamp)
                })).sort((a, b) => b.timestamp - a.timestamp);
                setNotifications(loadedNotifs);
            }
        });
        return () => unsubscribe();
    }, [user?.pseudo]);

    const checkPseudoAvailability = (pseudo: string) => JapapAPI.checkPseudoAvailability(pseudo);

    const registerUser = async (pseudo: string, avatar: string | null, bio: string) => {
        try {
            const newUser = await JapapAPI.registerUser(pseudo, avatar, bio);
            setUser(newUser);
            localStorage.setItem('japap_user', JSON.stringify(newUser));
            showToast("Welcome to Japap!", "success");
        } catch (error) {
            showToast("Failed to register.", "error");
        }
    };

    const updateUser = async (updates: Partial<UserProfile>) => {
        if (!user?.pseudo) return;
        try {
            const oldPseudo = user.pseudo;
            await JapapAPI.updateUser(oldPseudo, updates);

            // If pseudo changed, the API handled the DB move, 
            // the onValue listener for the OLD path will trigger and clear the user.
            // But we want to immediately update the local state to the NEW path.
            const newUser = { ...user, ...updates };
            setUser(newUser);
            localStorage.setItem('japap_user', JSON.stringify(newUser));

            showToast("Profile updated!", "success");
        } catch (error: any) {
            showToast(error.message || "Failed to update profile.", "error");
        }
    };

    const addPost = async (newPostData: Omit<Post, 'id' | 'author' | 'stats'>, isAnonymous: boolean = true, mediaFile?: File | null) => {
        if (!user && !isAnonymous) return;

        const author = isAnonymous
            ? { id: 'anon', username: 'Anonymous Gossip', avatar: null }
            : { id: user?.pseudo || 'anon', username: user?.pseudo || 'Anonymous', avatar: user?.avatar || null };

        const newPostRef = push(ref(rtdb, 'posts'));

        // Check if this is a media post that needs processing
        const isMediaPost = mediaFile && ['image', 'video', 'audio'].includes(newPostData.type);

        // Create post with placeholder if media file provided
        const newPost = {
            ...newPostData,
            author,
            timestamp: serverTimestamp(),
            stats: { likes: 0, dislikes: 0, comments: 0, views: 0 },
            reactions: {},
            // Processing state for media posts
            processing: isMediaPost,
            processingProgress: isMediaPost ? 0 : null,
            temporaryContent: isMediaPost ? newPostData.content : null
        };

        try {
            // Phase 1: Create post immediately
            await set(newPostRef, newPost);

            if (isMediaPost) {
                // Phase 2: Show immediate confirmation and process media in background
                showToast("Your post is being uploaded and will appear shortly!", "success");

                // Start background processing
                if (mediaFile) {
                    processMediaInBackground(newPostRef.key!, newPost, mediaFile, author, newPostData);
                }
            } else {
                showToast("Scoop posted successfully!", "success");
            }

            return newPostRef.key;
        } catch (error) {
            console.error("Error creating post:", error);
            showToast("Failed to post scoop.", "error");
            throw error;
        }
    };

    // Background media processing
    const processMediaInBackground = async (
        postId: string,
        post: any,
        mediaFile: File,
        author: any,
        originalData: any
    ) => {
        try {
            // Update processing progress
            await update(ref(rtdb, `posts/${postId}`), {
                processingProgress: 10
            });

            // Upload media
            const mediaUrl = await uploadFile(mediaFile, post.type);

            // Update processing progress
            await update(ref(rtdb, `posts/${postId}`), {
                processingProgress: 80
            });

            // Update post with final media URL
            await update(ref(rtdb, `posts/${postId}`), {
                content: mediaUrl,
                processing: false,
                processingProgress: 100
            });

            // Phase 3: Notify user that post is live
            showToast("Your post is now live! 🎉", "success");

            // Send notification to current user
            if (user?.pseudo) {
                const normalizedPseudo = user.pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
                const notifRef = push(ref(rtdb, `notifications/${normalizedPseudo}`));
                await set(notifRef, {
                    type: 'post_live',
                    title: 'Your Post is Live!',
                    message: 'Your media post has been successfully uploaded and is now visible to everyone.',
                    postId,
                    timestamp: serverTimestamp(),
                    read: false
                });
            }

        } catch (error) {
            console.error("Error processing media:", error);

            // Mark processing as failed
            await update(ref(rtdb, `posts/${postId}`), {
                processing: false,
                processingError: true
            });

            showToast("Failed to process media. Your post may not display correctly.", "error");
        }
    };

    const uploadFile = (file: File, folder?: string) => JapapAPI.uploadFile(file, folder);

    const likePost = async (id: string) => {
        if (!user?.pseudo) return;
        try {
            await JapapAPI.toggleLike(id, user.pseudo);
            const target = posts.find(p => p.id === id);
            if (target && target.author.username !== user.pseudo) {
                await JapapAPI.sendNotification(target.author.username, {
                    type: 'reaction',
                    from: user.pseudo,
                    title: 'New Like!',
                    message: `${user.pseudo} liked your post`,
                    postId: id
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const dislikePost = async (id: string) => {
        if (!user?.pseudo) return;
        try {
            await JapapAPI.toggleDislike(id, user.pseudo);
        } catch (error) {
            console.error(error);
        }
    };

    const addReaction = async (postId: string, emoji: string) => {
        if (!user?.pseudo) return;
        try {
            await JapapAPI.addReaction(postId, user.pseudo, emoji);
            const target = posts.find(p => p.id === postId);
            if (target && target.author.username !== user.pseudo) {
                await JapapAPI.sendNotification(target.author.username, {
                    type: 'reaction',
                    from: user.pseudo,
                    title: 'New Reaction!',
                    message: `${user.pseudo} reacted to your post`,
                    postId
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addComment = async (postId: string, text: string, replyTo?: GossipComment) => {
        if (!user) return;
        const comment = {
            text,
            author: { id: user.pseudo, username: user.pseudo, avatar: user.avatar },
            reactions: {},
            userReactions: {},
            ...(replyTo ? { replyTo: { id: replyTo.id, username: replyTo.author.username, text: replyTo.text } } : {})
        };

        try {
            await JapapAPI.addComment(postId, comment);
            const target = posts.find(p => p.id === postId);
            if (target && target.author.username !== user.pseudo) {
                await JapapAPI.sendNotification(target.author.username, {
                    type: 'comment',
                    from: user.pseudo,
                    title: 'New Comment!',
                    message: `${user.pseudo} commented on your post`,
                    postId
                });
            }
            showToast("Comment posted!", "success");
        } catch (error) {
            showToast("Failed to post comment", "error");
        }
    };

    const addCommentReaction = async (postId: string, commentId: string, emoji: string) => {
        if (!user?.pseudo) return;
        try {
            await JapapAPI.addCommentReaction(postId, commentId, user.pseudo, emoji);
        } catch (error) {
            console.error(error);
        }
    };

    const deletePost = async (id: string) => {
        try {
            await JapapAPI.deletePost(id);
            showToast("Post deleted.", "success");
        } catch (error) {
            showToast("Failed to delete.", "error");
        }
    };

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearTrendingCount = () => setTrendingCount(0);

    const fetchMorePosts = async () => {
        // Simple pagination logic could go here
    };

    const resetFeed = () => {
        setPosts([]);
        setFeedState({ posts: [], hasMore: true, isLoadingMore: false });
    };

    return (
        <AppContext.Provider value={{
            user, posts, feedState, updateUser, checkPseudoAvailability,
            registerUser, addPost, likePost, dislikePost, addReaction,
            addCommentReaction, addComment, toasts, showToast, removeToast,
            activeCommentsPostId, setActiveCommentsPostId, isLoading, deletePost,
            notifications, removeNotification, trendingCount, clearTrendingCount,
            uploadFile, fetchMorePosts, resetFeed
        }}>
            {children}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-xs px-4">
                {toasts.map(t => (
                    <div key={t.id} className={`px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center justify-between transition-all ${t.type === 'error' ? 'bg-red-500 text-white' : t.type === 'info' ? 'bg-blue-500 text-white' : 'bg-black text-white'}`}>
                        {t.message}
                    </div>
                ))}
            </div>
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
