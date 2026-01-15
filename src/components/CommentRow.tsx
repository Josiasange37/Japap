import React from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Reply as ReplyIcon } from 'lucide-react';
import type { GossipComment } from '../types';
import ReactionPicker from './ReactionPicker';
import { getUserColor } from '../utils/colors';

interface CommentRowProps {
    comment: GossipComment;
    onReply: (comment: GossipComment) => void;
    onReactionSelect: (commentId: string, emoji: string) => void;
    activeReactionId: string | null;
    setActiveReactionId: (id: string | null) => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

// Helper to highlight mentions
const formatCommentText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('@')) {
            return (
                <span key={index} className="text-blue-400 font-bold cursor-pointer hover:underline">
                    {part}
                </span>
            );
        }
        return part;
    });
};

export default function CommentRow({
    comment,
    onReply,
    onReactionSelect,
    activeReactionId,
    setActiveReactionId,
    containerRef
}: CommentRowProps) {
    const x = useMotionValue(0);
    // WhatsApp style: as you pull, it scales up, fades in, and rotates slightly to straight
    const scale = useTransform(x, [0, 60], [0.5, 1.2]);
    const opacity = useTransform(x, [0, 60], [0, 1]);

    // We want the icon to stay 'fixed' visually relative to the left edge but revealed by the swipe
    // But actually, typically the icon sits behind. 

    return (
        <div className="relative group/comment group select-none">
            {/* Swipe-to-reply indicator */}
            <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-start pointer-events-none pl-6 z-0">
                <motion.div
                    style={{ scale, opacity }}
                    className="flex flex-col items-center gap-1"
                >
                    <ReplyIcon size={24} className="text-white transform scale-x-[-1]" />
                </motion.div>
            </div>

            <motion.div
                style={{ x }}
                drag="x"
                dragConstraints={{ left: 0, right: 80 }}
                dragElastic={0.2}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                    if (info.offset.x > 50) {
                        onReply(comment);
                    }
                }}
                onPointerDown={() => {
                    const container = containerRef.current;
                    const timer = setTimeout(() => {
                        setActiveReactionId(comment.id);
                        if (window.navigator.vibrate) window.navigator.vibrate(50);
                    }, 500);

                    const cancel = () => {
                        clearTimeout(timer);
                        window.removeEventListener('pointerup', cancel);
                        window.removeEventListener('pointermove', cancel);
                        window.removeEventListener('pointercancel', cancel);
                        if (container) container.removeEventListener('scroll', cancel);
                    };

                    window.addEventListener('pointerup', cancel);
                    window.addEventListener('pointermove', (e) => {
                        if (Math.abs(e.movementX) > 10 || Math.abs(e.movementY) > 10) {
                            cancel();
                        }
                    });
                    if (container) container.addEventListener('scroll', cancel, { once: true });
                    window.addEventListener('pointercancel', cancel);
                }}
                whileTap={{ scale: 0.99, backgroundColor: 'rgba(255,255,255,0.02)' }}
                className="flex gap-3 bg-[#09090b] relative z-10 py-3 px-6 cursor-grab active:cursor-grabbing w-full"
            >
                <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0 overflow-hidden mt-0.5 shadow-sm border border-white/5 relative">
                    {comment.author.avatar ? (
                        <img src={comment.author.avatar} alt={comment.author.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 font-bold text-xs uppercase">
                            {(comment.author.username.startsWith('@') ? comment.author.username[1] : comment.author.username[0]) || '?'}
                        </div>
                    )}
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-white truncate max-w-[150px]">{comment.author.username}</span>
                            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    {comment.replyTo && (
                        <div
                            className="bg-[#1f2c34] border-l-4 rounded-md px-3 py-2 mb-2 max-w-full shadow-sm bg-opacity-40"
                            style={{ borderColor: getUserColor(comment.replyTo.username) }}
                        >
                            <p
                                className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
                                style={{ color: getUserColor(comment.replyTo.username) }}
                            >
                                {comment.replyTo.username.startsWith('@') ? comment.replyTo.username : `@${comment.replyTo.username}`}
                            </p>
                            <p className="text-xs text-zinc-300 line-clamp-1">{comment.replyTo.text}</p>
                        </div>
                    )}
                    <div className="relative inline-block pr-2 w-full">
                        <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                            {formatCommentText(comment.text)}
                        </p>

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
                                        setActiveReactionId(comment.id);
                                    }}
                                >
                                    <span className="leading-none">{comment.userReaction}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <div className="absolute top-0 right-0 z-[100]">
                <ReactionPicker
                    visible={activeReactionId === comment.id}
                    position="relative"
                    onSelect={(emoji) => {
                        onReactionSelect(comment.id, emoji);
                    }}
                    onClose={() => setActiveReactionId(null)}
                />
            </div>
        </div>
    );
}
