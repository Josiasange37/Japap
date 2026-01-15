import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdOverlay({ onClose }: { onClose?: () => void }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white/10 z-20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shrink-0 animate-pulse">
                        <Sparkles size={16} className="text-white fill-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-white uppercase tracking-widest leading-tight">Sponsored</p>
                        <p className="text-[10px] text-zinc-400 font-bold truncate">Check out this viral product!</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={14} className="text-white" />
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
