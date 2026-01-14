import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart, Reply } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CommentSection() {
    const { activeCommentsPostId, setActiveCommentsPostId, posts, addComment, user } = useApp();
    const [text, setText] = useState('');

    const post = posts.find(p => p.id === activeCommentsPostId);
    if (!activeCommentsPostId) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        addComment(activeCommentsPostId, text);
        setText('');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveCommentsPostId(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="relative w-full max-w-xl bg-[var(--bg)] h-[80vh] sm:h-[600px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-[var(--border)]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--bg)] z-10">
                        <div>
                            <h3 className="font-display text-xl font-black italic">Gossip Thread</h3>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{post?.stats.comments} REACTIONS</p>
                        </div>
                        <button onClick={() => setActiveCommentsPostId(null)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {post?.commentsList && post.commentsList.length > 0 ? (
                            post.commentsList.map((comment) => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex-shrink-0 flex items-center justify-center font-bold border border-[var(--border)]">
                                        {comment.author.avatar ? <img src={comment.author.avatar} className="w-full h-full rounded-full" /> : <span>{comment.author.username[0].toUpperCase()}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-[var(--bg-secondary)] p-4 rounded-3xl rounded-tl-none">
                                            <p className="text-[11px] font-black uppercase text-[var(--brand)] mb-1">{comment.author.username}</p>
                                            <p className="text-[15px] leading-relaxed font-medium">{comment.text}</p>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 px-1 text-[11px] font-bold text-[var(--text-muted)]">
                                            <span>{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <button className="hover:text-[var(--text)] transition-colors flex items-center gap-1"><Heart size={12} /> LIKE</button>
                                            <button className="hover:text-[var(--text)] transition-colors flex items-center gap-1"><Reply size={12} /> REPLY</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                                <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle size={40} />
                                </div>
                                <p className="font-bold">No reactions yet. Be the first to spill!</p>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]">
                        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex-shrink-0 flex items-center justify-center">
                                {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : <span className="text-xs">👤</span>}
                            </div>
                            <input
                                type="text"
                                placeholder="Spill your thoughts..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="flex-1 bg-[var(--bg-secondary)] px-4 py-3 rounded-2xl outline-none font-medium focus:ring-2 focus:ring-[var(--brand)] transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!text.trim()}
                                className={`p-3 rounded-full transition-all ${text.trim() ? 'bg-[var(--brand)] text-white shadow-lg' : 'bg-[var(--border)] text-[var(--text-muted)]'}`}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

import { MessageCircle } from 'lucide-react';
