import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const REACTIONS = ['🔥', '😂', '❤️', '👏', '😮', '😢'];

interface ReactionPickerProps {
    visible: boolean;
    onSelect: (emoji: string) => void;
    onClose: () => void;
    position?: 'bottom' | 'relative';
}

export default function ReactionPicker({ visible, onSelect, onClose, position = 'bottom' }: ReactionPickerProps) {
    if (!visible) return null;

    return (
        <AnimatePresence>
            {visible && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className={cn(
                            "bg-white dark:bg-zinc-900 rounded-full shadow-2xl border border-zinc-200 dark:border-zinc-800 p-1.5 flex gap-1 z-[101]",
                            position === 'relative' ? "absolute top-0 right-0 -translate-y-full mb-2" : "absolute bottom-16 right-0"
                        )}
                    >
                        {REACTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(emoji);
                                }}
                                className="w-9 h-9 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-90"
                            >
                                {emoji}
                            </button>
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
