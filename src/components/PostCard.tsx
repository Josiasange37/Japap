import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    MessageCircle,
    Share2,
    Repeat2,
    MoreHorizontal,
    ThumbsDown,
    Volume2,
    AlertCircle,
    Flag,
    Copy,
    ExternalLink,
    Trash2,
    SmilePlus,
    ChevronRight,
} from 'lucide-react';
import type { Post } from '../types';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { parseTextWithHashtags } from '../utils/text';
import { auth } from '../firebase';

import ReactionPicker from './ReactionPicker';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const { likePost, dislikePost, setActiveCommentsPostId, showToast, deletePost, user, addReaction } = useApp();
    const { t } = useLanguage();
    const [isLiked, setIsLiked] = useState(post.liked);
    const [isDisliked, setIsDisliked] = useState(post.disliked);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isReshared, setIsReshared] = useState(false);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);



    const isRiskyContent = post.content.toLowerCase().includes('leak') ||
        post.content.toLowerCase().includes('scandal') ||
        post.content.length > 500;

    // Check if post is processing media
    const isProcessing = (post as Post & { processing?: boolean; processingProgress?: number; processingError?: boolean }).processing || false;
    const processingProgress = (post as Post & { processing?: boolean; processingProgress?: number; processingError?: boolean }).processingProgress || 0;
    const processingError = (post as Post & { processing?: boolean; processingProgress?: number; processingError?: boolean }).processingError || false;

    // Sync local state with real data when it changes
    React.useEffect(() => {
        setIsLiked(post.liked);
        setIsDisliked(post.disliked);
    }, [post.liked, post.disliked]);

    const handleDoubleTap = () => {
        if (!isLiked) {
            handleLike();
        }
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);
    };

    const handleLike = () => {
        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        if (isDisliked && newIsLiked) setIsDisliked(false);
        likePost(post.id);
    };

    const handleDislike = () => {
        // Optimistic update
        const newIsDisliked = !isDisliked;
        setIsDisliked(newIsDisliked);
        if (isLiked && newIsDisliked) setIsLiked(false);
        dislikePost(post.id);
    };

    const handleReport = () => {
        showToast("Report submitted. Our shadow mods are on it");
        setShowOptions(false);
    };

    const handleShare = async (method: 'native' | 'copy') => {
        const shareText = `Vient voir le kongosa du moment sur JAPAP\n\n"${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"\n\nCheck ça ici: `;
        const shareUrl = `${window.location.origin}/post/${post.id}`;

        if (method === 'native' && navigator.share) {
            try {
                await navigator.share({
                    title: 'JAPAP - Le Kongosa du Mboa',
                    text: shareText,
                    url: shareUrl,
                });
                showToast("Partagé avec succès");
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareText}${shareUrl}`);
                showToast("Lien du kongosa copié");
            } catch {
                showToast("Échec de la copie. Réessaie.");
            }
        }
        setShowShareModal(false);
    };

    const handleReshare = () => {
        setIsReshared(!isReshared);
        if (!isReshared) {
            showToast("Scoop repartagé sur ton profil");
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[var(--card)] border-b md:border md:rounded-[32px] border-[var(--border)] mb-0 md:mb-6 group transition-all ${isRiskyContent ? 'border-amber-500/20 shadow-inner' : ''}`}
        >
            {isProcessing && (
                <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-4 py-2 flex items-center justify-between md:rounded-t-[32px] overflow-hidden relative">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Processing Scoop...</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-[var(--text-muted)] tracking-tighter">{processingProgress}%</span>
                        <div className="w-16 h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border)]">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${processingProgress}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                            />
                        </div>
                    </div>
                    {/* Animated Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
            )}

            {processingError && (
                <div className="bg-red-500/10 px-4 py-1.5 flex items-center gap-2 md:rounded-t-[32px]">
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-600">Processing Failed</span>
                </div>
            )}

            {isRiskyContent && !isProcessing && (
                <div className="bg-amber-500/10 px-4 py-1.5 flex items-center gap-2 md:rounded-t-[32px]">
                    <AlertCircle size={14} className="text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Sensitive Content - Ads Offline</span>
                </div>
            )}

            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden flex items-center justify-center font-bold">
                        {post.author.avatar ? (
                            <img src={post.author.avatar} alt={post.author.username} className="w-full h-full object-cover" />
                        ) : (
                            <span>{(post.author.username || 'A')[0].toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm hover:underline cursor-pointer">{post.author.username || 'Anonymous'}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] font-medium">
                            {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Gossip
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className={`p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors ${showOptions ? 'bg-[var(--bg-secondary)]' : ''}`}
                    >
                        <MoreHorizontal size={20} className="text-[var(--text-muted)]" />
                    </button>

                    <AnimatePresence>
                        {showOptions && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden"
                            >
                                <button
                                    onClick={handleReport}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <Flag size={18} /> Report Scoop
                                </button>
                                {(post.author.id === user?.pseudo || (post.author.id === auth.currentUser?.uid)) && (
                                    <button
                                        onClick={() => {
                                            deletePost(post.id);
                                            setShowOptions(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors"
                                    >
                                        <Trash2 size={18} /> Delete Scoop
                                    </button>
                                )}
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors">
                                    <AlertCircle size={18} /> Why this ad?
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content - Double Tap Area */}
            <div
                className="px-4 pb-4 relative cursor-pointer"
                onDoubleClick={handleDoubleTap}
            >
                {/* Heart Animation Overlay */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1.5 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute top-1/2 left-1/2 z-20 pointer-events-none"
                        >
                            <Heart size={80} className="fill-pink-500 text-pink-500 drop-shadow-2xl" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {post.type === 'text' && (
                    <p className="text-[17px] leading-relaxed font-normal whitespace-pre-wrap select-none">
                        {parseTextWithHashtags(post.content)}
                    </p>
                )}

                {post.type === 'image' && (
                    <div className="space-y-3">
                        <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] relative">
                            {isProcessing ? (
                                <div className="w-full h-[300px] flex flex-col items-center justify-center relative overflow-hidden bg-[var(--bg-secondary)]">
                                    {/* Skeleton Pulse */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full" />
                                            <div
                                                className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
                                                style={{ clipPath: `inset(0 0 ${100 - processingProgress}% 0)` }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center font-black text-[var(--brand)] text-xs">
                                                {processingProgress}%
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-[var(--text)] to-[var(--text-muted)]">Uploading High Quality</p>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 italic">Patienter pour le nouveau japap...</p>
                                        </div>
                                    </div>
                                </div>
                            ) : processingError ? (
                                <div className="w-full h-[300px] flex flex-col items-center justify-center bg-red-500/5 border-2 border-dashed border-red-500/20 rounded-2xl m-4">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle size={32} className="text-red-500" />
                                    </div>
                                    <p className="text-sm font-black text-red-500 uppercase tracking-widest">Post Failed to Process</p>
                                    <p className="text-[10px] font-bold text-red-500/60 mt-1">Check your connection and try again</p>
                                </div>
                            ) : (
                                <img
                                    src={post.content}
                                    alt="Gossip Media"
                                    className="w-full h-auto max-h-[500px] object-cover"
                                />
                            )}
                        </div>
                        {post.caption && (
                            <p className="text-[15px] font-medium text-[var(--text-muted)] italic">
                                "{post.caption}"
                            </p>
                        )}
                    </div>
                )}

                {post.type === 'video' && (
                    <div className="space-y-3">
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-[var(--border)]">
                            {isProcessing ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-gray-700 border-t-[var(--brand)] rounded-full animate-spin mb-4" />
                                    <p className="text-sm font-bold text-white">Processing video...</p>
                                    <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full bg-[var(--brand)] transition-all duration-300"
                                            style={{ width: `${processingProgress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : processingError ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                        <div className="w-8 h-8 bg-red-500 rounded-full" />
                                    </div>
                                    <p className="text-sm font-bold text-red-500">Failed to process video</p>
                                </div>
                            ) : (
                                <video
                                    src={post.content}
                                    controls
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                    poster={post.author.avatar || undefined}
                                />
                            )}
                        </div>
                        {post.caption && (
                            <p className="text-[15px] font-medium text-[var(--text-muted)] italic">
                                "{post.caption}"
                            </p>
                        )}
                    </div>
                )}

                {post.type === 'audio' && (
                    <div className="space-y-3">
                        <div className="bg-[var(--bg-secondary)] p-6 rounded-2xl flex flex-col items-center gap-4 border border-[var(--border)]">
                            {isProcessing ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 border-4 border-[var(--border)] border-t-[var(--brand)] rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-[var(--text-muted)]">Processing audio...</p>
                                    <div className="w-48 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[var(--brand)] transition-all duration-300"
                                            style={{ width: `${processingProgress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : processingError ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                        <div className="w-8 h-8 bg-red-500 rounded-full" />
                                    </div>
                                    <p className="text-sm font-bold text-red-500">Failed to process audio</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-[var(--brand)] rounded-full flex items-center justify-center text-white">
                                        <Volume2 size={32} />
                                    </div>
                                    <audio
                                        src={post.content}
                                        controls
                                        preload="metadata"
                                        className="w-full h-10"
                                    />
                                </>
                            )}
                        </div>
                        {post.caption && (
                            <p className="text-[15px] font-medium text-[var(--text-muted)] italic text-center">
                                "{post.caption}"
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Reactions Display */}
            {post.reactions && Object.keys(post.reactions).length > 0 && (
                <div className="px-4 py-2 flex gap-2 flex-wrap">
                    {Object.entries(post.reactions).map(([emoji, count]) => (
                        <button
                            key={emoji}
                            onClick={() => addReaction(post.id, emoji)}
                            className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${post.userReaction === emoji
                                ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                                : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:bg-[var(--border)]'
                                }`}
                        >
                            <span>{emoji}</span>
                            <span>{count}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Stats Quick View */}
            <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 text-[11px] font-bold text-[var(--text-muted)]">
                <span>{post.stats.views.toLocaleString()} {t('post.views')}</span>
                <span>{post.stats.comments} {t('post.comments')}</span>
                <span>{Math.round((post.stats.likes / (post.stats.likes + post.stats.dislikes + 1)) * 100)}% {t('post.hot')}</span>
            </div>

            {/* Interactions */}
            <div className="px-2 py-1 flex items-center justify-between border-t border-[var(--border)]">
                <div className="flex items-center gap-1">
                    <ActionButton
                        icon={Heart}
                        active={isLiked}
                        activeColor="text-pink-500"
                        count={Math.max(0, post.stats.likes + (isLiked ? 1 : 0) - (post.liked ? 1 : 0))}
                        onClick={handleLike}
                    />
                    <ActionButton
                        icon={ThumbsDown}
                        active={isDisliked}
                        activeColor="text-blue-500"
                        count={Math.max(0, post.stats.dislikes + (isDisliked ? 1 : 0) - (post.disliked ? 1 : 0))}
                        onClick={handleDislike}
                    />
                    <div className="relative">
                        <ActionButton
                            icon={SmilePlus}
                            onClick={() => setShowReactionPicker(!showReactionPicker)}
                            active={!!post.userReaction}
                            activeColor="text-amber-500"
                        />
                        <ReactionPicker
                            visible={showReactionPicker}
                            onSelect={(emoji) => {
                                addReaction(post.id, emoji);
                                setShowReactionPicker(false);
                            }}
                            onClose={() => setShowReactionPicker(false)}
                            position="relative"
                        />
                    </div>
                    <ActionButton
                        icon={MessageCircle}
                        onClick={() => setActiveCommentsPostId(post.id)}
                        count={post.stats.comments}
                    />
                </div>

                <div className="flex items-center gap-1">
                    <ActionButton
                        icon={Repeat2}
                        active={isReshared}
                        activeColor="text-emerald-500"
                        onClick={handleReshare}
                    />
                    <div className="relative">
                        <ActionButton icon={Share2} onClick={() => setShowShareModal(!showShareModal)} />

                        <AnimatePresence>
                            {showShareModal && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="absolute bottom-14 right-0 w-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden p-2"
                                >
                                    <div className="p-2 border-b border-[var(--border)] mb-1">
                                        <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest text-center">Partager le kongosa</p>
                                    </div>
                                    <button
                                        onClick={() => handleShare('native')}
                                        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold hover:bg-[var(--bg-secondary)] rounded-xl transition-colors active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <ExternalLink size={20} />
                                            <span>Via l'App</span>
                                        </div>
                                        <ChevronRight size={14} className="opacity-30" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('copy')}
                                        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold hover:bg-[var(--bg-secondary)] rounded-xl transition-colors active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Copy size={20} />
                                            <span>Copier le lien</span>
                                        </div>
                                        <ChevronRight size={14} className="opacity-30" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

function ActionButton({
    icon: Icon,
    active,
    activeColor,
    count,
    onClick
}: {
    icon: React.ComponentType<{ size?: number; className?: string }>,
    active?: boolean,
    activeColor?: string,
    count?: number,
    onClick?: () => void
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all hover:bg-[var(--bg-secondary)] ${active ? activeColor : 'text-[var(--text-muted)]'}`}
        >
            <motion.div
                animate={active ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.4 }}
            >
                <Icon size={20} className={active ? 'fill-current' : ''} />
            </motion.div>
            {count !== undefined && <span className="text-sm font-bold">{count}</span>}
        </motion.button>
    );
}
