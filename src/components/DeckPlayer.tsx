import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { useApp } from '../context/AppContext';
import ReactionPicker from './ReactionPicker';

const swipeVariants = {
    enter: (direction: number) => ({
        scale: 0.8,
        y: direction > 0 ? 100 : -100,
        opacity: 0,
        zIndex: 2,
    }),
    center: {
        zIndex: 3,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: {
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1] as const
        }
    },
    exit: (direction: number) => ({
        zIndex: 4,
        x: direction > 0 ? 500 : -500,
        opacity: 0,
        scale: 0.9,
        rotate: direction > 0 ? 15 : -15,
        transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1] as const
        }
    })
};

export default function DeckPlayer() {
    const { posts } = useApp();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    if (posts.length === 0) {
        return <div className="text-center text-zinc-400 mt-20">No posts yet!</div>;
    }

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setIsPlaying(false); // Reset play state
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
        setIsPlaying(false);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);
    const [reactionPickerTarget, setReactionPickerTarget] = useState<{ postId: string, commentId?: string } | null>(null);

    const { likePost, dislikePost, reactToPost, reactToComment, setActiveCommentsPostId, setActiveSharePost } = useApp();
    const handleLike = (id: string) => {
        likePost(id);
    };

    const handleDislike = (id: string) => {
        dislikePost(id);
    }

    const handleReactionSelect = (emoji: string) => {
        if (reactionPickerTarget) {
            if (reactionPickerTarget.commentId) {
                reactToComment(reactionPickerTarget.postId, reactionPickerTarget.commentId, emoji);
            } else {
                reactToPost(reactionPickerTarget.postId, emoji);
            }
            setReactionPickerTarget(null);
        }
    };

    const handleShare = () => {
        setActiveSharePost({ caption: activePost.caption || '', url: window.location.href });
    };

    const activePost = posts[currentIndex];

    // Calculate next indices safely
    const nextIndex = (currentIndex + 1) % posts.length;
    const nextNextIndex = (currentIndex + 2) % posts.length;

    const nextPost = posts[nextIndex];
    const nextNextPost = posts[nextNextIndex];

    return (
        <div className="relative w-full h-full flex items-center justify-center perspective-[1200px] mx-auto overflow-hidden pt-20 pb-10">

            {/* Background Stack 2 */}
            {posts.length > 2 && (
                <motion.div
                    key={`bg2-${nextNextPost.id}`}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    initial={{ scale: 0.85, y: -70, opacity: 0 }}
                    animate={{
                        scale: 0.9,
                        y: -70,
                        zIndex: 1,
                        opacity: 0.5
                    }}
                    transition={{ duration: 0.4 }}
                >
                    <Card
                        post={nextNextPost}
                        isPlaying={false}
                        onTogglePlay={() => { }}
                        onNext={() => { }}
                        onPrev={() => { }}
                        index={nextNextIndex}
                        isBackground={true}
                    />
                </motion.div>
            )}

            {/* Background Stack 1 */}
            {posts.length > 1 && (
                <motion.div
                    key={`bg1-${nextPost.id}`}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    initial={{ scale: 0.9, y: -35, opacity: 0.3 }}
                    animate={{
                        scale: 0.95,
                        y: -35,
                        zIndex: 2,
                        opacity: 0.8
                    }}
                    transition={{ duration: 0.4 }}
                >
                    <Card
                        post={nextPost}
                        isPlaying={false}
                        onTogglePlay={() => { }}
                        onNext={() => { }}
                        onPrev={() => { }}
                        index={nextIndex}
                        isBackground={true}
                    />
                </motion.div>
            )}

            {/* Active Card */}
            <AnimatePresence custom={direction} mode="popLayout">
                <motion.div
                    key={activePost.id}
                    custom={direction}
                    variants={swipeVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full z-30 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] rounded-[30px]"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.9}
                    onDragEnd={(_, { offset, velocity }) => {
                        const swipe = offset.x;
                        const v = velocity.x;
                        if (swipe < -100 || v < -500) {
                            handleNext();
                        } else if (swipe > 100 || v > 500) {
                            handlePrev();
                        }
                    }}
                    whileDrag={{ scale: 1.02, rotate: direction * 2 }}
                >
                    <Card
                        post={activePost}
                        isPlaying={isPlaying}
                        onTogglePlay={togglePlay}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        onLike={() => handleLike(activePost.id)}
                        onDislike={() => handleDislike(activePost.id)}
                        onComment={() => setActiveCommentsPostId(activePost.id)}
                        onReact={() => setReactionPickerTarget({ postId: activePost.id })}
                        onShare={handleShare}
                        index={currentIndex}
                    />
                </motion.div>
            </AnimatePresence>

            <ReactionPicker
                visible={!!reactionPickerTarget}
                onSelect={handleReactionSelect}
                onClose={() => setReactionPickerTarget(null)}
            />

            {/* Hidden Preloading */}
            <div className="hidden pointer-events-none opacity-0">
                {nextPost && nextPost.type === 'image' && <img src={nextPost.content} alt="preload" />}
                {nextPost && nextPost.type === 'video' && <video src={nextPost.content} preload="auto" />}
                {nextNextPost && nextNextPost.type === 'image' && <img src={nextNextPost.content} alt="preload" />}
            </div>
        </div>
    );
}
