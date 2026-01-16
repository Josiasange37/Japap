import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Post, UserProfile, GossipComment } from '../types';
import { JapapAPI } from '../services/api';
import { ref, set, get, child, onValue, push, update, runTransaction, serverTimestamp, query, limitToLast, onChildAdded } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { rtdb, auth, storage } from '../firebase';
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
    registerUser: (pseudo: string, avatar: string | null) => Promise<void>;
    addPost: (post: Omit<Post, 'id' | 'author' | 'stats'>, isAnonymous?: boolean) => Promise<void>;
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
        return !cached; // If we have cache, we don't start as loading
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

    // Initial Data Fetch
    // Realtime Data Fetch
    useEffect(() => {
        // Validation: Check if user actually exists in DB
        if (user?.pseudo) {
            const normalizedPseudo = user.pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
            const userRef = ref(rtdb, `users/${normalizedPseudo}`);
            get(userRef).then((snapshot) => {
                if (!snapshot.exists()) {
                    console.log("User not found in DB, logging out...");
                    setUser(null);
                    localStorage.removeItem('japap_user');
                    showToast("Session invalid. Please login again.", "error");
                }
            }).catch(err => console.error("Validation error:", err));
        }

        // Request Notification Permission
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                }
            });
        }


        // Always ensure we have a Firebase Auth session for DB writes
        if (!auth.currentUser) {
            signInAnonymously(auth).catch(err => console.error("Anon auth failed", err));
        }

        // Optimistic Load from Cache
        const cachedPosts = localStorage.getItem('japap_posts_cache');
        if (cachedPosts) {
            try {
                const parsed = JSON.parse(cachedPosts);
                setPosts(parsed);
                setIsLoading(false); // Immediate visual load
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        const postsQuery = query(ref(rtdb, 'posts'), limitToLast(20));
        const unsubscribe = onValue(postsQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedPosts = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    // Ensure stats exist
                    stats: {
                        likes: 0,
                        dislikes: 0,
                        comments: 0,
                        views: 0,
                        ...data[key].stats
                    },
                    // Check if current user liked/disliked/reacted
                    liked: user?.pseudo ? data[key].users?.[user.pseudo]?.liked : false,
                    disliked: user?.pseudo ? data[key].users?.[user.pseudo]?.disliked : false,
                    userReaction: user?.pseudo ? data[key].users?.[user.pseudo]?.reaction : null
                })).sort((a, b) => a.timestamp - b.timestamp);
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



        // Enhanced Real-time Updates for New Posts
        // Listen for new posts and add them to the feed without full refresh
        const notificationsRef = query(ref(rtdb, 'posts'), limitToLast(1));
        let initialLoad = true;
        let lastPostTimestamp: number | null = null;

        const notifUnsub = onChildAdded(notificationsRef, (snapshot) => {
            const post = snapshot.val();
            const postId = snapshot.key;
            
            if (initialLoad) {
                // Track the timestamp of the latest post on initial load
                if (post && post.timestamp) {
                    lastPostTimestamp = post.timestamp;
                }
                return;
            }

            if (post && (!user?.pseudo || post.author.username !== user.pseudo)) {
                // It's a new post from someone else
                const newPost: Post = {
                    id: postId,
                    ...post,
                    stats: {
                        likes: 0,
                        dislikes: 0,
                        comments: 0,
                        views: 0,
                        ...post.stats
                    },
                    liked: user?.pseudo ? post.users?.[user.pseudo]?.liked : false,
                    disliked: user?.pseudo ? post.users?.[user.pseudo]?.disliked : false,
                    userReaction: user?.pseudo ? post.users?.[user.pseudo]?.reaction : null
                };

                // Optimistically add new post to the bottom of the feed
                setPosts(prev => {
                    const updatedPosts = [...prev, newPost];
                    localStorage.setItem('japap_posts_cache', JSON.stringify(updatedPosts));
                    return updatedPosts;
                });

                // Update feed state
                setFeedState(prev => ({
                    ...prev,
                    posts: [...prev.posts, newPost]
                }));

                // Show notification
                setNotifications(prev => [
                    {
                        id: Date.now(),
                        type: 'new_post',
                        title: 'New Gossip!',
                        message: `${post.author.username} just posted a scoop!`,
                        time: 'Just now',
                        read: false
                    },
                    ...prev
                ]);
                showToast(`New gossip from ${post.author.username}`, 'info');
            }
        });

        // Timeout to disable initialLoad flag prevents spam on refresh
        setTimeout(() => { 
            initialLoad = false; 
        }, 2000);

        return () => {
            unsubscribe();
            notifUnsub();
        };
    }, [user?.pseudo]);

    // Personal Notifications Listener (Full List Sync)
    useEffect(() => {
        if (!user?.pseudo) {
            if (notifications.length > 0) setNotifications([]);
            return;
        }

        const normalizedPseudo = user.pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const myNotifsRef = query(ref(rtdb, `notifications/${normalizedPseudo}`), limitToLast(50));

        const unsubscribe = onValue(myNotifsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedNotifs = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    time: formatRelativeTime(data[key].timestamp)
                })).sort((a, b) => b.timestamp - a.timestamp);

                setNotifications(loadedNotifs);

                // Show push notification for the very latest one if it's new
                const latest = loadedNotifs[0];
                if (latest && latest.timestamp > Date.now() - 5000) {
                    if (Notification.permission === 'granted') {
                        const n = new Notification('Japap Social', {
                            body: latest.message,
                            icon: '/vite.svg'
                        });
                        n.onclick = () => window.focus();
                    }
                    showToast(latest.message, 'info');
                }
            } else {
                setNotifications([]);
            }
        });

        return () => unsubscribe();
    }, [user?.pseudo]);

    // Helper to send notification
    const sendSystemNotification = async (recipientPseudo: string, type: string, message: string, postId: string, title?: string) => {
        if (!recipientPseudo || !user?.pseudo || recipientPseudo === user.pseudo) return;

        const normalizedRecipient = recipientPseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const notifRef = push(ref(rtdb, `notifications/${normalizedRecipient}`));

        // Map types to better titles if none provided
        const defaultTitle =
            type === 'reaction' ? 'New Reaction!' :
                type === 'comment' ? 'New Comment!' :
                    type === 'mention' ? 'Mentioned You!' :
                        'New Update';

        await set(notifRef, {
            type,
            from: user.pseudo,
            title: title || defaultTitle,
            message,
            postId,
            timestamp: serverTimestamp(),
            read: false
        });
    };



    const checkPseudoAvailability = async (pseudo: string): Promise<boolean> => {
        if (!pseudo) return false;
        const normalizedPseudo = pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const dbRef = ref(rtdb);
        try {
            const snapshot = await get(child(dbRef, `users/${normalizedPseudo}`));
            return !snapshot.exists();
        } catch (error) {
            console.error("Error checking pseudo:", error);
            return false;
        }
    };

    const registerUser = async (pseudo: string, avatar: string | null) => {
        const normalizedPseudo = pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const newUser: UserProfile = {
            pseudo: pseudo, // Keep original casing for display
            avatar,
            onboarded: true,
            bio: "Spilling tea since forever"
        };

        try {
            await set(ref(rtdb, 'users/' + normalizedPseudo), newUser);
            setUser(newUser);
            localStorage.setItem('japap_user', JSON.stringify(newUser));
            showToast("Welcome to Japap!", "success");
        } catch (error) {
            console.error("Error registering user:", error);
            showToast("Failed to register. Please try again.", "error");
            throw error;
        }
    };

    const updateUser = async (updates: Partial<UserProfile>) => {
        const newUser = user ? { ...user, ...updates } : updates as UserProfile;

        // If we have a pseudo (which acts as ID basically), update remote
        if (newUser.pseudo) {
            const normalizedPseudo = newUser.pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
            try {
                // We typically just update the entry
                await set(ref(rtdb, 'users/' + normalizedPseudo), newUser);
            } catch (e) {
                console.error("Failed to sync user update to DB", e);
            }
        }

        setUser(newUser);
        localStorage.setItem('japap_user', JSON.stringify(newUser));
    };

    const addPost = async (newPostData: Omit<Post, 'id' | 'author' | 'stats'>, isAnonymous: boolean = true) => {
        if (!user && !isAnonymous) return;

        const author = isAnonymous
            ? { id: 'anon', username: 'Anonymous Gossip', avatar: null }
            : { id: user?.pseudo || 'anon', username: user?.pseudo || 'Anonymous', avatar: user?.avatar || null };

        const newPostRef = push(ref(rtdb, 'posts'));
        const newPost = {
            ...newPostData,
            author,
            timestamp: serverTimestamp(),
            stats: { likes: 0, dislikes: 0, comments: 0, views: 0 },
            reactions: {}
        };

        try {
            await set(newPostRef, newPost);
            showToast("Scoop posted successfully!", "success");
        } catch (error) {
            console.error("Error creating post:", error);
            showToast("Failed to post scoop.", "error");
        }
    };

    const uploadFile = async (file: File, folder: string = 'media') => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const sRef = storageRef(storage, `${folder}/${fileName}`);

        try {
            const snapshot = await uploadBytes(sRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        }
    };

    const likePost = async (id: string) => {
        if (!user?.pseudo) return;
        const postRef = ref(rtdb, `posts/${id}`);
        const userInteractionRef = child(postRef, `users/${user.pseudo}`);

        await runTransaction(postRef, (post) => {
            if (post) {
                if (!post.stats) post.stats = { likes: 0, dislikes: 0, comments: 0, views: 0 };

                // How to handle this cleanly in a transaction without reading `users` subnode easily?
                // In RTDB transactions, we get the whole node.
                const users = post.users || {};
                const userState = users[user.pseudo] || {};
                const wasLiked = userState.liked;

                if (wasLiked) {
                    post.stats.likes = (post.stats.likes || 1) - 1;
                    userState.liked = false;
                } else {
                    post.stats.likes = (post.stats.likes || 0) + 1;
                    userState.liked = true;
                    // FIX: If disliked, remove dislike for mutual exclusivity
                    if (userState.disliked) {
                        post.stats.dislikes = (post.stats.dislikes || 1) - 1;
                        userState.disliked = false;
                    }
                }

                if (!post.users) post.users = {};
                post.users[user.pseudo] = userState;
            }
            return post;
        });

        // Notification Side Effect
        const targetPost = posts.find(p => p.id === id);
        if (targetPost && targetPost.author.username && !targetPost.liked) {
            sendSystemNotification(targetPost.author.username, 'reaction', `${user.pseudo} liked your post`, id);
        }
    };

    const dislikePost = async (id: string) => {
        if (!user?.pseudo) return;
        const postRef = ref(rtdb, `posts/${id}`);

        await runTransaction(postRef, (post) => {
            if (post) {
                if (!post.stats) post.stats = { likes: 0, dislikes: 0, comments: 0, views: 0 };

                const users = post.users || {};
                const userState = users[user.pseudo] || {};
                const wasDisliked = userState.disliked;

                if (wasDisliked) {
                    post.stats.dislikes = (post.stats.dislikes || 1) - 1;
                    userState.disliked = false;
                } else {
                    post.stats.dislikes = (post.stats.dislikes || 0) + 1;
                    userState.disliked = true;
                    // If liked, remove like
                    if (userState.liked) {
                        post.stats.likes = (post.stats.likes || 1) - 1;
                        userState.liked = false;
                    }
                }

                if (!post.users) post.users = {};
                post.users[user.pseudo] = userState;
            }
            return post;
        });
    };

    const addReaction = async (postId: string, emoji: string) => {
        if (!user?.pseudo) return;
        const postRef = ref(rtdb, `posts/${postId}`);

        await runTransaction(postRef, (post) => {
            if (post) {
                if (!post.reactions) post.reactions = {};
                const users = post.users || {};
                const userState = users[user.pseudo] || {};
                const oldReaction = userState.reaction;

                if (oldReaction === emoji) {
                    // Toggle off
                    post.reactions[emoji] = (post.reactions[emoji] || 1) - 1;
                    if (post.reactions[emoji] <= 0) delete post.reactions[emoji];
                    userState.reaction = null;
                } else {
                    // Swap or Add
                    if (oldReaction) {
                        post.reactions[oldReaction] = (post.reactions[oldReaction] || 1) - 1;
                        if (post.reactions[oldReaction] <= 0) delete post.reactions[oldReaction];
                    }
                    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
                    userState.reaction = emoji;
                }

                if (!post.users) post.users = {};
                post.users[user.pseudo] = userState;
            }
            return post;
        });

        // Notification Side Effect
        const targetPost = posts.find(p => p.id === postId);
        if (targetPost && targetPost.author.username) {
            sendSystemNotification(targetPost.author.username, 'reaction', `${user.pseudo} reacted to your post`, postId);
        }
    };

    const addCommentReaction = async (postId: string, commentId: string, emoji: string) => {
        if (!user?.pseudo) return;

        const commentRef = ref(rtdb, `comments/${postId}/${commentId}`);
        let commentAuthor: string | null = null;
        let isNewReaction = false;

        await runTransaction(commentRef, (comment) => {
            if (comment) {
                if (!comment.reactions) comment.reactions = {};
                if (!comment.userReactions) comment.userReactions = {};

                const oldReaction = comment.userReactions[user.pseudo];
                commentAuthor = comment.author.username;

                if (oldReaction === emoji) {
                    // Toggle off
                    comment.reactions[emoji] = (comment.reactions[emoji] || 1) - 1;
                    if (comment.reactions[emoji] <= 0) delete comment.reactions[emoji];
                    delete comment.userReactions[user.pseudo];
                } else {
                    // Swap or Add
                    if (oldReaction) {
                        comment.reactions[oldReaction] = (comment.reactions[oldReaction] || 1) - 1;
                        if (comment.reactions[oldReaction] <= 0) delete comment.reactions[oldReaction];
                    }
                    comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
                    comment.userReactions[user.pseudo] = emoji;
                    isNewReaction = true;
                }
            }
            return comment;
        });

        if (isNewReaction && commentAuthor && commentAuthor !== user.pseudo) {
            sendSystemNotification(commentAuthor, 'reaction', `${user.pseudo} reacted ${emoji} to your comment`, postId);
        }
    };

    /**
     * Helper to add a comment
     */
    const addComment = async (postId: string, text: string, replyTo?: GossipComment) => {
        if (!user) return;

        console.log("AppContext: addComment called for postId:", postId);

        const newCommentRef = push(ref(rtdb, `comments/${postId}`));
        const newComment: GossipComment = {
            id: newCommentRef.key as string,
            text,
            author: { id: user.pseudo, username: user.pseudo, avatar: user.avatar },
            timestamp: Date.now(),
            reactions: {},
            userReactions: {},
            ...(replyTo ? {
                replyTo: {
                    id: replyTo.id,
                    username: replyTo.author.username,
                    text: replyTo.text
                }
            } : {})
        };

        try {
            await set(newCommentRef, newComment);

            // Update post comment count
            const postStatsRef = ref(rtdb, `posts/${postId}/stats/comments`);
            await runTransaction(postStatsRef, (currentComments) => {
                return (currentComments || 0) + 1;
            });

            showToast("Comment posted!", "success");

            // Notification Side Effect
            const targetPost = posts.find(p => p.id === postId);
            if (targetPost && targetPost.author.username) {
                sendSystemNotification(targetPost.author.username, 'comment', `${user.pseudo} commented: "${text.substring(0, 20)}..."`, postId);
            }

        } catch (error) {
            console.error("Error adding comment:", error);
            showToast("Failed to post comment", "error");
        }
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

    // Pagination functions
    const fetchMorePosts = async () => {
        if (feedState.isLoadingMore || !feedState.hasMore) return;

        setFeedState(prev => ({ ...prev, isLoadingMore: true }));

        try {
            // For now, simulate no more posts
            // In future implementation, this would use cursor-based pagination
            setTimeout(() => {
                setFeedState(prev => ({
                    ...prev,
                    hasMore: false,
                    isLoadingMore: false
                }));
            }, 1000);
        } catch (error) {
            console.error("Error fetching more posts:", error);
            setFeedState(prev => ({
                ...prev,
                isLoadingMore: false
            }));
        }
    };

    const resetFeed = () => {
        setFeedState({
            posts: [],
            nextCursor: undefined,
            hasMore: true,
            isLoadingMore: false
        });
        setPosts([]);
    };

    return (
        <AppContext.Provider value={{
            user,
            posts,
            feedState,
            updateUser,
            checkPseudoAvailability,
            registerUser,
            addPost,
            likePost,
            dislikePost,
            addReaction,
            addCommentReaction,
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
            clearTrendingCount,
            uploadFile,
            fetchMorePosts,
            resetFeed
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
