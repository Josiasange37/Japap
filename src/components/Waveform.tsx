import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const generateRandomBars = useCallback((count: number): number[] => {
    const seed = Math.random();
    return Array.from({ length: count }, (_, i) => {
        const x = (i / count) * seed;
        return Math.sin(x * Math.PI * 4) * 0.5 + 0.5 + Math.random() * 0.2;
    });
}, []);

export default function Waveform({ isPlaying }: { isPlaying: boolean }) {
    // Generate random heights for bars
    const barCount = 40;
    const [bars, setBars] = useState<number[]>(generateRandomBars(barCount));

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setBars(prev => prev.map(h => {
                const change = (Math.random() - 0.5) * 0.5;
                return Math.max(0.1, Math.min(1, h + change));
            }));
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="flex items-center gap-[2px] h-8 w-full opacity-60">
            {bars.map((height, i) => (
                <motion.div
                    key={i}
                    className="rounded-full w-[3px]"
                    animate={{
                        height: `${height * 100}%`,
                        opacity: isPlaying ? 0.8 + (height * 0.2) : 0.3
                    }}
                    transition={{ duration: 0.1 }}
                    style={{
                        backgroundColor: i < barCount * 0.3 ? '#000000' : '#a1a1aa' // Black and Zinc-400
                    }}
                />
            ))}
        </div>
    );
}
