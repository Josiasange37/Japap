import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Post, UserProfile, GossipComment } from '../types';
import { JapapAPI } from '../services/api';
import { ref, set, get, child, onValue, push, update, runTransaction, serverTimestamp, query, limitToLast, onChildAdded } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { rtdb, auth } from '../firebase';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface AppContextType {
    user: UserProfile | null;
    posts: Post[];
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
    checkPseudoAvailability: (pseudo: string) => Promise<boolean>;
    registerUser: (pseudo: string, avatar: string | null) => Promise<void>;
    addPost: (post: Omit<Post, 'id' | 'author' | 'stats'>, isAnonymous?: boolean) => Promise<void>;
    likePost: (id: string) => Promise<void>;
    dislikePost: (id: string) => Promise<void>;
    addReaction: (postId: string, emoji: string) => Promise<void>;
    addCommentReaction: (postId: string, commentId: string, emoji: string) => Promise<void>;
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
                })).sort((a, b) => b.timestamp - a.timestamp);
                setPosts(loadedPosts);
            } else {
                setPosts([]);
            }
            setIsLoading(false);
        });



        // Notifications Listener (New Posts)
        // We use child_added on the same query to detect ONLY new items effectively if we were tracking strict timestamps,
        // but for simplicity in this session, let's just listen to the last 1.
        // Better approach: listen to 'posts' limitToLast(1) separately and check if it's new.
        const notificationsRef = query(ref(rtdb, 'posts'), limitToLast(1));
        let initialLoad = true;

        const notifUnsub = onChildAdded(notificationsRef, (snapshot) => {
            if (initialLoad) return; // Skip the first one if it exists
            const post = snapshot.val();
            if (post && (!user?.pseudo || post.author.username !== user.pseudo)) {
                // It's a new post from someone else
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
        setTimeout(() => { initialLoad = false; }, 2000);

        return () => {
            unsubscribe();
            notifUnsub();
        };
    }, [user?.pseudo]);

    // Personal Notifications Listener (Direct mentions/likes)
    useEffect(() => {
        if (!user?.pseudo) return;
        const normalizedPseudo = user.pseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const myNotifsRef = query(ref(rtdb, `notifications/${normalizedPseudo}`), limitToLast(1));

        const unsub = onChildAdded(myNotifsRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.timestamp > Date.now() - 10000) { // Only show recent ones (last 10s) to avoid spam on load
                if (Notification.permission === 'granted') {
                    const n = new Notification('Japap Social', {
                        body: data.message,
                        icon: '/vite.svg' // Ensure path is correct
                    });
                    n.onclick = () => window.focus();
                }
                showToast(data.message, 'info');
                // Update internal notification state
                setNotifications(prev => [{
                    id: Date.now(),
                    type: data.type || 'info',
                    title: 'New Interaction',
                    message: data.message,
                    time: 'Just now',
                    read: false
                }, ...prev]);
            }
        });

        return () => unsub();
    }, [user?.pseudo]);

    // Helper to send notification
    const sendSystemNotification = async (recipientPseudo: string, type: string, message: string, postId: string) => {
        if (!recipientPseudo || !user?.pseudo || recipientPseudo === user.pseudo) return;

        const normalizedRecipient = recipientPseudo.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const notifRef = push(ref(rtdb, `notifications/${normalizedRecipient}`));
        await set(notifRef, {
            type,
            from: user.pseudo,
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
                    // Send notification
                    // We need to do this outside transaction ideally, but for now we can't easily.
                    // Instead call helper after. But we need post author! 
                    // Transaction gives us post data. We can't side-effect easily here.
                    // We will fetch post author separately or store it in user interaction? No.
                    // Let's optimize: We assume we have post data in client 'posts' state usually?
                    // No, safe way: read post once, then transact? Or just run side effect if we have post data in 'posts' state.
                    // We will use the local 'posts' state to find author for notification.
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
    };

    const addCommentReaction = async (postId: string, commentId: string, emoji: string) => {
        if (!user?.pseudo) return;

        const commentRef = ref(rtdb, `comments/${postId}/${commentId}`);
        // We need to update two things potentially: 
        // 1. The reaction count on the comment
        // 2. The user's reaction on the comment (to toggle or switch)

        await runTransaction(commentRef, (comment) => {
            if (comment) {
                if (!comment.reactions) comment.reactions = {};
                if (!comment.userReactions) comment.userReactions = {};

                const oldReaction = comment.userReactions[user.pseudo];

                if (oldReaction === emoji) {
                    // Toggle off
                    comment.reactions[emoji] = (comment.reactions[emoji] || 1) - 1;
                    if (comment.reactions[emoji] <= 0) delete comment.reactions[emoji];
                    delete comment.userReactions[user.pseudo];
                    comment.userReaction = null; // For local optimistic updates if we were mapping it, but `userReactions` map is source of truth
                } else {
                    // Swap or Add
                    if (oldReaction) {
                        comment.reactions[oldReaction] = (comment.reactions[oldReaction] || 1) - 1;
                        if (comment.reactions[oldReaction] <= 0) delete comment.reactions[oldReaction];
                    }
                    comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
                    comment.userReactions[user.pseudo] = emoji;
                }
            }
            return comment;
        });

        // After transaction, we might want to manually trigger a local update if the subscription doesn't catch it fast enough? 
        // The onValue subscription in CommentsSheet should handle it.
    };

    /**
     * Helper to add a comment
     */
    const addComment = async (postId: string, text: string) => {
        if (!user) return;

        console.log("AppContext: addComment called for postId:", postId);

        const newCommentRef = push(ref(rtdb, `comments/${postId}`));
        const newComment: GossipComment = {
            id: newCommentRef.key as string,
            text,
            author: { id: user.pseudo, username: user.pseudo, avatar: user.avatar },
            timestamp: Date.now(),
            reactions: {},
            userReactions: {}
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

    return (
        <AppContext.Provider value={{
            user,
            posts,
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
