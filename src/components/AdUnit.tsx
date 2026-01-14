import React, { useEffect } from 'react';

interface AdUnitProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    className?: string;
    style?: React.CSSProperties;
}

export default function AdUnit({ slot, format = 'auto', className, style }: AdUnitProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className={`ad-container overflow-hidden rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center p-4 border border-zinc-200 dark:border-zinc-800 ${className}`}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">Advertisement</span>
            <ins className="adsbygoogle"
                style={{ display: 'block', minWidth: '250px', minHeight: '100px', ...style }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"></ins>
        </div>
    );
}
