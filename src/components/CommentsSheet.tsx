import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Smile } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import ReactionPicker from './ReactionPicker';
import CommentRow from './CommentRow';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { rtdb } from '../firebase';
import type { GossipComment } from '../types';


export default function CommentsSheet() {
    const { addComment, activeCommentsPostId, setActiveCommentsPostId, addCommentReaction, user } = useApp();
    const { t } = useLanguage();
    const postId = activeCommentsPostId;
    const onClose = () => setActiveCommentsPostId(null);
    const [text, setText] = useState('');
    const [replyingTo, setReplyingTo] = useState<GossipComment | null>(null);
    const [reactingCommentId, setReactingCommentId] = useState<string | null>(null);
    const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [comments, setComments] = useState<GossipComment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    // Realtime Comments Listener
    useEffect(() => {
        if (!postId) {
            return;
        }

        setIsLoadingComments(true);
        const commentsRef = query(ref(rtdb, `comments/${postId}`), orderByChild('timestamp'));

        const unsubscribe = onValue(commentsRef, (snapshot) => {
            const data = snapshot.val();
            console.log("CommentsSheet: Fetching for postId:", postId, "Data exists:", !!data, "Data:", data);
            if (data) {
                const loadedComments = Object.values(data) as GossipComment[];

                // Map userReactions to userReaction for the current user
                if (user?.pseudo) {
                    loadedComments.forEach(comment => {
                        if (comment.userReactions && comment.userReactions[user.pseudo]) {
                            comment.userReaction = comment.userReactions[user.pseudo];
                        }
                    });
                }

                loadedComments.sort((a, b) => a.timestamp - b.timestamp);
                console.log("CommentsSheet: loadedComments:", loadedComments);
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

        if (!text.trim() || !postId) return;

        if (replyingTo) {
            addComment(postId, text.trim(), replyingTo);
        } else {
            addComment(postId, text.trim());
        }

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
                        className="fixed bottom-0 left-0 right-0 bg-[#09090b] rounded-t-[32px] z-[201] h-[85%] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden border-t border-white/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div className="flex flex-col">
                                <span className="font-display font-bold text-xl text-white">{t('comment.thread')}</span>
                                <span className="text-xs text-zinc-400 font-medium">{comments.length} {t('post.comments').toLowerCase()}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div ref={containerRef} className="flex-1 overflow-y-auto pt-4 pb-12 flex flex-col gap-1 [&::-webkit-scrollbar]:hidden scrollbar-none">
                            {comments.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2 px-6 text-center">
                                    <p className="text-sm font-medium">{isLoadingComments ? "Loading comments..." : t('comment.empty')}</p>
                                </div>
                            ) : (
                                comments.map((comment: GossipComment) => (
                                    <CommentRow
                                        key={comment.id}
                                        comment={comment}
                                        onReply={(c) => {
                                            setReplyingTo(c);
                                        }}
                                        onReactionSelect={(commentId, emoji) => {
                                            if (postId) {
                                                addCommentReaction(postId, commentId, emoji);
                                                setReactingCommentId(null);
                                            }
                                        }}
                                        activeReactionId={reactingCommentId}
                                        setActiveReactionId={setReactingCommentId}
                                        containerRef={containerRef}
                                    />
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#09090b] border-t border-white/5 pb-10 flex flex-col gap-2 shrink-0 z-50 sticky bottom-0">
                            <AnimatePresence>
                                {replyingTo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="bg-[#1f2c34] rounded-lg p-2.5 flex items-center justify-between border-l-4 border-[#00a884] shadow-lg mb-1"
                                    >
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-[11px] font-bold text-[#00a884]">Replying to @{replyingTo.author.username}</span>
                                            <p className="text-xs text-zinc-300 line-clamp-1 italic truncate">"{replyingTo.text}"</p>
                                        </div>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="p-1.5 hover:bg-white/10 rounded-full transition-colors ml-2"
                                        >
                                            <X size={16} className="text-zinc-400" />
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
                                        className="w-full bg-zinc-900 border border-white/10 rounded-full pl-5 pr-12 py-3.5 text-sm font-medium text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${showInputEmojiPicker ? 'text-white bg-white/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/10'}`}
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
