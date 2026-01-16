import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AdUnit: React.FC<AdUnitProps> = ({
    slot,
    format = 'auto',
    responsive = true,
    className = '',
    style = {}
}) => {
    const adRef = useRef<HTMLModElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double initialization in strict mode or re-renders
        if (initialized.current) return;

        try {
            if (window.adsbygoogle && adRef.current && adRef.current.innerHTML === '') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                initialized.current = true;
            }
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    // Use a development placeholder if in dev mode (optional, but good for UI testing)
    const isDev = import.meta.env.DEV;

    return (
        <div className={`ad-container my-4 flex justify-center overflow-hidden ${className}`} style={{ minHeight: '100px', ...style }}>
            {isDev ? (
                <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 w-full h-[250px] flex items-center justify-center text-gray-400 font-mono text-sm rounded-lg">
                    AdSense Placeholder<br />
                    (Slot: {slot})
                </div>
            ) : (
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%' }}
                    data-ad-client="ca-pub-29785056650020804" // Replace with actual ID later or keep centralized
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive={responsive}
                />
            )}
        </div>
    );
};

export default AdUnit;
