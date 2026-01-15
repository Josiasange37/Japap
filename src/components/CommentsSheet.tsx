import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Reply as ReplyIcon, Smile } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import ReactionPicker from './ReactionPicker';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { rtdb } from '../firebase';
import type { GossipComment } from '../types';


export default function CommentsSheet() {
    const { addComment, activeCommentsPostId, setActiveCommentsPostId, addCommentReaction } = useApp();
    const { t } = useLanguage();
    const postId = activeCommentsPostId;
    const onClose = () => setActiveCommentsPostId(null);
    const [text, setText] = useState('');
    const [replyingTo, setReplyingTo] = useState<GossipComment | null>(null);
    const [reactingCommentId, setReactingCommentId] = useState<string | null>(null);
    const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const [comments, setComments] = useState<GossipComment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    // Realtime Comments Listener
    useEffect(() => {
        if (!postId) {
            setComments([]);
            return;
        }

        setIsLoadingComments(true);
        const commentsRef = query(ref(rtdb, `comments/${postId}`), orderByChild('timestamp'));

        const unsubscribe = onValue(commentsRef, (snapshot) => {
            const data = snapshot.val();
            console.log("CommentsSheet: Fetching for postId:", postId, "Data exists:", !!data, "Data:", data);
            if (data) {
                const loadedComments = Object.values(data) as GossipComment[];
                // Sort by timestamp desc (newest first) or asc? Usually comments are Oldest -> Newest (asc). 
                // Chat style is usually Newest at bottom.
                // Let's keep existing order behavior: Array.
                // If data is object, Object.values order is not guaranteed. Sort it.
                loadedComments.sort((a, b) => a.timestamp - b.timestamp);
                setComments(loadedComments);
            } else {
                setComments([]);
            }
            setIsLoadingComments(false);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !postId) return;

        const replyToData = replyingTo ? {
            id: replyingTo.id,
            username: replyingTo.author.username,
            text: replyingTo.text
        } : undefined;

        addComment(postId, text.trim());
        setText('');
        setReplyingTo(null);
    };

    // Auto-focus input when opening or replying
    useEffect(() => {
        if ((postId || replyingTo) && inputRef.current) {
            inputRef.current.focus();
        }
    }, [postId, replyingTo]);

    return (
        <AnimatePresence>
            {postId && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[201] h-[85%] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                            <div className="flex flex-col">
                                <span className="font-display font-bold text-xl text-zinc-900">{t('comment.thread')}</span>
                                <span className="text-xs text-zinc-500 font-medium">{comments.length} {t('post.comments').toLowerCase()}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto pt-4 pb-12 flex flex-col gap-1">
                            {comments.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-2 px-6 text-center">
                                    <p className="text-sm font-medium">{isLoadingComments ? "Loading comments..." : t('comment.empty')}</p>
                                </div>
                            ) : (
                                comments.map((comment: GossipComment) => (
                                    <div key={comment.id} className="relative group/comment group select-none">
                                        <motion.div
                                            drag="x"
                                            dragConstraints={{ left: -100, right: 0 }}
                                            dragElastic={0.4}
                                            dragSnapToOrigin
                                            onDragEnd={(_, info) => {
                                                if (info.offset.x < -50) {
                                                    setReplyingTo(comment);
                                                }
                                            }}
                                            onPointerDown={(_e) => {
                                                const timer = setTimeout(() => {
                                                    setReactingCommentId(comment.id);
                                                    if (window.navigator.vibrate) window.navigator.vibrate(50);
                                                }, 600);

                                                const cancel = () => {
                                                    clearTimeout(timer);
                                                    window.removeEventListener('pointerup', cancel);
                                                    window.removeEventListener('pointermove', cancel);
                                                    window.removeEventListener('pointercancel', cancel);
                                                };

                                                window.addEventListener('pointerup', cancel);
                                                window.addEventListener('pointermove', (e) => {
                                                    if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5) {
                                                        cancel();
                                                    }
                                                });
                                                window.addEventListener('pointercancel', cancel);
                                            }}
                                            whileTap={{ scale: 0.99, backgroundColor: 'rgba(0,0,0,0.02)' }}
                                            className="flex gap-3 bg-white relative z-10 py-3 px-6 cursor-grab active:cursor-grabbing"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex-shrink-0 overflow-hidden mt-0.5 shadow-sm border border-zinc-100 relative">
                                                {comment.author.avatar ? (
                                                    <img src={comment.author.avatar} alt={comment.author.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400 font-bold text-xs uppercase">
                                                        {(comment.author.username.startsWith('@') ? comment.author.username[1] : comment.author.username[0]) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-black text-zinc-900 truncate max-w-[150px]">{comment.author.username}</span>
                                                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                            {new Date(comment.timestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {comment.replyTo && (
                                                    <div className="bg-zinc-50 border-l-[3px] border-zinc-900/10 px-3 py-2 my-1 rounded-r-xl max-w-[95%] shadow-sm">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                                                            {comment.replyTo.username.startsWith('@') ? comment.replyTo.username : `@${comment.replyTo.username}`}
                                                        </p>
                                                        <p className="text-[11px] text-zinc-500 line-clamp-1 italic font-medium">"{comment.replyTo.text}"</p>
                                                    </div>
                                                )}
                                                <div className="relative inline-block pr-2">
                                                    <p className="text-sm text-zinc-800 leading-relaxed font-medium whitespace-pre-wrap break-words">{comment.text}</p>

                                                    <AnimatePresence>
                                                        {comment.userReaction && (
                                                            <motion.div
                                                                initial={{ scale: 0, opacity: 0, y: 10 }}
                                                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                                                exit={{ scale: 0, opacity: 0 }}
                                                                whileHover={{ scale: 1.2 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="absolute -bottom-4 -right-2 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-zinc-100 rounded-full px-2 py-0.5 min-w-[28px] h-7 flex items-center justify-center text-sm cursor-pointer z-30 hover:border-zinc-200 transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setReactingCommentId(comment.id);
                                                                }}
                                                            >
                                                                <span className="leading-none">{comment.userReaction}</span>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Swipe-to-reply indicator */}
                                        <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center pointer-events-none pr-6">
                                            <div className="flex flex-col items-center gap-1 opacity-20">
                                                <ReplyIcon size={22} className="text-zinc-900" />
                                                <span className="text-[8px] font-black uppercase text-zinc-900">Reply</span>
                                            </div>
                                        </div>

                                        <div className="absolute top-0 right-0 z-[100]">
                                            <ReactionPicker
                                                visible={reactingCommentId === comment.id}
                                                position="relative"
                                                onSelect={(emoji) => {
                                                    if (postId && reactingCommentId) {
                                                        addCommentReaction(postId, reactingCommentId, emoji);
                                                        setReactingCommentId(null);
                                                    }
                                                }}
                                                onClose={() => setReactingCommentId(null)}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-zinc-100 pb-10 flex flex-col gap-2 shrink-0">
                            <AnimatePresence>
                                {replyingTo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="bg-zinc-50 rounded-xl p-3 flex items-center justify-between border border-zinc-200"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-black">Replying to @{replyingTo.author.username}</span>
                                            <p className="text-xs text-zinc-500 line-clamp-1 italic">"{replyingTo.text}"</p>
                                        </div>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
                                        >
                                            <X size={14} className="text-zinc-400" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder={t('comment.placeholder')}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-5 pr-12 py-3.5 text-sm font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${showInputEmojiPicker ? 'text-black bg-zinc-200' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'}`}
                                    >
                                        <Smile size={20} />
                                    </button>

                                    <div className="absolute bottom-full right-0 mb-4 z-[210]">
                                        <ReactionPicker
                                            visible={showInputEmojiPicker}
                                            position="relative"
                                            onSelect={(emoji) => {
                                                setText(prev => prev + emoji);
                                                setShowInputEmojiPicker(false);
                                                inputRef.current?.focus();
                                            }}
                                            onClose={() => setShowInputEmojiPicker(false)}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!text.trim()}
                                    className="p-3.5 bg-black text-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
                                >
                                    <Send size={18} fill="currentColor" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
