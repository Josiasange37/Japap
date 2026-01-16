import React from 'react';
import { motion } from 'framer-motion';

interface InfiniteScrollLoaderProps {
    isLoading: boolean;
    hasMore: boolean;
    error?: string | null;
    className?: string;
}

export default function InfiniteScrollLoader({ 
    isLoading, 
    hasMore, 
    error, 
    className = "" 
}: InfiniteScrollLoaderProps) {
    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-red-500 rounded-full" />
                </div>
                <p className="text-red-500 font-bold text-sm mb-2">Failed to load more posts</p>
                <p className="text-[var(--text-muted)] text-xs">{error}</p>
            </div>
        );
    }

    if (!hasMore) {
        return (
            <div className="py-10 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                <div className="w-12 h-1 bg-[var(--border)] rounded-full mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">You're all caught up</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-[var(--bg-secondary)] border-t-[var(--brand)] rounded-full mb-4"
                />
                <p className="text-[var(--text-muted)] font-medium text-sm">Loading more scoops...</p>
            </div>
        );
    }

    // Intersection observer target - invisible element to trigger loading
    return (
        <div 
            className="h-1 w-full" 
            aria-label="Load more posts trigger"
        />
    );
}