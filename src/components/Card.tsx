import { motion } from 'framer-motion';
import { Play, Pause, Heart, MessageCircle, Share2, ThumbsDown, SmilePlus } from 'lucide-react';
import Waveform from './Waveform';
import type { Post } from '../types';

interface CardProps {
    post: Post;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrev: () => void;
    onLike?: () => void;
    onDislike?: () => void;
    onComment?: () => void;
    onReact?: () => void;
    onShare?: () => void;
    index: number;
    isBackground?: boolean;
}

export default function Card({ post, isPlaying, onTogglePlay, onLike, onDislike, onComment, onReact, onShare, isBackground = false }: CardProps) {
    const isAudio = post.type === 'audio';
    const isImage = post.type === 'image';
    const isVideo = post.type === 'video';
    const isText = post.type === 'text';

    return (
        <div className={`relative w-full h-full bg-white rounded-[30px] overflow-hidden flex flex-col border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all ${isBackground ? 'brightness-95 grayscale-[0.3] shadow-none' : 'ring-1 ring-black/5'}`}>

            {/* Background Content */}
            {!isBackground && (
                <div className="absolute inset-0 rounded-[30px] shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] pointer-events-none z-20" />
            )}

            {isImage && (
                <div className="absolute inset-0">
                    <img src={post.content} className="w-full h-full object-cover" style={{ objectPosition: 'center' }} alt="post" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60" />
                </div>
            )}

            {isVideo && (
                <div className="absolute inset-0 bg-black">
                    <video
                        src={post.content}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                        loop
                        muted={false}
                        playsInline
                        ref={(ref) => {
                            if (ref) {
                                if (isPlaying) {
                                    ref.play().catch(e => console.log("Autoplay prevented", e));
                                } else {
                                    ref.pause();
                                }
                            }
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60" />
                </div>
            )}

            {/* Gradient fallback for non-image/video posts */}
            {!(isImage || isVideo) && (
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none transition-colors duration-500"
                    style={{ background: `linear-gradient(to bottom, ${post.bgGradient || '#eff6ff'}, #ffffff)` }}
                />
            )}

            {/* Card Content */}
            <div className={`flex-1 px-8 flex flex-col relative z-20 pt-8 ${isText ? 'justify-center items-center text-center' : 'justify-end pb-24'}`}>

                {isText && (
                    <div className="mb-12">
                        <motion.h1
                            layoutId={`text-${post.id}`}
                            className="font-display text-3xl font-black text-black leading-tight"
                        >
                            "{post.content}"
                        </motion.h1>
                    </div>
                )}

                {/* Social Actions */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-3 group/actions">
                    <div className="flex flex-col items-center gap-1 group/btn">
                        <button
                            onClick={onLike}
                            onContextMenu={(e) => { e.preventDefault(); onReact?.(); }}
                            className={`p-3 backdrop-blur-md rounded-full hover:scale-110 active:scale-90 transition-all shadow-sm relative border ${(isImage || isVideo)
                                ? 'bg-black/20 border-white/20 text-white'
                                : 'bg-white/60 border-zinc-200 text-zinc-900'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${post.liked ? 'fill-red-500 text-red-500' : 'currentColor'}`} />
                        </button>
                        <span className={`text-[10px] font-black ${(isImage || isVideo) ? 'text-white drop-shadow-md' : 'text-zinc-500'}`}>{post.stats.likes}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 group/btn">
                        <button
                            onClick={onDislike}
                            className={`p-3 backdrop-blur-md rounded-full hover:scale-110 active:scale-90 transition-all shadow-sm border ${(isImage || isVideo)
                                ? 'bg-black/20 border-white/20 text-white'
                                : 'bg-white/60 border-zinc-200 text-zinc-900'
                                }`}
                        >
                            <ThumbsDown className={`w-5 h-5 ${post.disliked ? 'fill-zinc-800 text-zinc-800' : 'currentColor'}`} />
                        </button>
                        <span className={`text-[10px] font-black ${(isImage || isVideo) ? 'text-white drop-shadow-md' : 'text-zinc-500'}`}>{post.stats.dislikes}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1 group/btn">
                        <button
                            onClick={onComment}
                            className={`p-3 backdrop-blur-md rounded-full hover:scale-110 active:scale-90 transition-all shadow-sm border ${(isImage || isVideo)
                                ? 'bg-black/20 border-white/20 text-white'
                                : 'bg-white/60 border-zinc-200 text-zinc-900'
                                }`}
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                        <span className={`text-[10px] font-black ${(isImage || isVideo) ? 'text-white drop-shadow-md' : 'text-zinc-500'}`}>{post.stats.comments}</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={onReact}
                            className={`p-3 backdrop-blur-md rounded-full hover:scale-110 active:scale-90 transition-all shadow-sm border ${(isImage || isVideo)
                                ? 'bg-black/20 border-white/20 text-white'
                                : 'bg-white/60 border-zinc-200 text-zinc-900'
                                }`}
                        >
                            {post.userReaction ? (
                                <span className="text-xl leading-none">{post.userReaction}</span>
                            ) : (
                                <SmilePlus className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <button
                        onClick={onShare}
                        className={`p-3 backdrop-blur-md rounded-full hover:scale-110 active:scale-90 transition-all shadow-sm border ${(isImage || isVideo)
                            ? 'bg-black/20 border-white/20 text-white'
                            : 'bg-white/60 border-zinc-200 text-zinc-900'
                            }`}
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {!isText && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <img src={post.author.avatar || ''} className="w-full h-full object-cover" alt={post.author.username} />
                            </div>
                            <span className={`font-bold text-sm ${(isImage || isVideo) ? 'text-white' : 'text-black'}`}>{post.author.username}</span>
                        </div>
                        {post.caption && (
                            <p className={`text-sm font-medium leading-relaxed ${(isImage || isVideo) ? 'text-white/90 drop-shadow-sm' : 'text-zinc-600'}`}>
                                {post.caption}
                            </p>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Audio Player Section (Only for Audio type) */}
            {isAudio && (
                <div className="p-4 relative z-30">
                    <audio
                        src={post.content}
                        ref={(ref) => {
                            if (ref) {
                                if (isPlaying) ref.play().catch(e => console.log("Audio play prevented", e));
                                else ref.pause();
                            }
                        }}
                        loop
                    />
                    <div className="bg-white/80 rounded-[24px] p-5 flex items-center gap-5 shadow-lg shadow-zinc-200/50 border border-white/50 backdrop-blur-md relative overflow-hidden group ring-1 ring-black/5">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md ring-1 ring-black/5">
                            <img src={post.cover || post.author.avatar || ''} alt="cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        <div className="flex-1 flex flex-col justify-center min-w-0 gap-2">
                            <div className="flex justify-between items-start">
                                <div className="min-w-0">
                                    <h3 className="text-zinc-900 font-bold text-base truncate pr-2">{post.title}</h3>
                                    <p className="text-zinc-400 text-xs truncate font-medium">{post.artist}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={onTogglePlay} className="text-black hover:scale-110 transition-transform bg-zinc-100 p-1.5 rounded-full">
                                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex-1 h-6 flex items-center">
                                    <Waveform isPlaying={isPlaying} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
